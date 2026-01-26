"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, ArrowUpRight, Clock, Trash2, Check, ExternalLink } from "lucide-react"

export default function HistoryPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [history, setHistory] = useState<any[]>([])
    const [feedbackStatus, setFeedbackStatus] = useState<Record<string, string>>({})

    useEffect(() => {
        const saved = localStorage.getItem('roomtab_history')
        if (saved) {
            try {
                setHistory(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to load history", e)
            }
        }
    }, [])

    const clearHistory = () => {
        if (confirm("Are you sure you want to clear your local history?")) {
            localStorage.removeItem('roomtab_history')
            setHistory([])
        }
    }

    const sendFeedback = async (id: string, traceId: string, score: number) => {
        if (!traceId) {
            alert("No Trace ID found for this item (it might be old). Cannot send feedback.")
            return;
        }

        // Optimistic UI update
        const statusKey = `${id}-${score}`
        setFeedbackStatus(prev => ({ ...prev, [id]: "sending" }))

        try {
            const res = await fetch('/api/agent/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ traceId, score })
            })

            if (!res.ok) throw new Error("Failed to send feedback")

            setFeedbackStatus(prev => ({ ...prev, [id]: score === 1 ? "liked" : "disliked" }))

        } catch (error) {
            console.error(error)
            alert("Failed to send feedback to Opik.")
            setFeedbackStatus(prev => ({ ...prev, [id]: "" }))
        }
    }

    return (
        <div className="container max-w-4xl py-10 space-y-8 pb-32">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" className="mb-2 -ml-2 text-muted-foreground" onClick={() => window.location.href = '/create'}>
                        <ArrowUpRight className="w-4 h-4 mr-2 rotate-180" /> Back to Creator
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Split History</h1>
                    <p className="text-muted-foreground">Your locally saved agreements & fairness feedback.</p>
                </div>
                {history.length > 0 && (
                    <Button variant="ghost" className="text-destructive hover:text-destructive/80" onClick={clearHistory}>
                        <Trash2 className="w-4 h-4 mr-2" /> Clear History
                    </Button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/50">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No history yet</h3>
                    <p className="text-muted-foreground">Generate a split plan to see it here.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {history.map((item) => (
                        <Card key={item.id} className="overflow-hidden bg-card transition-all hover:shadow-md border-l-4 border-l-primary/40">
                            <CardHeader className="bg-muted/10 pb-4">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            {item.title || "Untitled Split"}
                                            <span className="text-xs font-normal text-muted-foreground border px-2 py-0.5 rounded-full bg-background ml-2">
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </span>
                                        </CardTitle>
                                        <CardDescription className="font-mono text-xs mt-1">
                                            Trace: {item.traceId || "N/A"}
                                        </CardDescription>
                                    </div>
                                    <div className="text-2xl font-bold text-primary">
                                        {item.currency} {item.totalAmount}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="p-4 bg-muted/30 rounded-md text-sm italic border">
                                    "{item.agentSummary}"
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {item.split.map((p: any, idx: number) => (
                                        <div key={idx} className="bg-background border rounded p-3 text-center">
                                            <div className="font-medium text-sm truncate">{p.name}</div>
                                            <div className="text-lg font-bold text-primary">{item.currency}{p.recommendedShare}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/20 flex flex-col sm:flex-row gap-4 items-center justify-between py-3">
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <span className="font-medium text-foreground">Was this fair?</span>
                                    <span className="text-xs opacity-70">(Feedback trains the Agent)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {feedbackStatus[item.id] === 'liked' ? (
                                        <span className="text-green-600 flex items-center gap-1 text-sm font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200">
                                            <Check className="w-4 h-4" /> Feedback Sent
                                        </span>
                                    ) : feedbackStatus[item.id] === 'disliked' ? (
                                        <span className="text-red-600 flex items-center gap-1 text-sm font-medium bg-red-50 px-3 py-1 rounded-full border border-red-200">
                                            <Check className="w-4 h-4" /> Feedback Sent
                                        </span>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                                                onClick={() => sendFeedback(item.id, item.traceId, 1)}
                                                disabled={!item.traceId || !!feedbackStatus[item.id]}
                                            >
                                                <ThumbsUp className="w-4 h-4 mr-2" /> Fair
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                                onClick={() => sendFeedback(item.id, item.traceId, 0)}
                                                disabled={!item.traceId || !!feedbackStatus[item.id]}
                                            >
                                                <ThumbsDown className="w-4 h-4 mr-2" /> Unfair
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
