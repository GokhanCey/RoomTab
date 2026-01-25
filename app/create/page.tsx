"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, ArrowRight, Loader2, Info, HelpCircle, Check, AlertCircle, X, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlanData, Participant, ExpenseItem, AgreementData } from "@/lib/types"
import { OpikDashboard } from "@/components/OpikDashboard"
import { downloadAgreementCsv } from "@/lib/csv"

export default function CreatePlanPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [agreementResult, setAgreementResult] = useState<AgreementData | null>(null)

    // Temporary state for adding tags (optional usage now, since we handle directly)
    const [newTag, setNewTag] = useState<string>("")

    const [plan, setPlan] = useState<PlanData>({
        title: "Weekend Trip",
        currency: "USD",
        category: "trip",
        participants: [
            { id: "1", name: "Alex", tags: ["Organizer"] },
            { id: "2", name: "Jordan", tags: ["Non-drinker"] },
            { id: "3", name: "Taylor", tags: ["Arrived late"] }
        ],
        expenses: [
            { id: "1", description: "Airbnb", amount: 600 },
            { id: "2", description: "Dinner & Drinks", amount: 250 },
            { id: "3", description: "Uber to Airport", amount: 45 }
        ],
        description: "Jordan didn't drink at dinner. Taylor missed the first night."
    })

    // --- Helpers ---
    const totalCost = plan.expenses.reduce((sum, item) => sum + item.amount, 0)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePlan = (field: keyof PlanData, value: any) => {
        setPlan(prev => ({ ...prev, [field]: value }))
    }

    // --- Participant Logic ---
    const addParticipant = () => {
        const newId = Date.now().toString()
        setPlan(prev => ({
            ...prev,
            participants: [...prev.participants, { id: newId, name: `Person ${prev.participants.length + 1}`, tags: [] }]
        }))
    }

    const removeParticipant = (id: string) => {
        if (plan.participants.length <= 1) return;
        setPlan(prev => ({
            ...prev,
            participants: prev.participants.filter(p => p.id !== id)
        }))
    }

    const updateParticipantName = (id: string, name: string) => {
        setPlan(prev => ({
            ...prev,
            participants: prev.participants.map(p => p.id === id ? { ...p, name } : p)
        }))
    }

    // Fixed addTag to use direct value instead of async state
    const addTag = (id: string, tagVal: string) => {
        const cleaned = tagVal.trim()
        if (!cleaned) return
        setPlan(prev => ({
            ...prev,
            participants: prev.participants.map(p => p.id === id ? { ...p, tags: [...p.tags, cleaned] } : p)
        }))
    }

    const removeTag = (id: string, tagToRemove: string) => {
        setPlan(prev => ({
            ...prev,
            participants: prev.participants.map(p => p.id === id ? { ...p, tags: p.tags.filter(t => t !== tagToRemove) } : p)
        }))
    }

    // --- Expense Logic ---
    const addExpense = () => {
        const newId = Date.now().toString()
        setPlan(prev => ({
            ...prev,
            expenses: [...prev.expenses, { id: newId, description: "", amount: 0 }]
        }))
    }

    const removeExpense = (id: string) => {
        setPlan(prev => ({
            ...prev,
            expenses: prev.expenses.filter(e => e.id !== id)
        }))
    }

    const updateExpense = (id: string, field: keyof ExpenseItem, value: string | number) => {
        setPlan(prev => ({
            ...prev,
            expenses: prev.expenses.map(e => e.id === id ? { ...e, [field]: value } : e)
        }))
    }


    const handleSubmit = async () => {
        setLoading(true)
        setAgreementResult(null)
        try {
            if (totalCost <= 0) {
                alert("Please add at least one expense.")
                setLoading(false)
                return
            }

            const res = await fetch('/api/agent/split', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(plan)
            })

            if (!res.ok) throw new Error("Agent failed")

            const data = await res.json()
            setAgreementResult(data)

            setTimeout(() => {
                document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
            }, 100)

        } catch (error) {
            console.error(error)
            alert("Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    // --- Templates ---
    const TEMPLATES: Record<string, { title: string, context: string, expenses: string[], participants: string[] }> = {
        rent: {
            title: " Monthly Rent Split",
            context: "e.g. Alex moved in on the 5th. Jamie has a larger room. Rent includes utilities.",
            expenses: ["Rent", "Internet", "Electricity"],
            participants: ["Tenant 1", "Tenant 2", "Tenant 3"]
        },
        trip: {
            title: "Weekend Trip",
            context: "e.g. Taylor paid for the Airbnb deposit. Jordan is a student. We split gas evenly.",
            expenses: ["Airbnb", "Car Rental", "Groceries"],
            participants: ["Traveler 1", "Traveler 2", "Traveler 3"]
        },
        dinner: {
            title: "Friday Dinner",
            context: "e.g. Sarah didn't drink alcohol. Bill includes 20% tip.",
            expenses: ["Food", "Drinks", "Tip"],
            participants: ["Diner 1", "Diner 2", "Diner 3"]
        },
        other: {
            title: "Shared Expense",
            context: "Describe any specific fairness adjustments here...",
            expenses: ["Item 1", "Item 2"],
            participants: ["Person 1", "Person 2"]
        }
    }

    const applyTemplate = (category: string) => {
        const t = TEMPLATES[category] || TEMPLATES.other

        // Only apply if user hasn't heavily customized yet (simple heuristic: default title)
        // Or we just update text/placeholders. User asked for "templates".
        // Let's overwite intelligently.

        setPlan(prev => ({
            ...prev,
            category: category as any,
            // Optional: Auto-fill title if it's generic
            title: prev.title === "Weekend Trip" || prev.title === "" ? t.title : prev.title,
            // We won't overwrite description/participants as that destroys data, 
            // but we will use 't.context' as the PLACEHOLDER in the UI.
        }))
    }

    return (
        <div className="container max-w-3xl py-10 pb-32">
            <div className="mb-8 space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Smart Split Creator</h1>
                <p className="text-muted-foreground">Describe the costs, list the people, and let AI settle it fairly.</p>
            </div>

            <div className="grid gap-6">

                {/* 1. Event / Plan Details */}
                <Card className="border-l-4 border-l-primary/50">
                    <CardHeader>
                        <CardTitle>What are we splitting?</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Event Title</Label>
                            <Input
                                value={plan.title}
                                onChange={(e) => updatePlan('title', e.target.value)}
                                placeholder="e.g. Ski Trip"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={plan.category}
                                onValueChange={(v) => applyTemplate(v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rent">Housing / Rent</SelectItem>
                                    <SelectItem value="trip">Trip / Vacation</SelectItem>
                                    <SelectItem value="dinner">Dinner / Drinks</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Expenses List */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Expenses</CardTitle>
                            <CardDescription>Add all receipts or costs here.</CardDescription>
                        </div>
                        <div className="text-xl font-bold text-primary">
                            {plan.currency} {totalCost.toFixed(2)}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {plan.expenses.map((expense) => (
                            <div key={expense.id} className="flex gap-2 items-center">
                                <Input
                                    placeholder="Item description"
                                    value={expense.description}
                                    onChange={(e) => updateExpense(expense.id, 'description', e.target.value)}
                                    className="flex-1"
                                />
                                <div className="relative w-24 sm:w-32">
                                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">{plan.currency}</span>
                                    <Input
                                        type="number"
                                        className="pl-12"
                                        placeholder="0"
                                        value={expense.amount || ''}
                                        onChange={(e) => updateExpense(expense.id, 'amount', parseFloat(e.target.value))}
                                    />
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeExpense(expense.id)} className="h-9 w-9 text-muted-foreground hover:text-destructive">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={addExpense} className="w-full border-dashed">
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </CardContent>
                </Card>

                {/* 3. People & Attributes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Participants</CardTitle>
                        <CardDescription>
                            Who's involved? Add tags like "Non-drinker" or "Left early" for the Agent.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {plan.participants.map((p, index) => (
                            <div key={p.id} className="relative rounded-lg border p-4 bg-muted/20">
                                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <span className="bg-background w-6 h-6 rounded-full flex items-center justify-center text-xs border shadow-sm">{index + 1}</span>
                                        <Input
                                            value={p.name}
                                            onChange={(e) => updateParticipantName(p.id, e.target.value)}
                                            className="h-8 w-32 sm:w-40"
                                        />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeParticipant(p.id)} className="h-6 w-6 text-muted-foreground -mr-2 sm:mr-0">
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>

                                <div className="flex flex-wrap gap-2 items-center">
                                    {p.tags.map((tag) => (
                                        <div key={tag} className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                                            {tag}
                                            <button onClick={() => removeTag(p.id, tag)} className="hover:text-destructive text-primary/50"><X className="h-3 w-3" /></button>
                                        </div>
                                    ))}

                                    <div className="flex items-center gap-1">
                                        <Input
                                            className="h-7 text-xs w-24"
                                            placeholder="Add tag..."
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    const target = e.currentTarget
                                                    addTag(p.id, target.value)
                                                    target.value = ''
                                                }
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value) {
                                                    addTag(p.id, e.target.value)
                                                    e.target.value = ''
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full border-dashed" onClick={addParticipant}>
                            <Plus className="mr-2 h-4 w-4" /> Add Person
                        </Button>
                    </CardContent>
                </Card>

                {/* 4. Context */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Additional Context
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder={TEMPLATES[plan.category || 'trip']?.context || "Describe the situation..."}
                            value={plan.description || ''}
                            onChange={(e) => updatePlan('description', e.target.value)}
                            className="resize-none h-20"
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                    <Button size="lg" onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto shadow-lg">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate Split <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Results Section */}
            {agreementResult && (
                <div id="results-section" className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row items-center gap-2 pb-2 border-b justify-between">
                        <span className="text-primary text-xl font-bold">🎉 Fairness Achieved</span>
                        <span className="text-xs text-muted-foreground bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/20">
                            Note: These are cost responsibilities, not settlement amounts.
                        </span>
                    </div>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-primary flex items-center gap-2">
                                <Info className="w-5 h-5" /> Agent Reasoning
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg leading-relaxed">{agreementResult.agentSummary}</p>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {agreementResult.split.map((s, idx) => (
                            <Card key={idx} className="overflow-hidden border-t-4 border-t-primary/80 shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex justify-between items-center">
                                        {s.name}
                                        <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                            {s.sharePercentage}%
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-3xl font-bold text-foreground">
                                        {plan.currency} {s.recommendedShare}
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-2">
                                        Fair Share Responsibility
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-start gap-2 bg-muted/50 p-2 rounded">
                                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                        {s.reasoning}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Results Actions */}
                    <Card className="bg-muted/30 border-dashed">
                        <CardFooter className="pt-6 flex flex-col sm:flex-row gap-3 justify-end">
                            <Button onClick={() => setAgreementResult(null)} variant="outline" className="w-full sm:w-auto">
                                Edit Plan
                            </Button>
                            <Button onClick={() => downloadAgreementCsv(agreementResult, plan.title)} variant="outline" className="w-full sm:w-auto gap-2">
                                <Download className="h-4 w-4" /> Export CSV
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Opik Dashboard Integration */}
                    <OpikDashboard agreement={agreementResult} />
                </div>
            )}
        </div>
    )
}
