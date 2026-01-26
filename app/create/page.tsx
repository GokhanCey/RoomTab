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

// --- TYPES ---
type TemplateData = {
    title: string;
    contextPlaceholder: string;
    items: string[];
    people: string[];
}

export default function CreatePlanPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [agreementResult, setAgreementResult] = useState<AgreementData | null>(null)

    // --- TEMPLATES (Rich Defaults) ---
    const TEMPLATES: Record<string, TemplateData> = {
        rent: {
            title: "Monthly Rent Split",
            contextPlaceholder: "e.g. Alex has the larger room with ensuite. Sam moved in halfway through the month.",
            items: ["Rent", "Electricity", "Internet", "Water"],
            people: ["Tenant A", "Tenant B", "Tenant C"]
        },
        trip: {
            title: "Weekend Trip",
            contextPlaceholder: "e.g. Taylor booked the Airbnb. Jordan is a student and gets a discount on tickets.",
            items: ["Airbnb", "Gas / Fuel", "Groceries", "Tickets"],
            people: ["Traveler A", "Traveler B", "Traveler C"]
        },
        dinner: {
            title: "Birthday Dinner",
            contextPlaceholder: "e.g. Sarah didn't drink alcohol. We want to split the birthday girl's share.",
            items: ["Food", "Drinks", "Table Service", "Cake"],
            people: ["Diner A", "Diner B", "Diner C", "Diner D"]
        }
    }

    const [plan, setPlan] = useState<PlanData>({
        title: "Weekend Trip",
        currency: "USD",
        category: "trip",
        participants: [
            { id: "1", name: "Traveler A", tags: [] },
            { id: "2", name: "Traveler B", tags: [] },
            { id: "3", name: "Traveler C", tags: [] }
        ],
        expenses: [
            { id: "1", description: "Airbnb", amount: 0 },
            { id: "2", description: "Gas / Fuel", amount: 0 },
        ],
        description: "" // Start empty
    })

    // --- LOGIC ---

    // Total Cost
    const totalCost = plan.expenses.reduce((sum, item) => sum + item.amount, 0)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePlan = (field: keyof PlanData, value: any) => {
        setPlan(prev => ({ ...prev, [field]: value }))
    }

    // Switch Category & Apply Template
    const handleCategoryChange = (newCategory: string) => {
        let template = TEMPLATES[newCategory]

        if (newCategory === "other") {
            // Empty / Blank Slate
            template = {
                title: "New Expense",
                contextPlaceholder: "Describe any special fairness considerations...",
                items: ["Item 1"],
                people: ["Person A", "Person B"]
            }
        } else if (!template) {
            template = TEMPLATES.trip // fallback
        }

        // Hard Reset based on Template
        setPlan({
            title: template.title,
            currency: plan.currency, // keep currency
            category: newCategory as any,
            description: "", // Reset description to empty
            participants: template.people.map((name, idx) => ({
                id: Date.now().toString() + idx,
                name: name,
                tags: []
            })),
            expenses: template.items.map((item, idx) => ({
                id: Date.now().toString() + idx + 100, // offset id
                description: item,
                amount: 0 // Reset amounts to 0
            }))
        })
        setAgreementResult(null) // Reset results
    }


    // --- CRUD Participants ---
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

    // --- CRUD Expenses ---
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
                alert("Please add at least one expense amount.")
                setLoading(false)
                return
            }

            // Implicit: Logic handles empty description as "Deterministic"
            const res = await fetch('/api/agent/split', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(plan)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.agentSummary || "Agent failed")
            }

            setAgreementResult(data)

            // Save to Local History
            const historyItem = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                title: plan.title,
                totalAmount: totalCost,
                currency: plan.currency,
                split: data.split,
                traceId: data.metadata?.trace_id,
                agentSummary: data.agentSummary
            }

            try {
                const existing = JSON.parse(localStorage.getItem('roomtab_history') || '[]')
                localStorage.setItem('roomtab_history', JSON.stringify([historyItem, ...existing]))
            } catch (e) {
                console.error("Failed to save history", e)
            }

            setTimeout(() => {
                document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })
            }, 100)

        } catch (error: any) {
            console.error(error)
            alert(error.message || "Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container max-w-3xl py-10 pb-32">
            <div className="mb-8 flex flex-col items-center justify-center text-center relative">
                <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-0 top-0 hidden sm:flex"
                    onClick={() => router.push('/history')}
                >
                    <ArrowRight className="mr-2 h-4 w-4" /> View History
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Smart Split Creator</h1>
                <p className="text-muted-foreground">Select a category to load a template, then fill in the numbers.</p>
            </div>

            <div className="grid gap-6">

                {/* 1. Event / Plan Details */}
                <Card className="border-l-4 border-l-primary/50">
                    <CardHeader>
                        <CardTitle>What are we splitting?</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Category (Loads Template)</Label>
                            <Select
                                value={plan.category}
                                onValueChange={handleCategoryChange}>
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
                        <div className="space-y-2">
                            <Label>Event Title</Label>
                            <Input
                                value={plan.title}
                                onChange={(e) => updatePlan('title', e.target.value)}
                                placeholder="e.g. Ski Trip"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Expenses List */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Expenses</CardTitle>
                            <CardDescription>Enter the amounts for each item.</CardDescription>
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
                            Add specific tags like "Non-drinker" or "Arrived late" to influence the AI.
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
                        <CardTitle className="flex items-center gap-2">
                            Additional Context
                            <span className="text-xs font-normal text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                                AI Powered
                            </span>
                        </CardTitle>
                        <CardDescription>
                            Describe any special situations. Leave empty for a standard split calculation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Textarea
                                placeholder={TEMPLATES[plan.category]?.contextPlaceholder || "Describe the situation..."}
                                value={plan.description || ''}
                                onChange={(e) => {
                                    if (e.target.value.length <= 500) {
                                        updatePlan('description', e.target.value)
                                    }
                                }}
                                className="resize-none h-24 pb-6"
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                                {plan.description?.length || 0}/500
                            </div>
                        </div>
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
            {
                agreementResult && (
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
                                    <Info className="w-5 h-5" /> Fairness Logic
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
                )
            }
        </div >
    )
}


