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

            // 2. Generate Prompt for Explanation - LOGIC V4 (Item-Aware)
            const prompt = `
            You are a Fair Split Judge. Analyze the context and assign modifiers to participants.
            You must decide if a modifier is GLOBAL (applies to total) or TARGETED (applies to specific items).

            Case: "${title}" (${category})
            Context: "${description}"

            Participants:
            ${JSON.stringify(participants.map((p: any) => ({ id: p.id, name: p.name, tags: p.tags })), null, 2)}

            Expenses:
            ${JSON.stringify(expenses.map((e: any) => ({ desc: e.description, amt: e.amount })), null, 2)}

            RULES:
            1. **Exclusions**: If context says "Jack didn't use Gas", output a modifier with type "exclude" and targets ["gas"].
            2. **Partial Usage**: If "Alice arrived late", she might have partial weight on "Hotel" but full weight on "Dinner". Use targets!
            3. **Global Modifiers**: If omitting targets, the modifier applies to EVERYTHING (e.g. "Unemployed" discount).
            4. **Ambiguity**: Default to standard.

            OUTPUT JSON:
            {
                "modifiers": [
                    { 
                      "participantId": "string", 
                      "type": "exclude" | "partial" | "premium" | "standard", 
                      "value"?: number, 
                      "targets"?: string[], // E.g. ["gas", "fuel"] or ["rent"]
                      "reason": "string" 
                    }
                ],
                "agentSummary": "Concise summary."
            }
            `

            // Span for LLM
            const llmSpan = trace.span({
                name: "gemini_inference_v4_item_aware",
                type: "llm"
            })

            // Initialize Model
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            const inputTokenCount = Math.ceil(prompt.length / 4);

            const generateWithRetry = async (text: string, retries = 3, delay = 2000): Promise<string> => {
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

            const text = await generateWithRetry(prompt, 3, 2000);
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim()
            data = JSON.parse(cleanedText)

            // --- DETERMINISTIC CALCULATION ENGINE V4 ---
            const { calculateItemizedSplit } = await import('@/lib/logic_v4')

            // Calculate Modifiers + Fallback to Standard
            const appliedModifiers = data.modifiers || [];

            // Run Math
            agentRecommendedSplit = calculateItemizedSplit(expenses, participants, appliedModifiers);

            // Log output Token Count
            const outputTokenCount = Math.ceil(text.length / 4);

            // End LLM Span with Metadata
            llmSpan.end({
                output: {
                    model: "gemini-2.0-flash",
                    input_tokens: inputTokenCount,
                    output_tokens: outputTokenCount,
                    modifiers: appliedModifiers
                },
                tags: ["logic_v4", "item_aware"]
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
