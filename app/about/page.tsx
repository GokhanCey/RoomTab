

export default function AboutPage() {
    return (
        <div className="container max-w-4xl py-20 space-y-12">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold">About RoomTab</h1>
                <p className="text-xl text-muted-foreground">
                    Built for the &quot;Commit to Change&quot; Hackathon 2026.
                </p>
            </div>

            <div className="prose dark:prose-invert max-w-none">
                <p>
                    RoomTab tackles the awkward conversation of splitting rent. By using AI agents,
                    we remove bias and emotion from the equation, generating fair agreements based on objective data
                    like room size and amenities.
                </p>

                <h3 className="text-2xl font-bold mt-8 mb-4">Powered by Opik (Evaluation & Observability)</h3>
                <p>
                    Each AI decision is evaluated for fairness using Opik. We log traces and compare split outcomes using prompt-linked scoring hooks.
                </p>

                <div className="my-8 rounded-lg border bg-muted p-8 text-center text-muted-foreground">
                    <div className="aspect-video w-full bg-background rounded border flex items-center justify-center shadow-sm">
                        <div className="text-center p-4">
                            <p className="font-mono text-sm">[Opik Dashboard Placeholder]</p>
                            <p className="text-xs mt-2">
                                In a live environment, this would display real-time traces <br />
                                of the &apos;agent_inference&apos; span defined in our API.
                            </p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm italic">Simulated Dashboard Embed</p>
                </div>

                <h3 className="text-2xl font-bold mt-8 mb-4">Tech Stack</h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Frontend:</strong> Next.js 15 (App Router), Tailwind CSS, Lucide React</li>
                    <li><strong>AI:</strong> Gemini Flash (via Vercel AI SDK or Google SDK)</li>
                    <li><strong>Observability:</strong> Opik TypeScript SDK</li>
                </ul>
            </div>
        </div>
    )
}
