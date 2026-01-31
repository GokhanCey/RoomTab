export type PlanType = 'rent' | 'trip' | 'video' | 'dinner' | 'other';

export interface Participant {
    id: string
    name: string
    tags: string[] // e.g. "Non-drinker", "Arrived late", "Vegetarian"
    notes?: string // e.g. "Left early"
}

export interface ExpenseItem {
    id: string
    description: string
    amount: number
    payerId?: string // Optional: who paid for this originally?
}

export interface PlanData {
    title: string // e.g. "Weekend Trip"
    currency: string
    category: PlanType
    participants: Participant[]
    expenses: ExpenseItem[]
    description?: string // General context
}

export interface Transaction {
    from: string
    to: string
    amount: number
}

export interface SplitItem {
    name: string
    sharePercentage: number
    recommendedShare: number
    reasoning: string
    comparison?: {
        equalShare: number
        savings: number // Positive = Saved money vs equal
    }
}

export interface AgreementData {
    planId?: string
    totalAmount: number
    split: SplitItem[]
    settlements?: Transaction[] // Who owes whom
    agentSummary: string
    timestamp: string
    stats?: {
        latencyMs: number
        model: string
        input_token_count?: number
    }
    metadata?: {
        totalAmount?: number
        trace_id?: string
        weights_used?: Record<string, number>
        context_signals?: Record<string, string[]>
        [key: string]: any
    }
}
