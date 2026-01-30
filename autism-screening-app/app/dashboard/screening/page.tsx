"use client";

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScreeningForm } from "@/components/screening-form"
import { ResultsDashboard } from "@/components/results-dashboard"
import { useSession } from "@/lib/auth-client"
import { BarChart3, ClipboardList } from "lucide-react"

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
    answers?: Record<string, number>
    demographics?: {
        age: string
        gender: string
        ethnicity: string
        jaundice: string
        austim: string
        used_app_before: string
    }
    formatted_answers?: string[]
    fusion_details?: {
        aq10_contribution: string
        physical_contribution: string
        speech_contribution: string
        original_aq10_prob: number
        original_physical_score: number
        original_speech_score: number
    }
    video_analysis?: {
        score?: number // Legacy
        reason?: string // Legacy
        physical_score?: number
        physical_reason?: string
        speech_score?: number
        speech_reason?: string
    }
}

export default function ScreeningPage() {
    const [screeningResult, setScreeningResult] = useState<ScreeningResult | null>(null)
    const [showResults, setShowResults] = useState(false)
    const { data: session } = useSession()

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
                        answers: result.answers, // Send raw answers
                        demographics: result.demographics, // Send demographics
                        formatted_answers: result.formatted_answers, // Send descriptive answers
                        physical_score: result.video_analysis?.physical_score,
                        physical_reason: result.video_analysis?.physical_reason,
                        speech_score: result.video_analysis?.speech_score,
                        speech_reason: result.video_analysis?.speech_reason
                    }),
                })
            } catch (error) {
                console.error("Failed to save screening result:", error)
            }
        }

        setShowResults(true)
    }

    return (
        <div className="relative min-h-[calc(100vh-4rem)]">
            {/* Background Image with Reduced Blur */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: "url('/images/autism1.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: "fixed",
                }}
            >
                <div className="absolute inset-0 bg-white/30 dark:bg-gray-950/30" />
            </div>

            <div className="space-y-6 max-w-4xl mx-auto relative z-10 py-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2">Autism Screening Assessment</h1>
                    <p className="text-muted-foreground">
                        Complete the AQ-10 questionnaire to get an AI-powered risk assessment.
                    </p>
                </div>

                {showResults && screeningResult ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
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
                    <Card className="border border-white/40 shadow-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle>AQ-10 Questionnaire</CardTitle>
                            <CardDescription>
                                Please answer the following questions honestly based on your observations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScreeningForm onComplete={handleScreeningComplete} />
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
