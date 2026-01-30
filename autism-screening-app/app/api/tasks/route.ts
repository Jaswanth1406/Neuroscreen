import { getPool } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

const pool = getPool()

// Initialize tasks table
async function initTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS therapy_tasks (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'Therapy',
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      completed_at TIMESTAMP
    )
  `)
}

// GET - Fetch user's tasks
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user?.id) {
      return NextResponse.json({ tasks: [] }, { status: 200 })
    }

    await initTable()

    const result = await pool.query(
      `SELECT * FROM therapy_tasks WHERE user_id = $1 ORDER BY created_at DESC`,
      [session.user.id]
    )

    // Map database fields to frontend expected format
    const tasks = result.rows.map(row => ({
      id: row.id.toString(),
      title: row.title,
      description: row.description || "",
      category: row.category,
      completed: row.completed,
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      completedAt: row.completed_at?.toISOString() || undefined,
    }))

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ tasks: [], error: "Failed to fetch tasks" }, { status: 500 })
  }
}

// POST - Create a new task
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, category } = await req.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    await initTable()

    const result = await pool.query(
      `INSERT INTO therapy_tasks (user_id, title, description, category) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [session.user.id, title, description || "", category || "Therapy"]
    )

    const row = result.rows[0]
    const task = {
      id: row.id.toString(),
      title: row.title,
      description: row.description || "",
      category: row.category,
      completed: row.completed,
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
      completedAt: row.completed_at?.toISOString() || undefined,
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
