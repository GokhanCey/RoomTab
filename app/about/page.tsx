import { OpikDashboard } from "@/components/OpikDashboard"
import { ScenarioCarousel } from "@/components/ScenarioCarousel"

export default function AboutPage() {
    return (
        <div className="container max-w-4xl py-12 space-y-12">
            {/* Header ... */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">About RoomTab</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    A fairness-first agent built to solve the social friction of shared expenses.
                </p>
            </div>

            {/* Mission ... */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* ... existing content ... used mock for simplicity in previous steps, rewriting cleanly */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">The Mission</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Splitting bills isn't just math; it's about context. RoomTab uses AI to understand nuance - like who didn't drink, who arrived late, or who is a student on a budget - and proposes a split that feels fair to everyone.
                    </p>
                </div>
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Hackathon Tracks</h2>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                        <li><strong>Best Use of Opik</strong>: Full observability of "Fairness" metrics.</li>
                        <li><strong>Financial Health</strong>: Active subsidies for students & low-income users.</li>
                    </ul>
                </div>
            </div>

            {/* Live Examples Carousel */}
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">See It In Action</h2>
                    <p className="text-muted-foreground">Browse common scenarios where RoomTab ensures fairness.</p>
                </div>
                <div className="px-4 md:px-12">
                    <ScenarioCarousel />
                </div>
            </div>

            {/* Opik Dashboard Mock (existing) */}
            <div className="space-y-6 pt-8 border-t">
                <h2 className="text-2xl font-bold text-center">Observability Powered by Opik</h2>
                <div className="max-w-3xl mx-auto">
                    <OpikDashboard agreement={{
                        totalAmount: 1000,
                        split: [],
                        agentSummary: "",
                        timestamp: "",
                        metadata: { subsidy_active: true, model: "gemini-2.5-flash-mock" }
                    }} />
                </div>
            </div>
            <h3 className="text-2xl font-bold mt-8 mb-4">Tech Stack</h3>
            <ul className="list-disc pl-6 space-y-2">
                <li><strong>Frontend:</strong> Next.js 15 (App Router), Tailwind CSS, Lucide React</li>
                <li><strong>AI:</strong> Gemini Flash (via Vercel AI SDK or Google SDK)</li>
                <li><strong>Observability:</strong> Opik TypeScript SDK</li>
            </ul>
        </div>
    )
}
