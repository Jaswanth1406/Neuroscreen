"use client"

import { cn } from "@/lib/utils"

interface RiskIndicatorProps {
  level: "Low" | "Medium" | "High"
  probability: number
  className?: string
}

export function RiskIndicator({ level, probability, className }: RiskIndicatorProps) {
  const levels = [
    { name: "Low", range: "0-30%", color: "bg-green-500" },
    { name: "Medium", range: "30-60%", color: "bg-amber-500" },
    { name: "High", range: "60-100%", color: "bg-red-500" }
  ]

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Risk Assessment</span>
        <span className={cn(
          "text-sm font-bold px-3 py-1 rounded-full",
          level === "Low" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
          level === "Medium" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
          level === "High" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        )}>
          {level} Risk
        </span>
      </div>
      
      <div className="relative h-4 bg-gradient-to-r from-green-500 via-amber-500 to-red-500 rounded-full">
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-foreground rounded-full shadow-lg transition-all duration-500"
          style={{ left: `calc(${probability * 100}% - 8px)` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        {levels.map((l) => (
          <span key={l.name} className={cn(
            "transition-colors",
            level === l.name && "font-bold text-foreground"
          )}>
            {l.name}
          </span>
        ))}
      </div>
    </div>
  )
}
