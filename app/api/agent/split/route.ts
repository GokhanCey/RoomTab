import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from 'next/server'
import { Opik } from "opik"
import { v4 as uuidv4 } from 'uuid'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Initialize Opik Client
const opikClient = new Opik({
    apiKey: process.env.OPIK_API_KEY
})

export async function POST(req: Request) {
    const traceId = uuidv4();

    // Start Opik Trace
    const trace = opikClient.trace({
        name: "fairness_split_generation",
        tags: ["fairness_v2", "roomtab-web", `trace:${traceId}`]
    })

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

        // SKIP LLM if no context is provided to save Quota (Fallback Mode)
        if (!description || description.trim() === "") {
            const lines = weightedParticipants.map((p: any) => {
                // Calculate share proportional to weight
                // share = (totalAmount * weight) / totalWeight
                const share = (totalAmount * p.weight) / totalWeight;

                return {
                    name: p.name,
                    recommendedShare: Number(share.toFixed(2)),
                    sharePercentage: Number(((p.weight / totalWeight) * 100).toFixed(1)),
                    reasoning: p.reasons.length > 0 ? p.reasons.join(", ") : "Standard Split"
                }
            })

            data = {
                split: lines,
                agentSummary: "Context disabled. Using standard weighted fairness logic (Deterministic Mode). No AI Quota used."
            }
        } else {
            // Validated Model from debug_list: gemini-2.0-flash
            modelUsed = "gemini-2.0-flash";

            // 2. Generate Prompt for Explanation
            const prompt = `
            You are a Logic Engine splitting a bill of ${currency} ${totalAmount.toFixed(2)} for "${title}" (${category}).
            
            Participants & Base Weights:
            ${JSON.stringify(weightedParticipants, null, 2)}

            Context provided by user: "${description}"

            CRITICAL INSTRUCTION - "Deep Logic V5":
            
            1. **ITEMIZATION**: If the input lists costs (e.g. "Rent: $1200", "Elec: $100"), you MUST create a separate line item for each using those EXACT numbers. Do NOT lump them.

            2. **RATIO DECODING**: 
               - "Twice smaller room" = 1 part vs 2 parts (Total 3 parts). Person A pays 1/3, Person B pays 2/3.
               - "Half the size" = 1:2 ratio.
               - "Larger room" (unspecified) = ~60/40 split.

            3. **EXCLUSIONS**: "Doesn't use electricity" = Pay $0 for that specific item.

            4. **CALCULATION**:
               - Break down costs per item.
               - Sum them up carefully.
             
            Step 5: FINAL VERIFICTION. Add the numbers explicitly. e.g. "400 + 0 + 75 = 475".

            CRITICAL: 
            - The "recommendedShare" MUST be the output of Step 5.
            - DO NOT "adjust", "normalize", or "balance" the result. 
            - If your math says $475, output 475.
            - IGNORE any global "weight" parameters if they conflict with your itemized math.

            Output JSON strictly:
            {
                "detected_items": [{"name": string, "cost": number, "payers": string[]}],  // List the sub-items you inferred (or "General", "remainder")
                "step_by_step_reasoning": string[], // Array of strings explaining each math step
                "split": [{ "name": string, "recommendedShare": number, "sharePercentage": number, "reasoning": string }],
                "agentSummary": string // A concise final explanation for the users
            }
            `

            // Span for LLM
            const llmSpan = trace.span({
                name: "gemini_inference",
                type: "llm"
            })

            // Initialize Model with Retry Logic
            // Using gemini-2.0-flash-exp (or flash) for best logic/speed ratio
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            const generateWithRetry = async (text: string, retries = 3, delay = 10000): Promise<string> => {
                try {
                    const result = await model.generateContent(text);
                    const response = await result.response;
                    return response.text();
                } catch (error: any) {
                    console.log(`Gemini Error: ${error.message}. Retrying in ${delay}ms... (Remaining: ${retries})`);
                    if (retries > 0) {
                        await new Promise(r => setTimeout(r, delay));
                        return generateWithRetry(text, retries - 1, delay * 2);
                    }
                    throw error;
                }
            };

            // Increase initial delay to 10s to match Free Tier penalty boxes
            const text = await generateWithRetry(prompt, 3, 10000);

            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim()
            data = JSON.parse(cleanedText)

            // End LLM Span
            llmSpan.end()
        }

        // Add metadata for frontend
        const resultWithMeta = {
            ...data,
            metadata: {
                totalAmount,
                subsidy_active: subsidyActive,
                fairness_algorithm: "weighted_v2_multiplicative",
                model: modelUsed,
                trace_id: traceId // Real UUID
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
