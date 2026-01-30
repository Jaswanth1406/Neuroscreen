"use client"

import { DashboardSkeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div role="status" aria-label="Loading dashboard content">
      <span className="sr-only">Loading dashboard...</span>
      <DashboardSkeleton />
    </div>
  )
}
