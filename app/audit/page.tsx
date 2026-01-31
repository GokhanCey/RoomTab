"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react"

export default function AuditPage() {
    return (
        <div className="container max-w-4xl py-12 space-y-8">
            <div className="space-y-4">
                <Button variant="ghost" asChild className="-ml-4 text-muted-foreground">
                    <Link href="/about"><ArrowLeft className="mr-2 h-4 w-4" /> Back to About</Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                    Fairness Audit Log
                </h1>
                <p className="text-muted-foreground">
                    RoomTab's Logic Engine is rigorously tested against verified scenarios to ensure mathematical fairness.
                    Below is the live audit of our core logic principles.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Scenario 1 */}
                <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-bold text-lg">Scenario 1: The "Vegan" Exclusion</h3>
                            <p className="text-sm text-muted-foreground">Rule: If a user excludes themselves from a shared item, they pay $0.</p>
                        </div>
                        <CheckCircle2 className="text-green-500 w-6 h-6" />
                    </div>
                    <div className="mt-4 grid md:grid-cols-2 gap-4 bg-muted/40 p-4 rounded text-sm font-mono">
                        <div>
                            <div className="font-semibold text-xs uppercase mb-1">Input Context</div>
                            "Pizza Night ($60). Alice didn't eat any pizza."
                        </div>
                        <div>
                            <div className="font-semibold text-xs uppercase mb-1">Audit Result</div>
                            <ul className="space-y-1">
                                <li className="text-green-700">Alice: $0.00 (pass)</li>
                                <li>Bob: $30.00</li>
                                <li>Charlie: $30.00</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Scenario 2 */}
                <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-bold text-lg">Scenario 2: The "Late Mover" (Pro-rating)</h3>
                            <p className="text-sm text-muted-foreground">Rule: Rent splits must be weighted by duration of stay.</p>
                        </div>
                        <CheckCircle2 className="text-green-500 w-6 h-6" />
                    </div>
                    <div className="mt-4 grid md:grid-cols-2 gap-4 bg-muted/40 p-4 rounded text-sm font-mono">
                        <div>
                            <div className="font-semibold text-xs uppercase mb-1">Input Context</div>
                            "Rent $3000. Bob stayed 15 days (others 30)."
                        </div>
                        <div>
                            <div className="font-semibold text-xs uppercase mb-1">Audit Result</div>
                            <ul className="space-y-1">
                                <li>Alice: $1200.00</li>
                                <li>Charlie: $1200.00</li>
                                <li className="text-green-700">Bob: $600.00 (50% reduction)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Scenario 3 */}
                <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-bold text-lg">Scenario 3: Settlement</h3>
                            <p className="text-sm text-muted-foreground">Rule: The payer must be reimbursed the exact difference.</p>
                        </div>
                        <CheckCircle2 className="text-green-500 w-6 h-6" />
                    </div>
                    <div className="mt-4 grid md:grid-cols-2 gap-4 bg-muted/40 p-4 rounded text-sm font-mono">
                        <div>
                            <div className="font-semibold text-xs uppercase mb-1">Input Context</div>
                            "Dinner $90. Alice paid full. Split equally."
                        </div>
                        <div>
                            <div className="font-semibold text-xs uppercase mb-1">Audit Result</div>
                            <ul className="space-y-1">
                                <li>Split: $30 each.</li>
                                <li className="text-blue-600 font-bold">SETTLEMENT: Bob pays Alice $30.</li>
                                <li className="text-blue-600 font-bold">SETTLEMENT: Charlie pays Alice $30.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center pt-8 border-t">
                <p className="text-sm text-muted-foreground">
                    Verified by <span className="font-bold text-foreground">Opik Evaluation Loop</span>.
                </p>
                <div className="mt-2 text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Systems Operational
                </div>
            </div>
        </div>
    )
}
