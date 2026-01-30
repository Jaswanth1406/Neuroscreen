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
  Video
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ScreeningResult } from "@/app/page"

interface ResultsDashboardProps {
  result: ScreeningResult
}

export function ResultsDashboard({ result }: ResultsDashboardProps) {
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Main Risk Assessment Card */}
      <Card className={cn("border-2", config.borderColor, config.bgColor)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-3 rounded-full", config.bgColor)}>
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
                <span className="text-sm font-bold">{(result.probability * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={result.probability * 100} 
                className="h-3"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* AQ-10 Total */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">AQ-10 Total</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {result.aq10_total}
              <span className="text-lg text-muted-foreground font-normal">/10</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Autism Quotient Score
            </p>
            <Progress value={(result.aq10_total / 10) * 100} className="mt-3 h-2" />
          </CardContent>
        </Card>

        {/* Social Score */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Social Communication</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-500">
              {result.social_score}
              <span className="text-lg text-muted-foreground font-normal">/5</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Social interaction indicators
            </p>
            <Progress value={(result.social_score / 5) * 100} className="mt-3 h-2" />
          </CardContent>
        </Card>

        {/* Attention Score */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-lg">Attention & Detail</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-500">
              {result.attention_score}
              <span className="text-lg text-muted-foreground font-normal">/5</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Attention to detail indicators
            </p>
            <Progress value={(result.attention_score / 5) * 100} className="mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Video Analysis Results */}
      {result.video_analysis && (
        <Card className="border-2 border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-950">
                <Video className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Video Behavior Analysis</CardTitle>
                <CardDescription>
                  AI-powered analysis of behavioral indicators from video submission
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                <div className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4",
                  result.video_analysis.score >= 70 
                    ? "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400"
                    : result.video_analysis.score >= 40 
                      ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400"
                      : "bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700 text-green-600 dark:text-green-400"
                )}>
                  {result.video_analysis.score}
                </div>
                <p className="text-center text-xs text-muted-foreground mt-1">out of 100</p>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Behavioral Indicator Score</span>
                  <span className={cn(
                    "font-semibold",
                    result.video_analysis.score >= 70 
                      ? "text-red-600 dark:text-red-400"
                      : result.video_analysis.score >= 40 
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-green-600 dark:text-green-400"
                  )}>
                    {result.video_analysis.score >= 70 ? "High" : result.video_analysis.score >= 40 ? "Moderate" : "Low"}
                  </span>
                </div>
                <Progress 
                  value={result.video_analysis.score} 
                  className={cn(
                    "h-3",
                    result.video_analysis.score >= 70 
                      ? "[&>div]:bg-red-500"
                      : result.video_analysis.score >= 40 
                        ? "[&>div]:bg-amber-500"
                        : "[&>div]:bg-green-500"
                  )}
                />
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4 text-indigo-500" />
                AI Analysis Summary
              </h4>
              <div className="p-4 rounded-lg bg-muted/50 text-sm leading-relaxed">
                {result.video_analysis.reason}
              </div>
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
