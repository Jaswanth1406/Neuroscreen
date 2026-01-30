"use client"

import { AnalyticsSkeleton } from "@/components/ui/skeleton"

export default function AnalyticsLoading() {
  return (
    <div role="status" aria-label="Loading analytics">
      <span className="sr-only">Loading analytics data...</span>
      <AnalyticsSkeleton />
    </div>
  )
}
