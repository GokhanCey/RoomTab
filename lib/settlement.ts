import { Transaction, SplitItem, ExpenseItem, Participant } from "./types"

/**
 * Calculates the 'Who Owes Whom' transactions based on expenses and the fair split.
 * Uses a greedy algorithm to minimize the number of transactions.
 */
export function calculateSettlements(
    expenses: ExpenseItem[],
    split: SplitItem[],
    participants: Participant[]
): Transaction[] {
    // 1. Calculate Net Balances
    const balances: Record<string, number> = {} // Name -> Net Amount (Positive = Owed, Negative = Owes)

    // Initialize text-to-ID map for reliability if names are unique
    const nameToId = participants.reduce((acc, p) => ({ ...acc, [p.name]: p.id }), {} as Record<string, string>)

    // Init 0
    participants.forEach(p => balances[p.name] = 0)

    // Add what people PAID
    expenses.forEach(item => {
        // If payerId is missing, assume first participant (default behavior) or handle elsewhere.
        // For now, we will rely on name matching if payerId exists, or fallback.
        // Ideally, frontend provides payerId.

        // FIXME: In this simplified version, we'll need to map payerId back to Name or usage Name directly.
        // Let's assume we pass the payer's NAME if possible, or ID.
        // For robustness, let's assume item.payerId corresponds to a participant.id

        const payer = participants.find(p => p.id === item.payerId) || participants[0]
        if (payer) {
            balances[payer.name] = (balances[payer.name] || 0) + item.amount
        }
    })

    // Subtract what people SHOULD PAY (Fair Share)
    split.forEach(s => {
        // s.recommendedShare is what they CONSUMED (cost)
        balances[s.name] = (balances[s.name] || 0) - s.recommendedShare
    })

    // 2. Separate into Debtors and Creditors
    let debtors: { name: string, amount: number }[] = []
    let creditors: { name: string, amount: number }[] = []

    Object.entries(balances).forEach(([name, amount]) => {
        const rounded = Math.round(amount * 100) / 100
        if (rounded < -0.01) debtors.push({ name, amount: rounded }) // Negative = Owes
        if (rounded > 0.01) creditors.push({ name, amount: rounded })  // Positive = Owed
    })

    // Sort by magnitude for greedy matching (optional optimization)
    debtors.sort((a, b) => a.amount - b.amount)
    creditors.sort((a, b) => b.amount - a.amount)

    const transactions: Transaction[] = []

    // 3. Greedy Matching
    let i = 0 // debtor index
    let j = 0 // creditor index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i]
        const creditor = creditors[j]

        // amount debtor owes (positive magnitude)
        const oweAmount = Math.abs(debtor.amount)
        // amount creditor is owed
        const receiveAmount = creditor.amount

        const settleAmount = Math.min(oweAmount, receiveAmount)

        transactions.push({
            from: debtor.name,
            to: creditor.name,
            amount: Number(settleAmount.toFixed(2))
        })

        // Adjust remaining balance
        debtor.amount += settleAmount
        creditor.amount -= settleAmount

        // Move pointers if settled
        if (Math.abs(debtor.amount) < 0.01) i++
        if (creditor.amount < 0.01) j++
    }

    return transactions
}
