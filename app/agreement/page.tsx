"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Share2, Sparkles, AlertCircle, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AgreementData, PlanData } from "@/lib/types"

export default function AgreementPage() {
    const router = useRouter()
    const [agreement, setAgreement] = useState<AgreementData | null>(null)
    const [plan, setPlan] = useState<PlanData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // In this demo, we stored the result in localStorage in create/page.tsx
        // But wait, create/page.tsx now shows results INLINE.
        // So this page might be deprecated OR used for "Sharing".
        // Let's assume this page is still accessible via direct link or if we add a "View Full Agreement" button.
        // For now, let's keep it functional as a fallback or detail view.

        const savedAgreement = localStorage.getItem('lastAgreement')
        const savedPlan = localStorage.getItem('lastPlan') // We need to store plan too if we want details

        if (savedAgreement) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAgreement(JSON.parse(savedAgreement))
        }

        setLoading(false)
    }, [])

    // Since we moved to inline results, this page is less critical but good to have updated.
    // If accessed directly without data:
    if (loading) return <div className="container py-20 text-center">Loading...</div>
    if (!agreement) {
        return (
            <div className="container py-20 text-center space-y-4">
                <h1 className="text-2xl font-bold">No Active Agreement</h1>
                <Button onClick={() => router.push('/create')}>Create New Split</Button>
            </div>
        )
    }

    return (
        <div className="container max-w-4xl py-10 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/create')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Agreement Details</h1>
            </div>

            <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-primary flex items-center gap-2">
                        <Sparkles className="w-5 h-5" /> Agent Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg leading-relaxed">{agreement.agentSummary}</p>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {agreement.split.map((s, idx) => (
                    <Card key={idx} className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base font-medium">
                                {s.name}
                            </CardTitle>
                            <span className="font-bold">{s.sharePercentage}%</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{s.recommendedShare}</div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {s.reasoning}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
