"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, User, Tag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { scenarios } from "@/lib/scenarios"

export function ScenarioCarousel() {
    const [index, setIndex] = useState(0)
    const current = scenarios[index]

    const next = () => setIndex((prev) => (prev + 1) % scenarios.length)
    const prev = () => setIndex((prev) => (prev - 1 + scenarios.length) % scenarios.length)

    return (
        <div className="relative group">
            <Card className="border-2 border-primary/10 overflow-hidden">
                <CardHeader className="bg-muted/20 pb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl">{current.title}</CardTitle>
                            <CardDescription>
                                Total: {current.currency} {current.expenses.reduce((s, x) => s + x.amount, 0)}
                            </CardDescription>
                        </div>
                        <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded capitalize">
                            {current.category}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                        {/* Left: Setup */}
                        <div className="p-6 space-y-4">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Input</h4>
                            <div className="space-y-3">
                                {current.participants.map(p => (
                                    <div key={p.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                                <User className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <span className="font-medium">{p.name}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            {p.tags.length > 0 ? p.tags.map(t => (
                                                <span key={t} className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                                                    {t}
                                                </span>
                                            )) : <span className="text-[10px] text-muted-foreground italic">No tags</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Output */}
                        <div className="p-6 space-y-4 bg-slate-50 dark:bg-slate-900/50">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Agent Result</h4>
                            <div className="space-y-3">
                                {current.output.split.map((s, idx) => (
                                    <div key={idx} className="bg-background border rounded-lg p-3 shadow-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-sm">{s.name}</span>
                                            <span className="font-mono text-primary font-bold">
                                                ${s.share.toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-tight">
                                            {s.reasoning}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground italic mt-2 border-t pt-2">
                                "{current.output.summary}"
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12">
                <Button variant="outline" size="icon" className="rounded-full h-10 w-10 shadow-lg" onClick={prev}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12">
                <Button variant="outline" size="icon" className="rounded-full h-10 w-10 shadow-lg" onClick={next}>
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>

            <div className="flex justify-center gap-2 mt-4">
                {scenarios.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${index === idx ? 'bg-primary w-4' : 'bg-muted-foreground/30'}`}
                    />
                ))}
            </div>
        </div>
    )
}
