"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ScoreGaugeProps {
  value: number
  max: number
  label: string
  description?: string
  colorClass?: string
}

export function ScoreGauge({ value, max, label, description, colorClass = "text-primary" }: ScoreGaugeProps) {
  const percentage = (value / max) * 100
  const circumference = 2 * Math.PI * 45 // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className={colorClass}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: 'stroke-dashoffset 0.5s ease-in-out'
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-3xl font-bold", colorClass)}>{value}</span>
            <span className="text-sm text-muted-foreground">/ {max}</span>
          </div>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground text-center mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
