"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ClipboardList,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  Brain,
  ArrowRight,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ScreeningResult {
  id?: string
  prediction: number
  probability: number
  risk_level: string
  confidence: string
  aq10_total?: number
  social_score?: number
  attention_score?: number
  contributing_factors: {
    feature: string
    importance: number
    direction: string
  }[]
  timestamp?: string
  createdAt?: string
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ScreeningResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch("/api/screening-history")
      if (response.ok) {
        const data = await response.json()
        setHistory(data.history)
      }
    } catch (error) {
      console.error("Failed to fetch history:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "High":
        return "bg-red-500"
      case "Moderate":
        return "bg-amber-500"
      case "Low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case "High":
        return "destructive"
      case "Moderate":
        return "secondary"
      case "Low":
        return "default"
      default:
        return "outline"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            Screening History
          </h1>
          <p className="text-muted-foreground mt-1">
            View your past AQ-10 screening assessments
          </p>
        </div>
        <Link href="/">
          <Button className="gap-2">
            <Brain className="h-4 w-4" />
            New Screening
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-4">
          {history.map((result, index) => (
            <Card key={result.id || index} className="border-0 shadow-lg overflow-hidden">
              <div className={cn("h-2", getRiskColor(result.risk_level))} />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Assessment #{history.length - index}
                      <Badge variant={getRiskBadgeVariant(result.risk_level) as any}>
                        {result.risk_level} Risk
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {result.createdAt || result.timestamp
                        ? formatDate(result.createdAt || result.timestamp!)
                        : "Date not recorded"}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">
                      {Math.round(result.probability * 100)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Risk Score
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Risk Summary */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      {result.risk_level === "High" ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : result.risk_level === "Moderate" ? (
                        <Info className="h-4 w-4 text-amber-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      Risk Assessment
                    </h4>
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-gray-800/50">
                      <p className="text-sm">
                        {result.risk_level === "High" ? (
                          <>
                            This assessment indicates a <strong>high probability</strong> of
                            autism spectrum traits. Professional evaluation is
                            strongly recommended.
                          </>
                        ) : result.risk_level === "Moderate" ? (
                          <>
                            This assessment shows <strong>moderate</strong> indicators.
                            Consider consulting a healthcare provider for further
                            evaluation.
                          </>
                        ) : (
                          <>
                            This assessment shows <strong>low</strong> indicators for
                            autism spectrum traits. Continue monitoring and consult a
                            professional if concerns persist.
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Confidence: {result.confidence}
                      </p>
                    </div>
                  </div>

                  {/* Contributing Factors */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Top Contributing Factors
                    </h4>
                    <div className="space-y-2">
                      {result.contributing_factors.slice(0, 4).map((factor, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-gray-800/50"
                        >
                          <span className="text-sm">{factor.feature}</span>
                          <Badge variant="outline">
                            {factor.importance.toFixed(1)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Link href="/dashboard/clinical-support">
                    <Button variant="outline" size="sm" className="gap-2">
                      Get Support
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-lg">
          <CardContent className="text-center py-16">
            <ClipboardList className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No screening history</h3>
            <p className="text-muted-foreground mb-6">
              Complete your first AQ-10 screening assessment to see results here
            </p>
            <Link href="/">
              <Button className="gap-2">
                <Brain className="h-4 w-4" />
                Start Screening
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="border-0 shadow-lg bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className="flex items-start gap-4 pt-6">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800 dark:text-amber-200">
              Important Disclaimer
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              These screening results are for informational purposes only and do
              not constitute a medical diagnosis. The AQ-10 is a screening tool,
              not a diagnostic instrument. Please consult a qualified healthcare
              professional for proper evaluation and diagnosis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
