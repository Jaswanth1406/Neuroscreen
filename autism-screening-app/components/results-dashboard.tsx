"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Users,
  Eye,
  TrendingUp,
  Lightbulb,
  Video,
  ClipboardList
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ScreeningResult } from "@/app/page"
import { PDFExport } from "@/components/pdf-export"
import { ShareResults } from "@/components/share-results"

interface ResultsDashboardProps {
  result: ScreeningResult
  userName?: string
}

export function ResultsDashboard({ result, userName }: ResultsDashboardProps) {
  const riskConfig = {
    Low: {
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-800",
      icon: CheckCircle2,
      description: "The screening indicates a lower likelihood of ASD traits"
    },
    Medium: {
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      borderColor: "border-amber-200 dark:border-amber-800",
      icon: AlertTriangle,
      description: "The screening indicates some ASD traits may be present"
    },
    High: {
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200 dark:border-red-800",
      icon: AlertCircle,
      description: "The screening indicates elevated ASD traits that warrant further evaluation"
    }
  }

  const config = riskConfig[result.risk_level as keyof typeof riskConfig]
  const RiskIcon = config.icon

  return (
    <div className="space-y-6 max-w-5xl mx-auto" role="region" aria-label="Screening Results">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-end">
        <PDFExport result={result} userName={userName} />
        <ShareResults result={result} />
      </div>

      {/* Main Risk Assessment Card */}
      <Card className={cn("border-2", config.borderColor, config.bgColor)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-3 rounded-full", config.bgColor)} aria-hidden="true">
                <RiskIcon className={cn("h-8 w-8", config.color)} />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  Screening Risk Level: <span className={config.color}>{result.risk_level}</span>
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {config.description}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Confidence Score</span>
                <span className="text-sm font-bold" aria-label={`Confidence score: ${(result.probability * 100).toFixed(1)} percent`}>
                  {(result.probability * 100).toFixed(1)}%
                </span>
              </div>
              <Progress
                value={result.probability * 100}
                className="h-3"
                aria-label="Confidence score progress"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi-modal Analysis Breakdown */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* 1. Textual Analysis Score (AQ-10) */}
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Textual Analysis</CardTitle>
            </div>
            <CardDescription>AQ-10 Questionnaire</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-500 mb-2">
              {result.aq10_total}
              <span className="text-lg text-muted-foreground font-normal">/10</span>
            </div>
            <Progress value={(result.aq10_total / 10) * 100} className="h-2 mb-4" />
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Social Traits</span>
                <span>{result.social_score}/5</span>
              </div>
              <div className="flex justify-between">
                <span>Attention Traits</span>
                <span>{result.attention_score}/5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Physical Gesture Score */}
        <Card className={cn(
          "border-t-4",
          !result.video_analysis?.physical_score ? "border-t-slate-200 dark:border-t-slate-800 opacity-60" : "border-t-purple-500"
        )}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-lg">Physical Gestures</CardTitle>
            </div>
            <CardDescription>Video Visual Analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {result.video_analysis?.physical_score !== undefined ? (
              <>
                <div className="text-4xl font-bold text-purple-500 mb-2">
                  {result.video_analysis.physical_score}
                  <span className="text-lg text-muted-foreground font-normal">/100</span>
                </div>
                <Progress value={result.video_analysis.physical_score} className="h-2 mb-4" />
                <div className="max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  <p className="text-sm text-muted-foreground">
                    {result.video_analysis.physical_reason || "Visual analysis detected specific behavioral patterns."}
                  </p>
                </div>
              </>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                <p>No video data analyzed</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. Speech Score */}
        <Card className={cn(
          "border-t-4",
          !result.video_analysis?.speech_score ? "border-t-slate-200 dark:border-t-slate-800 opacity-60" : "border-t-pink-500"
        )}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-pink-500" />
              <CardTitle className="text-lg">Speech Analysis</CardTitle>
            </div>
            <CardDescription>Audio & Prosody</CardDescription>
          </CardHeader>
          <CardContent>
            {result.video_analysis?.speech_score !== undefined ? (
              <>
                <div className="text-4xl font-bold text-pink-500 mb-2">
                  {result.video_analysis.speech_score}
                  <span className="text-lg text-muted-foreground font-normal">/100</span>
                </div>
                <Progress value={result.video_analysis.speech_score} className="h-2 mb-4" />
                <div className="max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  <p className="text-sm text-muted-foreground">
                    {result.video_analysis.speech_reason || "Audio analysis detected specific speech patterns."}
                  </p>
                </div>
              </>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                <p>No speech data analyzed</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legacy Video Analysis Block (Fallback) */}
      {result.video_analysis?.score !== undefined && result.video_analysis?.physical_score === undefined && (
        <Card className="border-2 border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-950">
                <Video className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Legacy Video Analysis</CardTitle>
                <CardDescription>
                  Combined behavioral analysis
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">{result.video_analysis.score}/100</div>
              <div className="flex-1 text-sm text-muted-foreground">{result.video_analysis.reason}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contributing Factors */}
      {result.contributing_factors && result.contributing_factors.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Key Contributing Factors</CardTitle>
            </div>
            <CardDescription>
              Areas that most influenced the screening result
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.contributing_factors.map((factor, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    factor.value === 1 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{factor.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        factor.value === 1
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {factor.value === 1 ? "Present" : "Absent"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Importance: {factor.importance.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <CardTitle>Recommendations</CardTitle>
            </div>
            <CardDescription>
              Suggested next steps based on the screening results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-semibold mb-2">Important Disclaimer</p>
              <p>
                This screening tool is designed to identify individuals who may benefit from a comprehensive
                diagnostic evaluation. It is NOT a diagnostic instrument. A positive result on this screener
                does not mean that the individual has Autism Spectrum Disorder (ASD). Only a qualified healthcare
                professional can provide a formal diagnosis after comprehensive evaluation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
