import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PricingPage() {
    return (
        <div className="container py-20 space-y-12">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <h1 className="font-heading text-4xl font-bold sm:text-6xl">
                    Simple, Transparent Pricing
                </h1>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Start for free. Upgrade for advanced fairness tools and historic tracking.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Free Tier */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Free</CardTitle>
                        <CardDescription>For one-off splits</CardDescription>
                        <div className="text-3xl font-bold mt-2">$0</div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ul className="grid gap-3 text-sm text-muted-foreground">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4" /> 2 Active Plans</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4" /> Basic Agent Inference</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4" /> 1 Month History</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" disabled variant="outline">Coming Soon</Button>
                    </CardFooter>
                </Card>

                {/* Pro Tier */}
                <Card className="flex flex-col border-primary shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl">Best Value</div>
                    <CardHeader>
                        <CardTitle>Pro</CardTitle>
                        <CardDescription>For organized roommates</CardDescription>
                        <div className="text-3xl font-bold mt-2 text-primary">$5<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ul className="grid gap-3 text-sm text-muted-foreground">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Unlimited Plans</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Advanced Agent Reasoning</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> PDF Export</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Email Reminders</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="default" disabled>Coming Soon</Button>
                    </CardFooter>
                </Card>

                {/* Team Tier */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>House</CardTitle>
                        <CardDescription>For co-living spaces</CardDescription>
                        <div className="text-3xl font-bold mt-2">$15<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ul className="grid gap-3 text-sm text-muted-foreground">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4" /> Everything in Pro</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4" /> Multi-user accounts</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4" /> Expense Tracking & Settlement</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4" /> Priority Support</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline" disabled>Coming Soon</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
