import { Check, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PricingPage() {
    return (
        <div className="container py-20 space-y-12">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                <h1 className="font-heading text-4xl font-bold sm:text-6xl">
                    Fairness for Every Occasion
                </h1>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    From quick dinners to year-long leases. Choose the plan that fits your social life.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Free Tier */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Starter</CardTitle>
                        <CardDescription>For one-offs & quick trips</CardDescription>
                        <div className="text-3xl font-bold mt-2">$0</div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ul className="grid gap-3 text-sm text-muted-foreground">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4" /> Dinners, Dates, & Drinks</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4" /> Basic "Fairness" Logic</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4" /> 7-Day History</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" disabled variant="outline">Current Plan</Button>
                    </CardFooter>
                </Card>

                {/* Pro Tier */}
                <Card className="flex flex-col border-primary shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl">Most Popular</div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Household <Star className="w-4 h-4 fill-primary text-primary" />
                        </CardTitle>
                        <CardDescription>For recurring living costs</CardDescription>
                        <div className="text-3xl font-bold mt-2 text-primary">$4.99<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ul className="grid gap-3 text-sm text-muted-foreground">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Unlimited History</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Advanced Context (2x token limit)</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> PDF Export & Agreements</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> "Financial Health" Insights</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="default" disabled>Coming Soon</Button>
                    </CardFooter>
                </Card>

                {/* Team Tier */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Organizer</CardTitle>
                        <CardDescription>For big groups & events</CardDescription>
                        <div className="text-3xl font-bold mt-2">$12.99<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ul className="grid gap-3 text-sm text-muted-foreground">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4" /> Everything in Pro</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4" /> Multi-user Management</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4" /> Receipt Scanning (OCR)</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4" /> Dedicated Support</li>
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

