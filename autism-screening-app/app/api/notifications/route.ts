import { getPool } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

const pool = getPool()

// GET - Fetch notifications for pending tasks
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user?.id) {
      return NextResponse.json({ notifications: [] }, { status: 200 })
    }

    // Get incomplete tasks created more than 24 hours ago
    const result = await pool.query(
      `SELECT * FROM therapy_tasks 
       WHERE user_id = $1 
       AND completed = FALSE 
       AND created_at < NOW() - INTERVAL '24 hours'
       ORDER BY created_at ASC`,
      [session.user.id]
    )

    // Get tasks due today (created within last 24 hours but not completed)
    const recentResult = await pool.query(
      `SELECT * FROM therapy_tasks 
       WHERE user_id = $1 
       AND completed = FALSE 
       AND created_at >= NOW() - INTERVAL '24 hours'
       ORDER BY created_at DESC`,
      [session.user.id]
    )

    const notifications = []

    // Overdue tasks (older than 24 hours)
    for (const row of result.rows) {
      const createdAt = new Date(row.created_at)
      const now = new Date()
      const daysOld = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
      
      notifications.push({
        id: `task-overdue-${row.id}`,
        type: "overdue",
        title: "Task Overdue",
        message: `"${row.title}" has been pending for ${daysOld} day${daysOld > 1 ? 's' : ''}`,
        taskId: row.id.toString(),
        taskTitle: row.title,
        category: row.category,
        createdAt: row.created_at,
        daysOld,
        priority: daysOld > 3 ? "high" : daysOld > 1 ? "medium" : "low"
      })
    }

    // Today's pending tasks (reminder)
    for (const row of recentResult.rows) {
      notifications.push({
        id: `task-reminder-${row.id}`,
        type: "reminder",
        title: "Task Reminder",
        message: `Don't forget: "${row.title}"`,
        taskId: row.id.toString(),
        taskTitle: row.title,
        category: row.category,
        createdAt: row.created_at,
        priority: "low"
      })
    }

    // Sort by priority (high first) then by date
    notifications.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder]
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder]
      if (aPriority !== bPriority) return aPriority - bPriority
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

    return NextResponse.json({ 
      notifications,
      summary: {
        total: notifications.length,
        overdue: result.rows.length,
        reminders: recentResult.rows.length
      }
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ notifications: [], error: "Failed to fetch notifications" }, { status: 500 })
  }
}
