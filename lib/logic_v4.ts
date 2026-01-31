
import { Participant, SplitItem, ExpenseItem } from "./types";

export type ModifierType = "standard" | "exclude" | "partial" | "premium" | "fixed_plus" | "fixed_minus";

export interface Modifier {
    participantId: string;
    type: ModifierType;
    value?: number;
    reason: string;
    targets?: string[]; // keywords to match against expense description (case-insensitive)
}

/**
 * Logic V4: Item-Iterative Deterministic Split
 * Calculates split for EACH item separately, then sums up.
 */
export function calculateItemizedSplit(
    expenses: ExpenseItem[],
    participants: Participant[],
    modifiers: Modifier[]
): SplitItem[] {

    // Initialize Result Map (Cents)
    const totalShares = new Map<string, number>();
    participants.forEach(p => totalShares.set(p.id, 0));

    // Helper: Check if modifier applies to an item
    const isApplicable = (mod: Modifier, itemDesc: string) => {
        if (!mod.targets || mod.targets.length === 0) return true; // Global
        const descLower = itemDesc.toLowerCase();
        return mod.targets.some(t => descLower.includes(t.toLowerCase()));
    };

    // Iterate Expenses
    expenses.forEach(expense => {
        const amountCents = Math.round(expense.amount * 100);

        // Calculate Weights for THIS item
        let itemTotalWeight = 0;
        const ItemWeightedParts: { id: string, weight: number }[] = [];

        participants.forEach(p => {
            // Find specific modifiers for this person + item
            // Priority: Item-Specific > Global
            const personMods = modifiers.filter(m => m.participantId === p.id);

            // Look for targeted, then global
            let activeMod = personMods.find(m => m.targets && m.targets.length > 0 && isApplicable(m, expense.description));
            if (!activeMod) {
                // Fallback to global if applicable
                activeMod = personMods.find(m => (!m.targets || m.targets.length === 0));
            }

            const type = activeMod?.type || "standard";
            const val = activeMod?.value;

            let weight = 1.0;
            if (type === "exclude") weight = 0.0;
            else if (type === "partial") weight = (val !== undefined) ? val : 0.5;
            else if (type === "premium") weight = (val !== undefined) ? val : 1.5;

            ItemWeightedParts.push({ id: p.id, weight });
            itemTotalWeight += weight;
        });

        // Distribute Item Cost
        if (itemTotalWeight === 0) {
            // Fallback: Equal split for this item
            const equal = Math.floor(amountCents / participants.length);
            ItemWeightedParts.forEach(wp => {
                totalShares.set(wp.id, (totalShares.get(wp.id) || 0) + equal);
            });
            // Remainder... ignore for now or add to first?
            // Penny correction is tricky per-item. 
        } else {
            let distributed = 0;
            ItemWeightedParts.forEach(wp => {
                const share = Math.floor((amountCents * wp.weight) / itemTotalWeight);
                totalShares.set(wp.id, (totalShares.get(wp.id) || 0) + share);
                distributed += share;
            });

            // Per-Item Penny Correction
            let remainder = amountCents - distributed;
            if (remainder > 0) {
                ItemWeightedParts.sort((a, b) => b.weight - a.weight);
                for (let i = 0; i < remainder; i++) {
                    const rec = ItemWeightedParts[i % ItemWeightedParts.length];
                    totalShares.set(rec.id, (totalShares.get(rec.id) || 0) + 1);
                }
            }
        }
    });

    // Format Final Output
    const totalAmountCents = expenses.reduce((sum, e) => sum + Math.round(e.amount * 100), 0);

    return participants.map(p => {
        const finalCents = totalShares.get(p.id) || 0;
        const amount = finalCents / 100;
        const percent = (totalAmountCents > 0) ? (finalCents / totalAmountCents) * 100 : 0;

        // Collect reasons
        const reasons = modifiers
            .filter(m => m.participantId === p.id)
            .map(m => m.reason)
            .join("; ");

        return {
            name: p.name,
            sharePercentage: Number(percent.toFixed(1)),
            recommendedShare: amount,
            reasoning: reasons || "Standard share."
        };
    });
}
