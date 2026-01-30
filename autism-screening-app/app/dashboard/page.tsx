"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useSession } from "@/lib/auth-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  TrendingUp,
  ListTodo,
  MessageSquareHeart,
  ClipboardCheck,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react"

interface TherapyTask {
  id: string
  title: string
  description: string
  category: string
  completed: boolean
  createdAt: string
}

interface ScreeningResult {
  risk_level: string
  probability: number
  createdAt: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<TherapyTask[]>([])
  const [lastScreening, setLastScreening] = useState<ScreeningResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      // Fetch tasks and history in parallel
      const [tasksRes, historyRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/screening-history"),
      ])

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setTasks(tasksData.tasks)
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json()
        if (historyData.history && historyData.history.length > 0) {
          setLastScreening(historyData.history[0]) // Most recent screening
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const completedTasks = tasks.filter((t) => t.completed).length
  const totalTasks = tasks.length
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const recentTasks = tasks.slice(0, 3)

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

      <div className="space-y-8 relative z-10 py-6">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white shadow-2xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-amber-300" />
              <span className="text-sm font-medium text-white/80">Welcome to your dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Hello, {session?.user?.name?.split(" ")[0] || "there"}! 👋
            </h1>
            <p className="text-white/80 max-w-xl">
              Track your screening progress, complete therapy tasks, and chat with our AI clinical support assistant for personalized guidance.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/dashboard/screening" className="!no-underline ">
                <Button variant="secondary" className="gap-2 shadow-lg">
                  <ClipboardCheck className="h-4 w-4" />
                  Start Screening
                </Button>
              </Link>
              <Link href="/dashboard/clinical-support" className="!no-underline ">
                <Button variant="outline" className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <MessageSquareHeart className="h-4 w-4" />
                  Get Support
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <Card className="border border-white/40 shadow-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tasks
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <ListTodo className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Therapy tasks assigned
              </p>
            </CardContent>
          </Card>

          <Card className="border border-white/40 shadow-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedTasks}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Tasks finished
              </p>
            </CardContent>
          </Card>

          <Card className="border border-white/40 shadow-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Progress
              </CardTitle>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(progressPercent)}%</div>
              <Progress value={progressPercent} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="border border-white/40 shadow-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Last Screening
              </CardTitle>
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {lastScreening ? (
                  <Badge
                    variant={lastScreening.risk_level === "High" ? "destructive" :
                      lastScreening.risk_level === "Moderate" ? "secondary" : "default"}
                  >
                    {lastScreening.risk_level} Risk
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">None yet</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {lastScreening
                  ? `Score: ${Math.round(lastScreening.probability * 100)}%`
                  : "Complete a screening"
                }
              </p>
            </CardContent>
          </Card>
        </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Tasks */}
          <Card className="border border-white/40 shadow-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-primary" />
                  Recent Tasks
                </CardTitle>
                <CardDescription>
                  Your latest therapy assignments
                </CardDescription>
              </div>
              <Link href="/dashboard/progress" className="!no-underline ">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentTasks.length > 0 ? (
                <div className="space-y-4">
                  {recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-gray-800/50"
                    >
                      <div
                        className={`p-2 rounded-lg ${task.completed ? "bg-green-100 dark:bg-green-900/50" : "bg-blue-100 dark:bg-blue-900/50"}`}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {task.description}
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {task.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ListTodo className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No tasks yet</p>
                  <p className="text-sm text-muted-foreground">
                    Chat with Clinical Support to get personalized tasks
                  </p>
                  <Link href="/dashboard/clinical-support" className="!no-underline ">
                    <Button className="mt-4 gap-2" size="sm">
                      <MessageSquareHeart className="h-4 w-4" />
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border border-white/40 shadow-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Get started with these helpful resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/clinical-support" className="block !no-underline ">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
                    <MessageSquareHeart className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      Clinical Support AI
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Get personalized therapy recommendations and support
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>

              <Link href="/dashboard/progress" className="block !no-underline ">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                    <ListTodo className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      Progress Tracker
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      View and manage your therapy tasks
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>

              <Link href="/dashboard/screening" className="block !no-underline ">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg">
                    <ClipboardCheck className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      New Screening
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Take the AQ-10 autism screening assessment
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                    Pro Tip
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Regular therapy task completion can help track progress over time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}