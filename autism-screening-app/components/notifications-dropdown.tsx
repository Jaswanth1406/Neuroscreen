"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, Clock, AlertTriangle, CheckCircle2, X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Notification {
  id: string
  type: "overdue" | "reminder"
  title: string
  message: string
  taskId: string
  taskTitle: string
  category: string
  createdAt: string
  daysOld?: number
  priority: "high" | "medium" | "low"
}

interface NotificationSummary {
  total: number
  overdue: number
  reminders: number
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [summary, setSummary] = useState<NotificationSummary>({ total: 0, overdue: 0, reminders: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [dismissedIds, setDismissedIds] = useState<string[]>([])

  // Load dismissed notifications from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem("dismissedNotifications")
    if (dismissed) {
      try {
        setDismissedIds(JSON.parse(dismissed))
      } catch {
        setDismissedIds([])
      }
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        // Filter out dismissed notifications
        const activeNotifications = data.notifications.filter(
          (n: Notification) => !dismissedIds.includes(n.id)
        )
        setNotifications(activeNotifications)
        setSummary({
          ...data.summary,
          total: activeNotifications.length
        })
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }, [dismissedIds])

  useEffect(() => {
    fetchNotifications()
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const dismissNotification = (id: string) => {
    const newDismissed = [...dismissedIds, id]
    setDismissedIds(newDismissed)
    localStorage.setItem("dismissedNotifications", JSON.stringify(newDismissed))
    setNotifications(prev => prev.filter(n => n.id !== id))
    setSummary(prev => ({ ...prev, total: prev.total - 1 }))
  }

  const clearAllNotifications = () => {
    const allIds = notifications.map(n => n.id)
    const newDismissed = [...dismissedIds, ...allIds]
    setDismissedIds(newDismissed)
    localStorage.setItem("dismissedNotifications", JSON.stringify(newDismissed))
    setNotifications([])
    setSummary({ total: 0, overdue: 0, reminders: 0 })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500 bg-red-50 dark:bg-red-900/20"
      case "medium": return "text-amber-500 bg-amber-50 dark:bg-amber-900/20"
      default: return "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Social Skills": "bg-blue-500",
      "Communication": "bg-green-500",
      "Sensory": "bg-purple-500",
      "Daily Living": "bg-orange-500",
      "Emotional": "bg-pink-500",
      "Therapy": "bg-cyan-500",
      "Other": "bg-gray-500",
    }
    return colors[category] || "bg-gray-500"
  }

  const activeCount = notifications.length

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className={cn("h-5 w-5", activeCount > 0 && "text-amber-500")} />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
              {activeCount > 9 ? "9+" : activeCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground">
              {summary.overdue > 0 && `${summary.overdue} overdue task${summary.overdue > 1 ? 's' : ''}`}
              {summary.overdue > 0 && summary.reminders > 0 && " • "}
              {summary.reminders > 0 && `${summary.reminders} reminder${summary.reminders > 1 ? 's' : ''}`}
              {summary.total === 0 && "You're all caught up!"}
            </p>
          </div>
          {activeCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7"
              onClick={clearAllNotifications}
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-80">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm text-muted-foreground">No pending task alerts</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 transition-colors",
                    getPriorityColor(notification.priority)
                  )}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {notification.type === "overdue" ? (
                        <AlertTriangle className={cn(
                          "h-5 w-5",
                          notification.priority === "high" ? "text-red-500" : "text-amber-500"
                        )} />
                      ) : (
                        <Clock className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{notification.title}</span>
                        <Badge 
                          variant="secondary" 
                          className={cn("h-5 text-[10px] text-white", getCategoryColor(notification.category))}
                        >
                          {notification.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Link 
                          href="/dashboard/progress" 
                          onClick={() => setIsOpen(false)}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          View task <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => dismissNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t bg-muted/30">
          <Link href="/dashboard/progress" onClick={() => setIsOpen(false)}>
            <Button variant="outline" size="sm" className="w-full text-xs">
              View all tasks
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
