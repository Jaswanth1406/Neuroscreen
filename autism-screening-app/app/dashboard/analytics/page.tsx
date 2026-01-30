"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Users,
  Eye,
  Calendar,
  Target,
  Award,
  BarChart3,
  Activity,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { AnalyticsSkeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ScreeningData {
  id: string
  probability: number
  risk_level: string
  aq10_total: number
  social_score: number
  attention_score: number
  createdAt: string
}

interface TaskData {
  id: string
  category: string
  completed: boolean
  createdAt: string
  completedAt?: string
}

const CHART_COLORS = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  social: "#06b6d4",
  attention: "#a855f7",
}

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444"]

export default function AnalyticsPage() {
  const [screenings, setScreenings] = useState<ScreeningData[]>([])
  const [tasks, setTasks] = useState<TaskData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("all")

  const fetchData = useCallback(async () => {
    try {
      const [screeningsRes, tasksRes] = await Promise.all([
        fetch("/api/screening-history"),
        fetch("/api/tasks"),
      ])

      if (screeningsRes.ok) {
        const data = await screeningsRes.json()
        setScreenings(data.history || [])
      }

      if (tasksRes.ok) {
        const data = await tasksRes.json()
        setTasks(data.tasks || [])
      }
    } catch (error) {
      console.error("Failed to fetch analytics data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter data by time range
  const filterByTimeRange = (data: any[], dateField: string) => {
    if (timeRange === "all") return data
    
    const now = new Date()
    const ranges: Record<string, number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "1y": 365,
    }
    
    const days = ranges[timeRange] || 365
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    return data.filter(item => new Date(item[dateField]) >= cutoff)
  }

  const filteredScreenings = filterByTimeRange(screenings, "createdAt")
  const filteredTasks = filterByTimeRange(tasks, "createdAt")

  // Calculate statistics
  const stats = {
    totalScreenings: filteredScreenings.length,
    avgScore: filteredScreenings.length > 0 
      ? (filteredScreenings.reduce((sum, s) => sum + s.aq10_total, 0) / filteredScreenings.length).toFixed(1)
      : 0,
    latestRisk: filteredScreenings[0]?.risk_level || "N/A",
    completedTasks: filteredTasks.filter(t => t.completed).length,
    totalTasks: filteredTasks.length,
    completionRate: filteredTasks.length > 0 
      ? ((filteredTasks.filter(t => t.completed).length / filteredTasks.length) * 100).toFixed(0)
      : 0,
  }

  // Score trend calculation
  const getScoreTrend = () => {
    if (filteredScreenings.length < 2) return { direction: "neutral", change: 0 }
    const latest = filteredScreenings[0].aq10_total
    const previous = filteredScreenings[1].aq10_total
    const change = latest - previous
    return {
      direction: change > 0 ? "up" : change < 0 ? "down" : "neutral",
      change: Math.abs(change),
    }
  }
  const scoreTrend = getScoreTrend()

  // Prepare chart data
  const screeningChartData = [...filteredScreenings]
    .reverse()
    .map((s, index) => ({
      date: new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      aq10: s.aq10_total,
      social: s.social_score,
      attention: s.attention_score,
      confidence: (s.probability * 100).toFixed(0),
      index: index + 1,
    }))

  // Risk distribution
  const riskDistribution = [
    { name: "Low", value: filteredScreenings.filter(s => s.risk_level === "Low").length },
    { name: "Medium", value: filteredScreenings.filter(s => s.risk_level === "Medium").length },
    { name: "High", value: filteredScreenings.filter(s => s.risk_level === "High").length },
  ].filter(r => r.value > 0)

  // Task completion by category
  const tasksByCategory = filteredTasks.reduce((acc, task) => {
    const category = task.category || "Other"
    if (!acc[category]) {
      acc[category] = { total: 0, completed: 0 }
    }
    acc[category].total++
    if (task.completed) acc[category].completed++
    return acc
  }, {} as Record<string, { total: number; completed: number }>)

  const categoryChartData = (Object.entries(tasksByCategory) as [string, { total: number; completed: number }][]).map(([name, data]) => ({
    name: name.length > 12 ? name.substring(0, 12) + "..." : name,
    fullName: name,
    total: data.total,
    completed: data.completed,
    rate: data.total > 0 ? ((data.completed / data.total) * 100).toFixed(0) : 0,
  }))

  // Radar chart data for latest screening
  const radarData = filteredScreenings.length > 0 ? [
    { subject: "Social", A: (filteredScreenings[0].social_score / 5) * 100, fullMark: 100 },
    { subject: "Attention", A: (filteredScreenings[0].attention_score / 5) * 100, fullMark: 100 },
    { subject: "AQ-10", A: (filteredScreenings[0].aq10_total / 10) * 100, fullMark: 100 },
    { subject: "Confidence", A: filteredScreenings[0].probability * 100, fullMark: 100 },
  ] : []

  // Weekly task completion heatmap data
  const getWeeklyCompletionData = () => {
    const weeks: Record<string, { completed: number; total: number }> = {}
    
    filteredTasks.forEach(task => {
      const date = new Date(task.createdAt)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toISOString().split('T')[0]
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { completed: 0, total: 0 }
      }
      weeks[weekKey].total++
      if (task.completed) weeks[weekKey].completed++
    })

    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 weeks
      .map(([week, data]) => ({
        week: new Date(week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        completed: data.completed,
        pending: data.total - data.completed,
        rate: data.total > 0 ? ((data.completed / data.total) * 100).toFixed(0) : 0,
      }))
  }
  const weeklyData = getWeeklyCompletionData()

  if (isLoading) {
    return <AnalyticsSkeleton />
  }

  return (
    <div className="space-y-8" role="main" aria-label="Analytics Dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analytics & Progress
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your screening history and therapy progress over time
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px]" aria-label="Select time range">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-white/40 shadow-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Screenings
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <Brain className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalScreenings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Assessments completed
            </p>
          </CardContent>
        </Card>

        <Card className="border border-white/40 shadow-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average AQ-10 Score
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
              <Target className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stats.avgScore}</span>
              <span className="text-muted-foreground">/10</span>
              {scoreTrend.direction !== "neutral" && (
                <span className={cn(
                  "flex items-center text-sm",
                  scoreTrend.direction === "down" ? "text-green-500" : "text-red-500"
                )}>
                  {scoreTrend.direction === "up" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {scoreTrend.change}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {scoreTrend.direction === "down" ? "Improving" : scoreTrend.direction === "up" ? "Needs attention" : "Stable"}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-white/40 shadow-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasks Completed
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completedTasks}/{stats.totalTasks}</div>
            <div className="mt-2">
              <Progress value={Number(stats.completionRate)} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="border border-white/40 shadow-xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Latest Risk Level
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
              <Activity className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <Badge 
              variant="outline"
              className={cn(
                "text-lg px-3 py-1",
                stats.latestRisk === "Low" && "bg-green-100 text-green-700 border-green-300",
                stats.latestRisk === "Medium" && "bg-amber-100 text-amber-700 border-amber-300",
                stats.latestRisk === "High" && "bg-red-100 text-red-700 border-red-300"
              )}
            >
              {stats.latestRisk}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Most recent assessment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="scores" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="scores" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Scores
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="overview" className="gap-2">
            <Target className="h-4 w-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        {/* Scores Tab */}
        <TabsContent value="scores" className="space-y-6">
          {/* Score Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                AQ-10 Score Trend
              </CardTitle>
              <CardDescription>
                Track how your screening scores change over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {screeningChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={screeningChartData}>
                    <defs>
                      <linearGradient id="colorAq10" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis domain={[0, 10]} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="aq10" 
                      stroke={CHART_COLORS.primary} 
                      fillOpacity={1} 
                      fill="url(#colorAq10)"
                      name="AQ-10 Score"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No screening data available yet. Complete a screening to see your trends.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social vs Attention Chart */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-500" />
                  Social vs Attention Scores
                </CardTitle>
                <CardDescription>
                  Compare your social and attention scores over assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {screeningChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={screeningChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis domain={[0, 5]} className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="social" 
                        stroke={CHART_COLORS.social} 
                        strokeWidth={2}
                        name="Social"
                        dot={{ fill: CHART_COLORS.social }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="attention" 
                        stroke={CHART_COLORS.attention} 
                        strokeWidth={2}
                        name="Attention"
                        dot={{ fill: CHART_COLORS.attention }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-amber-500" />
                  Risk Level Distribution
                </CardTitle>
                <CardDescription>
                  Distribution of risk levels across all screenings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {riskDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          {/* Task Completion by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Task Completion by Category
              </CardTitle>
              <CardDescription>
                See how you're progressing in different therapy areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value, name) => [value, name === 'completed' ? 'Completed' : 'Total']}
                    />
                    <Legend />
                    <Bar dataKey="total" fill={CHART_COLORS.secondary} name="Total" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="completed" fill={CHART_COLORS.success} name="Completed" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No tasks available. Create tasks in Clinical Support to track progress.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Completion Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" />
                Weekly Task Completion
              </CardTitle>
              <CardDescription>
                Your task completion patterns over the past weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="completed" stackId="a" fill={CHART_COLORS.success} name="Completed" />
                    <Bar dataKey="pending" stackId="a" fill={CHART_COLORS.warning} name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No weekly data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Latest Assessment Profile
                </CardTitle>
                <CardDescription>
                  Visual breakdown of your most recent screening
                </CardDescription>
              </CardHeader>
              <CardContent>
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" className="text-xs" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="Score"
                        dataKey="A"
                        stroke={CHART_COLORS.primary}
                        fill={CHART_COLORS.primary}
                        fillOpacity={0.3}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Complete a screening to see your profile
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Progress Summary
                </CardTitle>
                <CardDescription>
                  Your overall journey and achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                        <Brain className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Screenings Completed</p>
                        <p className="text-sm text-muted-foreground">Total assessments taken</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold">{stats.totalScreenings}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Tasks Completed</p>
                        <p className="text-sm text-muted-foreground">Therapy activities finished</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold">{stats.completedTasks}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                        <Target className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Completion Rate</p>
                        <p className="text-sm text-muted-foreground">Task success percentage</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold">{stats.completionRate}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium">Days Active</p>
                        <p className="text-sm text-muted-foreground">Since first screening</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold">
                      {filteredScreenings.length > 0 
                        ? Math.ceil((new Date().getTime() - new Date(filteredScreenings[filteredScreenings.length - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24))
                        : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
