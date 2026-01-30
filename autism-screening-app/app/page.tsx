"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Sparkles,
  Shield,
  Clock,
  HeartHandshake,
  ChevronRight,
  CheckCircle2,
  Zap,
  Users,
  LineChart,
  ArrowDown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface ScreeningResult {
  prediction: number
  probability: number
  risk_level: string
  aq10_total: number
  social_score: number
  attention_score: number
  contributing_factors: Array<{
    feature: string
    question: string
    value: number
    importance: number
  }>
  recommendations?: string[]
  evidence_summary?: string
}

export default function Home() {
  const [screeningResult, setScreeningResult] = useState<ScreeningResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const { data: session, isPending } = useSession()
  const screeningRef = useRef<HTMLDivElement>(null)

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

  const scrollToScreening = () => {
    screeningRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
      <div className="container mx-auto px-4 py-8 space-y-12">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 md:p-12 lg:p-16 text-white shadow-2xl">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
          
          <div className="relative z-10 max-w-3xl">
            <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Assessment
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Early Autism Screening
              <br />
              <span className="text-blue-200">Made Accessible</span>
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
              Our AI-powered platform provides quick, evidence-based autism spectrum screening using the validated AQ-10 questionnaire combined with machine learning analysis.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                onClick={scrollToScreening}
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl shadow-black/20 gap-2 text-base"
              >
                Start Free Screening
                <ArrowDown className="h-5 w-5" />
              </Button>
              {!session && (
                <Link href="/auth">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="gap-2 text-base bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    <LogIn className="h-5 w-5" />
                    Sign In to Save Results
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 w-fit mb-4 shadow-lg shadow-blue-500/25">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Quick Assessment</h3>
              <p className="text-muted-foreground text-sm">
                Complete the AQ-10 screening in just 5 minutes with our streamlined questionnaire.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 w-fit mb-4 shadow-lg shadow-purple-500/25">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Analysis</h3>
              <p className="text-muted-foreground text-sm">
                Advanced machine learning model trained on clinical data for accurate risk assessment.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 w-fit mb-4 shadow-lg shadow-green-500/25">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Private & Secure</h3>
              <p className="text-muted-foreground text-sm">
                Your data is encrypted and stored securely. We prioritize your privacy.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 w-fit mb-4 shadow-lg shadow-pink-500/25">
                <HeartHandshake className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Support</h3>
              <p className="text-muted-foreground text-sm">
                Get personalized therapy recommendations from our Clinical Support AI.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6 text-center">
              <LineChart className="h-8 w-8 mx-auto mb-2 opacity-80" />
              <p className="text-3xl font-bold">95%</p>
              <p className="text-sm text-white/80">Model Accuracy</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-80" />
              <p className="text-3xl font-bold">5 min</p>
              <p className="text-sm text-white/80">Average Time</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-80" />
              <p className="text-3xl font-bold">AQ-10</p>
              <p className="text-sm text-white/80">Validated Test</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <CardContent className="pt-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-80" />
              <p className="text-3xl font-bold">Free</p>
              <p className="text-sm text-white/80">For Everyone</p>
            </CardContent>
          </Card>
        </div>

        {/* Screening Section */}
        <div ref={screeningRef} className="scroll-mt-24">
          {showResults && screeningResult ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  Your Results
                </h2>
                <Button variant="outline" onClick={() => setShowResults(false)} className="gap-2">
                  <ClipboardList className="h-4 w-4" />
                  New Screening
                </Button>
              </div>
              <ResultsDashboard result={screeningResult} />
            </div>
          ) : (
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                    <ClipboardList className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>AQ-10 Screening Questionnaire</CardTitle>
                    <CardDescription>
                      Complete the autism spectrum quotient questionnaire for an AI-powered assessment
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScreeningForm onComplete={handleScreeningComplete} />
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Disclaimer */}
        <Card className="border-0 shadow-lg bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
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

      {/* Footer */}
      <footer className="border-t border-white/20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NeuroScreen
              </span>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>AI Wars 24 Hackathon • Built with Next.js, AI SDK & Machine Learning</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {session && (
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
