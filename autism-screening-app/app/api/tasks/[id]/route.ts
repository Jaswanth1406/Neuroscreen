import { getPool } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

const pool = getPool()

// PATCH - Update task (toggle complete, edit)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { completed, title, description, category } = body

    // Build dynamic update query
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (typeof completed === "boolean") {
      updates.push(`completed = $${paramCount}`)
      values.push(completed)
      paramCount++
      
      if (completed) {
        updates.push(`completed_at = NOW()`)
      } else {
        updates.push(`completed_at = NULL`)
      }
    }

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`)
      values.push(title)
      paramCount++
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`)
      values.push(description)
      paramCount++
    }

    if (category !== undefined) {
      updates.push(`category = $${paramCount}`)
      values.push(category)
      paramCount++
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 })
    }

    values.push(id)
    values.push(session.user.id)

    const result = await pool.query(
      `UPDATE therapy_tasks 
       SET ${updates.join(", ")} 
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

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
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

// DELETE - Delete a task
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const result = await pool.query(
      `DELETE FROM therapy_tasks WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, session.user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
