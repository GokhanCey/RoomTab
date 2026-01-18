import { NextRequest, NextResponse } from 'next/server';
import { PlanData, AgreementData, SplitItem } from '@/lib/types';
import { logTrace } from '@/lib/opik';

// Mock AI Logic for the hackathon MVP
// In production, this would use the generic 'expenses' and 'participants' to call an LLM.
async function mockAiInference(data: PlanData): Promise<{ split: SplitItem[], summary: string }> {
    const totalAmount = data.expenses.reduce((sum, item) => sum + item.amount, 0);
    const participantCount = data.participants.length;
    const baseShare = totalAmount / participantCount;

    // Simple heuristic: adjust based on tags
    // "Non-drinker" -> pays 20% less than base
    // "Arrived late" -> pays 10% less
    // "Organizer" -> pays base (or maybe less? let's say base)

    // 1. Calculate weighted units
    let totalUnits = 0;
    const weightedParticipants = data.participants.map(p => {
        let weight = 1.0;
        const lowerTags = p.tags.map(t => t.toLowerCase());

        if (lowerTags.some(t => t.includes('non-drinker'))) weight -= 0.2;
        if (lowerTags.some(t => t.includes('late'))) weight -= 0.1;
        if (lowerTags.some(t => t.includes('kid') || t.includes('child'))) weight = 0.5;

        totalUnits += weight;
        return { ...p, weight };
    });

    // 2. Calculate share per unit
    const costPerUnit = totalAmount / totalUnits;

    const split: SplitItem[] = weightedParticipants.map(wp => {
        const share = costPerUnit * wp.weight;

        let reason = "Equal share.";
        if (wp.weight < 1.0) {
            const tags = wp.tags.join(", ");
            reason = `Reduced share based on flags: ${tags}`;
        }

        return {
            name: wp.name,
            recommendedShare: parseFloat(share.toFixed(2)),
            sharePercentage: Math.round((share / totalAmount) * 100),
            reasoning: reason
        };
    });

    return {
        split,
        summary: `I've analyzed the ${data.expenses.length} expenses totalling ${data.currency} ${totalAmount.toFixed(2)}. The split is largely equal, but I've applied adjustments for participants with specific tags (like 'Non-drinker') to ensure fairness.`
    };
}

export async function POST(req: NextRequest) {
    try {
        const body: PlanData = await req.json();

        // 1. Log Input Trace to Opik
        await logTrace("agent_inference_input", { body }, null);

        // 2. Perform AI Inference
        const aiResult = await mockAiInference(body);

        // 3. Create Total Amount for Response
        const totalAmount = body.expenses.reduce((sum, item) => sum + item.amount, 0);

        const response: AgreementData = {
            totalAmount: totalAmount,
            split: aiResult.split,
            agentSummary: aiResult.summary,
            timestamp: new Date().toISOString()
        };

        // 4. Log Output Trace to Opik
        await logTrace("agent_inference_output", null, { response });

        return NextResponse.json(response);

    } catch (error) {
        console.error("Agent Error:", error);
        return NextResponse.json({ error: "Failed to generate agreement" }, { status: 500 });
    }
}
