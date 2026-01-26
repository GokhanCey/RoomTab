import { NextResponse } from 'next/server'
import { Opik } from "opik"

export const runtime = "nodejs" // Explicitly Node.js runtime for Opik SDK

const opikClient = new Opik({
    apiKey: process.env.OPIK_API_KEY
})

export async function POST(req: Request) {
    try {
        const { traceId, score } = await req.json()

        if (!traceId || score === undefined) {
            return NextResponse.json({ error: "Missing traceId or score" }, { status: 400 })
        }

        console.log(`Logging Feedback for Trace ${traceId}: Score ${score}`)

        // Log Feedback to Opik
        // Note: The SDK method usually requires a span or trace object, 
        // but looking at docs/SDK patterns, we can log feedback by ID if supported
        // or we just log a new generic trace event "User Feedback".
        // HOWEVER, the standard Opik way is logging feedback against a trace.
        // If the 'trace()' object is needed, we might have to just log a new separate trace linking to the old one.
        // Let's try the direct client method if available, or just create a "Feedback Event" trace.

        // Strategy: Create a specific "Validation" trace that references the original
        const feedbackTrace = opikClient.trace({
            name: "user_feedback",
            tags: ["feedback", `ref_trace:${traceId}`],
            input: { traceId, score },
            output: { status: "recorded" }
        })

        // If the SDK supports explicit Feedback Scores APIs, we'd use that here. 
        // Since we are mocking/using a beta SDK, treating it as a new trace is safest to ensure data visibility.
        // We add the score as a metric/tag.

        feedbackTrace.update({
            tags: ["feedback", `ref_trace:${traceId}`, `score:${score}`]
        })

        await feedbackTrace.end()
        await opikClient.flush()

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("Feedback Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
