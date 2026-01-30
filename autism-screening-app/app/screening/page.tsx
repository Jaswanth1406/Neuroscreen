"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScreeningForm } from "@/components/screening-form"
import { ResultsDashboard } from "@/components/results-dashboard"
import { useSession, signOut } from "@/lib/auth-client"
import { 
  Brain, 
  ClipboardList, 
  BarChart3, 
  LogIn, 
  LayoutDashboard, 
  LogOut,
  ArrowLeft,
  Shield
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ScreeningResult } from "@/app/page"

export default function ScreeningPage() {
  const [screeningResult, setScreeningResult] = useState<ScreeningResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const { data: session, isPending } = useSession()

  const handleScreeningComplete = async (result: ScreeningResult) => {
    setScreeningResult(result)
    
    // Save to database if user is logged in
    if (session) {
      try {
        await fetch("/api/screening-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prediction: result.prediction,
            probability: result.probability,
            risk_level: result.risk_level,
            confidence: result.probability >= 0.7 ? "High" : result.probability >= 0.4 ? "Moderate" : "Low",
            aq10_total: result.aq10_total,
            social_score: result.social_score,
            attention_score: result.attention_score,
            contributing_factors: result.contributing_factors,
          }),
        })
      } catch (error) {
        console.error("Failed to save screening result:", error)
      }
    }
    
    setShowResults(true)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="hover:bg-blue-50 dark:hover:bg-blue-950">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-lg opacity-50" />
                  <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                    <Brain className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    NeuroScreen
                  </h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    AI-Powered Autism Screening
                  </p>
                </div>
              </Link>
            </div>
            
            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              {isPending ? (
                <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              ) : session ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline" className="gap-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950">
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Avatar className="h-9 w-9 ring-2 ring-blue-500/20">
                          <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {session.user.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5">
                        <p className="font-medium">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground">{session.user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-500 cursor-pointer"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Link href="/auth">
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {showResults && screeningResult ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                Your Screening Results
              </h2>
              <Button variant="outline" onClick={() => setShowResults(false)} className="gap-2">
                <ClipboardList className="h-4 w-4" />
                New Screening
              </Button>
            </div>
            <ResultsDashboard result={screeningResult} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                    <ClipboardList className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl">AQ-10 Screening Questionnaire</CardTitle>
                <CardDescription className="text-base max-w-lg mx-auto">
                  Complete the autism spectrum quotient questionnaire for an AI-powered assessment. This takes about 5 minutes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScreeningForm onComplete={handleScreeningComplete} />
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Disclaimer */}
        <Card className="border-0 shadow-lg bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 h-fit">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">Important Disclaimer</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  This tool is intended for screening purposes only and is NOT a diagnostic instrument. 
                  A positive screening result does not mean a diagnosis of ASD. Please consult with a qualified healthcare professional 
                  for comprehensive evaluation and diagnosis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
