"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface FeatureBarChartProps {
  factors: Array<{
    feature: string
    question: string
    value: number
    importance: number
  }>
}

export function FeatureBarChart({ factors }: FeatureBarChartProps) {
  const maxImportance = useMemo(() => {
    return Math.max(...factors.map(f => f.importance), 0.1)
  }, [factors])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Feature Importance</CardTitle>
        <CardDescription>
          Factors that contributed most to the screening result
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {factors.map((factor, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium truncate max-w-[70%]" title={factor.question}>
                  {factor.feature.replace('_Score', '')}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  factor.value === 1 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {factor.value === 1 ? 'Present' : 'Absent'}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(factor.importance / maxImportance) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {factor.question}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
