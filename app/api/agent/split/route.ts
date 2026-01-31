import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from 'next/server'
import { Opik } from "opik"
import { v4 as uuidv4 } from 'uuid'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Initialize Opik Client (Safe Mode)
// Vercel build will fail if we throw on missing keys, so we handle it gracefully.
let opikClient: any = null;
if (process.env.OPIK_API_KEY) {
    try {
        opikClient = new Opik({
            apiKey: process.env.OPIK_API_KEY
        })
    } catch (e) {
        console.warn("Opik init failed:", e);
    }
}

export async function POST(req: Request) {
    const startTime = Date.now()
    const traceId = uuidv4()

    // Start Opik Trace (Mock if client missing)
    const trace = opikClient ? opikClient.trace({
        name: "fairness_split_generation",
        tags: ["fairness_v2", "roomtab-web", `trace:${traceId}`]
    }) : {
        // Mock trace object to prevent crashes
        span: (args: any) => ({ end: () => { } }),
        update: () => { },
        end: () => { }
    }

    try {
        const body = await req.json()
        const { title, expenses, participants, category, description, currency } = body

        // Log Input to Trace
        try {
            trace.update({
                input: {
                    expenses,
                    participants,
                    context: description,
                    category
                },
                tags: ["fairness_v2", category || "general", `trace:${traceId}`]
            })
        } catch (e) {
            console.warn("Opik update warning:", e)
        }

        // 1. Calculate Standard Fairness (Equal Split)
        const totalAmount = expenses.reduce((acc: number, curr: any) => acc + curr.amount, 0)
        const equalShare = totalAmount / (participants.length || 1) // Baseline

        // Define Span for Logic
        const span = trace.span({
            name: "calculate_weights",
            type: "tool"
        })

        // --- LOGIC V2: Multiplicative & Context Aware ---
        const categoryWeights: Record<string, Record<string, number>> = {
            rent: { "Organizer": 1.0, "Non-drinker": 1.0 }, // Rent is robust
            trip: { "Organizer": 0.9, "Arrived late": 0.8 },
            dinner: { "Non-drinker": 0.8, "Left early": 0.5 }
        }

        const financialWeights: Record<string, number> = {
            "Student": 0.7,
            "Intern": 0.8,
            "Unemployed": 0.7,
            "High Earner": 1.25
        }

        const currentCategoryWeights = categoryWeights[category] || {}
        let subsidyActive = false

        const weightedParticipants = participants.map((p: any) => {
            let weight = 1.0
            const reasons: string[] = []

            p.tags.forEach((tag: string) => {
                if (currentCategoryWeights[tag]) {
                    weight *= currentCategoryWeights[tag]
                    reasons.push(`Context: ${tag} (${currentCategoryWeights[tag]}x)`)
                }
                if (financialWeights[tag]) {
                    weight *= financialWeights[tag]
                    reasons.push(`Financial: ${tag} (${financialWeights[tag]}x)`)
                    subsidyActive = true
                }
            })
            return { ...p, weight, reasons }
        })

        const totalWeight = weightedParticipants.reduce((sum: number, p: any) => sum + p.weight, 0)

        // End Logic Span
        span.end()

        let data;
        let modelUsed = "deterministic-v2";
        let agentRecommendedSplit: any[] = [];

        // SKIP LLM if no context is provided to save Quota (Fallback Mode)
        if (!description || description.trim() === "") {
            agentRecommendedSplit = weightedParticipants.map((p: any) => {
                // Calculate share proportional to weight
                const share = (totalAmount * p.weight) / totalWeight;

                return {
                    name: p.name,
                    recommendedShare: Number(share.toFixed(2)),
                    sharePercentage: Number(((p.weight / totalWeight) * 100).toFixed(1)),
                    reasoning: p.reasons.length > 0 ? p.reasons.join(", ") : "Standard Split"
                }
            })

            data = {
                split: agentRecommendedSplit,
                agentSummary: "Context disabled. Using standard weighted fairness logic (Deterministic Mode). No AI Quota used."
            }
        } else {
            // Validated Model from debug_list: gemini-2.0-flash
            modelUsed = "gemini-2.0-flash";

            // 2. Generate Prompt for Explanation - HARDENED V7
            const prompt = `
            You are a Logic Engine splitting a bill of ${currency} ${totalAmount.toFixed(2)} for "${title}" (${category}).
            
            Participants & Base Weights:
            ${JSON.stringify(weightedParticipants, null, 2)}

            Context provided by user: "${description}"

            CRITICAL INSTRUCTION - "Deep Logic V7 (Compounding Signals)":
            
            1. **ZERO-EQUALITY DIRECTIVE**: 
               - If the context mentions ANY difference between people (e.g. "vegan", "late", "small room", "unemployed"), an equal split is FORBIDDEN.
               - You must apply a discount or premium based on the signal.
            
            2. **ITEMIZATION & EXCLUSIONS**: 
               - If someone "didn't use" X (e.g. "Jessy didn't use electricity"), you must isolate that cost.
               - Jessy's share for that item MUST be 0. Others pay it.
               - Do NOT smooth this over. Show the math: "Electricity: $100. Jessy $0, Others $33".

            3. **COMPOUNDING SIGNALS**:
               - If someone has multiple factors (e.g. "Unemployed" AND "Late arrival"), BOTH discounts apply.
               - Do not let them cancel out unless they are opposites.

            4. **FINAL STEP**:
               - Sum up cost-per-person.
               - Output explicit "weights_used" (e.g. 1.0, 0.5) and "context_signals" used for debugging.

            Output JSON strictly:
            {
                "detected_items": [{"name": string, "cost": number}],
                "context_signals": { [personName: string]: string[] },
                "weights_used": { [personName: string]: number },
                "step_by_step_reasoning": string[], 
                "split": [{ "name": string, "recommendedShare": number, "sharePercentage": number, "reasoning": string }],
                "agentSummary": string 
            }
            `

            // Span for LLM
            const llmSpan = trace.span({
                name: "gemini_inference_v7",
                type: "llm"
            })

            // Initialize Model
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            // Count tokens (heuristic)
            const inputTokenCount = Math.ceil(prompt.length / 4);

            const generateWithRetry = async (text: string, retries = 3, delay = 10000): Promise<string> => {
                try {
                    const result = await model.generateContent(text);
                    const response = await result.response;
                    return response.text();
                } catch (error: any) {
                    console.log(`Gemini Error: ${error.message}. Retrying...`);
                    if (retries > 0) {
                        await new Promise(r => setTimeout(r, delay));
                        return generateWithRetry(text, retries - 1, delay * 2);
                    }
                    throw error;
                }
            };

            const text = await generateWithRetry(prompt, 3, 10000);
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim()
            data = JSON.parse(cleanedText)
            agentRecommendedSplit = data.split

            // End LLM Span with Metadata
            llmSpan.end({
                output: {
                    responseSize: text.length,
                    model: "gemini-2.0-flash",
                    weights: data.weights_used, // Log weights to Opik
                    signals: data.context_signals
                },
                tags: ["production_v2", "hardened_logic"]
            })
        }

        // 3. Post-Processing: Compute Savings & Settlements
        const finalSplit = agentRecommendedSplit.map((item: any) => {
            const savings = equalShare - item.recommendedShare
            return {
                ...item,
                comparison: {
                    equalShare: Number(equalShare.toFixed(2)),
                    savings: Number(savings.toFixed(2))
                }
            }
        })

        // -- SETTLEMENT LOGIC --
        // Use the imported calculation function
        const { calculateSettlements } = await import('@/lib/settlement')
        const settlements = calculateSettlements(expenses, finalSplit, participants)

        const endTime = Date.now()
        const latencyMs = endTime - startTime

        // Add metadata for frontend
        const resultWithMeta = {
            ...data,
            split: finalSplit,
            settlements: settlements,
            stats: {
                latencyMs,
                model: modelUsed,
            },
            metadata: {
                totalAmount,
                subsidy_active: subsidyActive,
                fairness_algorithm: "weighted_v2_settlement_aware",
                model: modelUsed,
                trace_id: traceId,
                timestamp: new Date().toISOString(),
                // Pass rich debug info to frontend if available
                weights_used: data.weights_used,
                context_signals: data.context_signals
            }
        }

        // End Trace
        await trace.end()
        await opikClient.flush()

        return NextResponse.json(resultWithMeta)

    } catch (error: any) {
        console.error("Agent Error Full:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
        return NextResponse.json({
            split: [],
            agentSummary: `Agent failed: ${error.message || "Unknown Error"}`
        }, { status: 500 })
    }
}
