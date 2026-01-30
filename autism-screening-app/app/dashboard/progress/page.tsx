"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ListTodo,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Filter,
  Calendar,
  Clock,
  Trophy,
  Target,
  Sparkles,
  MessageSquareHeart,
  Search,
  MoreVertical,
  Edit,
  RotateCcw,
  Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface TherapyTask {
  id: string
  title: string
  description: string
  category: string
  completed: boolean
  createdAt: string
  completedAt?: string
}

const CATEGORIES = [
  { value: "Social Skills", color: "bg-blue-500" },
  { value: "Communication", color: "bg-green-500" },
  { value: "Sensory", color: "bg-purple-500" },
  { value: "Daily Living", color: "bg-orange-500" },
  { value: "Emotional", color: "bg-pink-500" },
  { value: "Therapy", color: "bg-cyan-500" },
  { value: "Other", color: "bg-gray-500" },
]

export default function ProgressTrackerPage() {
  const [tasks, setTasks] = useState<TherapyTask[]>([])
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "Therapy",
  })

  // Fetch tasks from database
  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch("/api/tasks")
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const addTask = async () => {
    if (!newTask.title.trim()) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      })
      
      if (response.ok) {
        const data = await response.json()
        setTasks([data.task, ...tasks])
        setNewTask({ title: "", description: "", category: "Therapy" })
        setIsAddDialogOpen(false)
      }
    } catch (error) {
      console.error("Failed to add task:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(tasks.map(t => t.id === id ? data.task : t))
      }
    } catch (error) {
      console.error("Failed to toggle task:", error)
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  const resetTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: false }),
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(tasks.map(t => t.id === id ? data.task : t))
      }
    } catch (error) {
      console.error("Failed to reset task:", error)
    }
  }

  const filteredTasks = tasks
    .filter((task) => {
      if (filter === "active") return !task.completed
      if (filter === "completed") return task.completed
      return true
    })
    .filter((task) => {
      if (categoryFilter !== "all") return task.category === categoryFilter
      return true
    })
    .filter((task) => {
      if (searchQuery) {
        return (
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      return true
    })
    .sort((a, b) => {
      // Sort by completion status (active first), then by creation date (newest first)
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const completedCount = tasks.filter((t) => t.completed).length
  const totalCount = tasks.length
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const getCategoryColor = (category: string) => {
    return CATEGORIES.find((c) => c.value === category)?.color || "bg-gray-500"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
              <ListTodo className="h-6 w-6 text-white" />
            </div>
            Progress Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and complete your therapy tasks
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/clinical-support">
            <Button variant="outline" className="gap-2">
              <MessageSquareHeart className="h-4 w-4" />
              Get AI Tasks
            </Button>
          </Link>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Create a custom therapy task to track your progress
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Practice deep breathing for 5 minutes"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add more details about this task..."
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className={cn("w-2 h-2 rounded-full", cat.color)}
                            />
                            {cat.value}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={addTask} disabled={!newTask.title.trim() || isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-gray-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/50">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCount}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-gray-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/50">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-gray-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/50">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(progressPercent)}%</p>
                <p className="text-sm text-muted-foreground">Progress</p>
              </div>
            </div>
            <Progress value={progressPercent} className="mt-4 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs
              value={filter}
              onValueChange={(v) => setFilter(v as typeof filter)}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", cat.color)} />
                      {cat.value}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
          <CardDescription>
            Click on a task to mark it as complete
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200",
                    task.completed
                      ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                      : "bg-slate-50 dark:bg-gray-800/50 border-border hover:border-primary/50 hover:shadow-md"
                  )}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-1 flex-shrink-0 transition-transform hover:scale-110"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p
                          className={cn(
                            "font-medium",
                            task.completed && "line-through text-muted-foreground"
                          )}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {task.completed && (
                            <DropdownMenuItem onClick={() => resetTask(task.id)}>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Mark as Active
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          task.completed && "opacity-60"
                        )}
                      >
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full mr-1",
                            getCategoryColor(task.category)
                          )}
                        />
                        {task.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(task.createdAt)}
                      </span>
                      {task.completedAt && (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Completed {formatDate(task.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ListTodo className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-6">
                {tasks.length === 0
                  ? "Get started by adding a task or chatting with Clinical Support AI"
                  : "Try adjusting your filters"}
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
                <Link href="/dashboard/clinical-support">
                  <Button variant="outline" className="gap-2">
                    <MessageSquareHeart className="h-4 w-4" />
                    Get AI Tasks
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
