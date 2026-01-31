import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Brain, ShieldCheck, Scale, Split, MessageSquare, CheckCircle2, ArrowRight } from "lucide-react"
import { ArchitectureViewer } from "@/components/ArchitectureViewer"

export default function AboutPage() {
    return (
        <div className="container max-w-5xl py-12 space-y-16">
            {/* 1. Hero */}
            <div className="space-y-6 text-center max-w-3xl mx-auto">
                <Button variant="ghost" asChild className="text-muted-foreground mb-4">
                    <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
                </Button>
                <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    The Logic of Fairness
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    Splitting finances isn't just math—it's context. RoomTab uses advanced AI to understand the *nuance* of who pays what.
                </p>
            </div>

            {/* 2. How It Works (Visual Steps) */}
            <div className="grid md:grid-cols-3 gap-8 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-border -z-10" />

                <div className="flex flex-col items-center text-center space-y-4 bg-background p-6 rounded-xl border shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold">1. Describe</h3>
                    <p className="text-sm text-muted-foreground">
                        "Alice is vegan and didn't eat the steak. Bob arrived 2 weeks late."
                    </p>
                </div>

                <div className="flex flex-col items-center text-center space-y-4 bg-background p-6 rounded-xl border shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Brain className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold">2. Analyze</h3>
                    <p className="text-sm text-muted-foreground">
                        Our Logic Engine (Gemini 2.0 Flash) calculates weights, exclusions, and subsidies.
                    </p>
                </div>

                <div className="flex flex-col items-center text-center space-y-4 bg-background p-6 rounded-xl border shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400">
                        <Scale className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold">3. Resolve</h3>
                    <p className="text-sm text-muted-foreground">
                        Get a mathematically fair split + a settlement plan for "Who Owes Whom".
                    </p>
                </div>
            </div>

            {/* 3. Logic Showcase */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                        <ShieldCheck className="text-primary w-8 h-8" /> Intelligent Fairness
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        We don't just guess. We follow strict fairness principles.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-6 h-6 text-green-500 mt-1" />
                            <div>
                                <span className="font-bold block">Resource Usage</span>
                                If you don't use it, you shouldn't pay for it.
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-6 h-6 text-green-500 mt-1" />
                            <div>
                                <span className="font-bold block">Duration</span>
                                Prorated rent for partial months is calculated to the day.
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-6 h-6 text-green-500 mt-1" />
                            <div>
                                <span className="font-bold block">Financial Capacity</span>
                                (Optional) Suggests subsidies for students or unemployed members.
                            </div>
                        </li>
                    </ul>
                    <div className="pt-4">
                        <Link href="/audit" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                            Read the full Fairness Audit <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Example Cards */}
                <div className="space-y-4">
                    <div className="bg-muted/40 p-4 rounded-lg border">
                        <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Input</div>
                        <div className="font-mono text-sm bg-background p-2 rounded border">
                            "Trip cost $1000. Sarah is a student."
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                            <div className="text-xs font-semibold text-muted-foreground uppercase">Output</div>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">-20% Savings</span>
                        </div>
                        <div className="font-mono text-sm bg-background p-2 rounded border mt-1">
                            Sarah pays $266 (Student Discount applied).
                        </div>
                    </div>

                    <div className="bg-muted/40 p-4 rounded-lg border">
                        <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Input</div>
                        <div className="font-mono text-sm bg-background p-2 rounded border">
                            "Rent $1500. Jack has the master bedroom."
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                            <div className="text-xs font-semibold text-muted-foreground uppercase">Output</div>
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold">Premium Applied</span>
                        </div>
                        <div className="font-mono text-sm bg-background p-2 rounded border mt-1">
                            Jack pays $850 (~60/40 Split).
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. System Architecture */}
            <div className="space-y-6 text-center">
                <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
                    <Split className="text-primary w-8 h-8" /> System Architecture
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Built with Next.js 15, Gemini 2.0 Flash, and Opik Observability.
                    Logic V4 ensures zero-sum fairness through item-iterative exclusions.
                </p>

                <ArchitectureViewer />
            </div>

            {/* 5. Hackathon Details */}
            <div className="p-8 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900">
                <h3 className="text-xl font-bold mb-4 text-blue-900 dark:text-blue-100">Built for the Hackathon</h3>
                <div className="grid sm:grid-cols-2 gap-8 text-sm">
                    <div>
                        <div className="font-bold text-lg text-primary mb-2">🏆 Best Use of Opik</div>
                        <p className="text-muted-foreground">
                            We use Opik for end-to-end observability. Every split generated is traced, tagged with model version, and verified against latency constraints. We also use Opik to run offline evaluation datasets ("The Vegan Test") to ensure the agent doesn't regress.
                        </p>
                    </div>
                    <div>
                        <div className="font-bold text-lg text-primary mb-2">💰 Financial Health</div>
                        <p className="text-muted-foreground">
                            RoomTab promotes financial fairness by preventing the "silent tax" of equal splits. By accounting for income disparity ("Student") and usage ("Late Arrival"), we ensure money doesn't ruin friendships.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
