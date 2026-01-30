"use client";

import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
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
    <main className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex head1!no-underline text-decoration-none items-center gap-3 hover:opacity-80 transition-opacity">
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
                  <Link href="/dashboard" className="!no-underline ">
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
                        <Link href="/dashboard" className="cursor-pointer!no-underline ">
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
                <Link href="/auth" className="!no-underline ">
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

        {/* Hero Section with autism imagery */}
        <section className="glass-section scroll-fade">
          <div className="glass-section-inner p-6 md:p-10 lg:p-12">
            <div className="row g-4 align-items-center">
              {/* Text / CTA */}
              <div className="col-12 col-lg-6">
                <div className="space-y-4">
                  <Badge className="mb-2 bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 text-white border-transparent hover:bg-sky-500">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Powered Autism Screening
                  </Badge>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                    Early Autism Screening
                    <br />
                    <span className="text-slate-900 dark:text-slate-100">
                      <span className="text-sky-500">Made</span> Gentle & Visual
                    </span>
                  </h2>
                  <p className="text-base md:text-lg text-slate-600 dark:text-slate-200/80 max-w-xl">
                    A calm, colorful space for parents and clinicians to run
                    science-backed AQ-10 screenings, visualize risk, and explore
                    supportive next steps.
                  </p>
                  <div className="d-flex flex-wrap gap-3 mt-3">
                    <Button
                      size="lg"
                      onClick={scrollToScreening}
                      className="gap-2 text-base bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 hover:from-sky-600 hover:via-indigo-600 hover:to-fuchsia-600 shadow-lg shadow-sky-500/40"
                    >
                      Start Free Screening
                      <ArrowDown className="h-5 w-5" />
                    </Button>
                    {!session && (
                      <Link href="/auth" className="!no-underline ">
                        <Button
                          size="lg"
                          variant="outline"
                          className="gap-2 text-base border-sky-200 bg-white/70 hover:bg-white text-sky-700"
                        >
                          <LogIn className="h-5 w-5" />
                          Sign in to save results
                        </Button>
                      </Link>
                    )}
                  </div>
                  <div className="d-flex flex-wrap gap-2 mt-4">
                    <Badge variant="outline" className="bg-sky-50/80 text-sky-700 border-sky-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      AQ-10 clinically validated
                    </Badge>
                    <Badge variant="outline" className="bg-indigo-50/80 text-indigo-700 border-indigo-200">
                      <Brain className="h-3 w-3 mr-1" />
                      ML-powered insights
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Visual / 3D style card with images */}
              <div className="col-12 col-lg-6 mt-4 mt-lg-0">
                <div className="neuro-hero-3d">
                  <div className="neuro-hero-orbit" />
                  <div className="neuro-hero-card">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="neuro-hero-pill">
                        <Sparkles className="h-3 w-3" />
                        Calm visual environment
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-300">
                        Autism-friendly colors
                      </span>
                    </div>

                    <div className="rounded-2xl overflow-hidden mb-3 shadow-lg">
                      <Image
                        src="/images/autism5.jpg"
                        alt="Autism awareness visual with ribbon"
                        width={640}
                        height={360}
                        className="w-100 h-auto object-cover"
                        priority
                      />
                    </div>

                    <div className="neuro-hero-mini-grid">
                      <div className="neuro-hero-mini-card">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <Image
                            src="/images/autism1.jpg"
                            alt="Child-focused autism support"
                            width={40}
                            height={40}
                            className="rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-300">Screening journey</p>
                            <p className="text-sm font-semibold">Age 4–12 focus</p>
                          </div>
                        </div>
                      </div>
                      <div className="neuro-hero-mini-card">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <Image
                            src="/images/autism3.jpg"
                            alt="Autism puzzle support"
                            width={40}
                            height={40}
                            className="rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-300">Therapy tasks</p>
                            <p className="text-sm font-semibold">Visual progress</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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

        {/* Stats + autism imagery strip */}
        <section className="scroll-fade-delayed space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('/images/autism4.jpg')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="absolute inset-0 bg-white/60 dark:bg-white/40 backdrop-blur-sm" />
              <CardContent className="pt-6 text-center relative z-10">
                <LineChart className="h-8 w-8 mx-auto mb-2 text-rose-600" />
                <p className="text-3xl font-bold text-slate-900">95%</p>
                <p className="text-sm font-semibold text-slate-700">Model Accuracy</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('/images/autism4.jpg')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="absolute inset-0 bg-white/60 dark:bg-white/40 backdrop-blur-sm" />
              <CardContent className="pt-6 text-center relative z-10">
                <Clock className="h-8 w-8 mx-auto mb-2 text-violet-600" />
                <p className="text-3xl font-bold text-slate-900">5 min</p>
                <p className="text-sm font-semibold text-slate-700">Average Time</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('/images/autism4.jpg')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="absolute inset-0 bg-white/60 dark:bg-white/40 backdrop-blur-sm" />
              <CardContent className="pt-6 text-center relative z-10">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                <p className="text-3xl font-bold text-slate-900">AQ-10</p>
                <p className="text-sm font-semibold text-slate-700">Validated Test</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('/images/autism4.jpg')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="absolute inset-0 bg-white/60 dark:bg-white/40 backdrop-blur-sm" />
              <CardContent className="pt-6 text-center relative z-10">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-3xl font-bold text-slate-900">Free</p>
                <p className="text-sm font-semibold text-slate-700">For Everyone</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Screening Section */}
        <div id="screening" ref={screeningRef} className="scroll-mt-24">
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
                <Link href="/dashboard" className="hover:text-primary transition-colors!no-underline ">
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
