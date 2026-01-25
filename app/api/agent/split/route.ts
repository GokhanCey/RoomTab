import { NextRequest, NextResponse } from 'next/server';
import { PlanData, AgreementData, SplitItem } from '@/lib/types';
import { logTrace } from '@/lib/opik';

// Mock AI Logic for the hackathon MVP
// In production, this would use the generic 'expenses' and 'participants' to call an LLM.
async function mockAiInference(data: PlanData): Promise<{ split: SplitItem[], summary: string, metadata: any }> {
    const totalAmount = data.expenses.reduce((sum, item) => sum + item.amount, 0);
    const participantCount = data.participants.length;

    // Financial Health & Fairness Heuristics (Multiplicative)
    // - "Student" / "Unemployed" -> 30% discount (x0.7)
    // - "High Earner" -> 20% surcharge (x1.2) - Voluntary equity
    // - "Non-drinker" -> 20% discount (x0.8) - Context dependent
    // - "Late" -> 10% discount (x0.9)
    // - "Kid" -> 50% count (x0.5)

    // 1. Calculate weighted units
    let totalUnits = 0;
    let subsidyApplied = false;
    let highEarnerFound = false;

    const weightedParticipants = data.participants.map(p => {
        let weight = 1.0;
        const lowerTags = p.tags.map(t => t.toLowerCase());
        const activeFactors: string[] = [];

        // --- Context Checks ---
        // Only apply "Non-drinker" if category involves consumption
        const isConsumption = ['dinner', 'trip', 'other'].includes(data.category);

        // --- Multiplicative Adjustments ---

        // 1. Consumption Tags
        if (isConsumption && lowerTags.some(t => t.includes('non-drinker'))) {
            weight *= 0.8;
            activeFactors.push("Non-drinker (-20%)");
        }

        // 2. Participation Tags
        if (lowerTags.some(t => t.includes('late') || t.includes('early'))) {
            weight *= 0.9;
            activeFactors.push("Partial Participation (-10%)");
        }

        // 3. Demographics (Kid overrides/damps significantly)
        if (lowerTags.some(t => t.includes('kid') || t.includes('child'))) {
            weight *= 0.5;
            activeFactors.push("Child Rate (0.5x)");
        }

        // 4. Financial Health (Subsidy)
        if (lowerTags.some(t => t.includes('student') || t.includes('intern') || t.includes('unemployed') || t.includes('low income'))) {
            weight *= 0.7;
            activeFactors.push("Financial Relief (-30%)");
            subsidyApplied = true;
        }

        // 5. High Earner (Sponsor)
        if (lowerTags.some(t => t.includes('high earner') || t.includes('sponsor') || t.includes('wealthy'))) {
            weight *= 1.25;
            activeFactors.push("High Earner Contribution (+25%)");
            highEarnerFound = true;
        }

        // Safety floor
        weight = Math.max(weight, 0.1);

        totalUnits += weight;
        return { ...p, weight, activeFactors };
    });

    // 2. Calculate share per unit
    const costPerUnit = totalAmount / totalUnits;

    const split: SplitItem[] = weightedParticipants.map(wp => {
        const share = costPerUnit * wp.weight;
        const equalShare = totalAmount / participantCount;
        const diff = equalShare - share;

        let reason = "Equal share.";
        if (Math.abs(diff) > 0.01) {
            if (wp.activeFactors.length > 0) {
                reason = `Adjusted: ${wp.activeFactors.join(", ")}.`;
            } else {
                // If weight changed but no factors pushed (rare edge case), fallback
                reason = wp.weight < 1 ? "Reduced share." : "Increased share.";
            }

            if (diff > 0 && (wp.tags.some(t => t.toLowerCase().includes('student') || t.toLowerCase().includes('intern')))) {
                reason += ` Total savings: ${data.currency}${diff.toFixed(2)}.`;
            }
        }

        return {
            name: wp.name,
            recommendedShare: parseFloat(share.toFixed(2)),
            sharePercentage: Math.round((share / totalAmount) * 100),
            reasoning: reason
        };
    });

    const summaryParts = [`Analyzed ${data.expenses.length} expenses (${data.currency} ${totalAmount.toFixed(2)}).`];
    if (subsidyApplied) summaryParts.push("Applied financial subsidies for students/interns.");
    if (highEarnerFound) summaryParts.push("Included high-earner solidarity contributions.");
    if (!subsidyApplied && !highEarnerFound && data.participants.length > 0) summaryParts.push("Split is largely equal based on active participants.");

    return {
        split,
        summary: summaryParts.join(" "),
        metadata: {
            model: "gemini-2.5-flash-mock",
            fairness_algorithm: "heuristic-v3-multiplicative",
            total_participants: participantCount,
            subsidy_active: subsidyApplied,
            high_earner_active: highEarnerFound,
            category: data.category
        }
    };
}

export async function POST(req: NextRequest) {
    try {
        const body: PlanData = await req.json();

        // 1. Log Input Trace to Opik
        // We log tags to show that we are tracking "financial labels"
        await logTrace("agent_inference_input", {
            participants: body.participants.map(p => ({ name: p.name, tags: p.tags })),
            total_expense: body.expenses.reduce((s, x) => s + x.amount, 0)
        }, null);

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
        // Include the metadata for the "Best Use of Opik" track (model versioning)
        await logTrace("agent_inference_output", null, {
            response,
            metadata: aiResult.metadata
        });

        return NextResponse.json(response);

    } catch (error) {
        console.error("Agent Error:", error);
        return NextResponse.json({ error: "Failed to generate agreement" }, { status: 500 });
    }
}
