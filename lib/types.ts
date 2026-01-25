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
    payerId?: string // Optional: who paid for this originally? (For now assume shared pot or handle in logic)
}

export interface PlanData {
    title: string // e.g. "Weekend Trip"
    currency: string
    category: PlanType
    participants: Participant[]
    expenses: ExpenseItem[]
    description?: string // General context
}

export interface SplitItem {
    name: string
    sharePercentage: number
    recommendedShare: number
    reasoning: string
}

export interface AgreementData {
    planId?: string
    totalAmount: number
    split: SplitItem[]
    agentSummary: string
    timestamp: string
    metadata?: any // Opik tracing metadata (model version, etc.)
}
