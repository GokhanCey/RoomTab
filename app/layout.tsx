import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RoomTab - AI Expense Splitting",
  description: "Fair, AI-powered cost splitting for roommates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "min-h-screen bg-background font-sans antialiased")}>
        <div className="relative flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <div className="mr-4 hidden md:flex">
                <Link className="mr-6 flex items-center space-x-2" href="/">
                  <span className="hidden font-bold sm:inline-block">RoomTab</span>
                </Link>
                <nav className="flex items-center space-x-6 text-sm font-medium">
                  <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/create">Create Plan</Link>
                  <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/about">About</Link>
                  <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/pricing">Pricing</Link>
                </nav>
              </div>
              <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                <div className="w-full flex-1 md:w-auto md:flex-none">
                </div>
                <nav className="flex items-center">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/login">Login</Link>
                  </Button>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="py-6 md:px-8 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
              <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                Built for &quot;Commit to Change&quot; Hackathon. Powered by <span className="font-bold text-primary">Gemini 2.0 Flash</span> & <span className="font-bold text-primary">Opik Observability</span>.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
