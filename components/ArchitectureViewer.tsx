"use client"

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { ZoomIn } from "lucide-react"

export function ArchitectureViewer() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="border rounded-xl overflow-hidden shadow-lg bg-white dark:bg-zinc-900 cursor-pointer group relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/Architecture.png"
                        alt="RoomTab Architecture Diagram"
                        className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 bg-white/90 text-black px-4 py-2 rounded-full font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center gap-2">
                            <ZoomIn className="w-4 h-4" /> Click to Expand
                        </div>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] w-full p-0 overflow-hidden bg-transparent border-none shadow-none text-white">
                <DialogTitle className="sr-only">System Architecture Diagram</DialogTitle>
                <div className="relative w-full h-[90vh] flex items-center justify-center pointer-events-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/Architecture.png"
                        alt="RoomTab Architecture Diagram - Full Screen"
                        className="max-w-full max-h-full object-contain drop-shadow-2xl pointer-events-auto rounded-lg"
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
