"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./dialog"
import { Check, Download, FileText, Lock } from "lucide-react"
import { useState } from "react"

export function ExportModal() {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto gap-2">
                    <FileText className="h-4 w-4" /> Export PDF
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" /> Unlock Professional Reports
                    </DialogTitle>
                    <DialogDescription>
                        PDF Export is a <strong>Pro</strong> feature. Upgrade to create legally binding agreements and track long-term history.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="border rounded-lg p-4 bg-muted/20 space-y-3">
                        <h4 className="font-semibold text-sm">RoomTab Pro includes:</h4>
                        <ul className="grid gap-2 text-sm text-muted-foreground">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Printable PDF Agreements</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Unlimited History Storage</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> "Financial Health" Insights</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> Email Notifications</li>
                        </ul>
                    </div>
                </div>
                <DialogFooter className="flex-col sm:flex-col gap-2">
                    <Button className="w-full" onClick={() => window.open('https://stripe.com', '_blank')}>
                        Start 7-Day Free Trial
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                        Maybe Later
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
