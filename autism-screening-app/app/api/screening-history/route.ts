import { getPool } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

const pool = getPool()

// Initialize screening history table
async function initTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS screening_history (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      prediction INTEGER,
      probability FLOAT,
      risk_level TEXT,
      confidence TEXT,
      aq10_total INTEGER,
      social_score INTEGER,
      attention_score INTEGER,
      contributing_factors JSONB,
      answers JSONB,
      formatted_answers JSONB,
      physical_score INTEGER,
      physical_reason TEXT,
      speech_score INTEGER,
      speech_reason TEXT,
      demographics JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)

  // Add columns if they don't exist (migration for existing tables)
  try {
    await pool.query(`ALTER TABLE screening_history ADD COLUMN IF NOT EXISTS answers JSONB;`)
    await pool.query(`ALTER TABLE screening_history ADD COLUMN IF NOT EXISTS demographics JSONB;`)
    await pool.query(`ALTER TABLE screening_history ADD COLUMN IF NOT EXISTS formatted_answers JSONB;`)
    await pool.query(`ALTER TABLE screening_history ADD COLUMN IF NOT EXISTS physical_score INTEGER;`)
    await pool.query(`ALTER TABLE screening_history ADD COLUMN IF NOT EXISTS physical_reason TEXT;`)
    await pool.query(`ALTER TABLE screening_history ADD COLUMN IF NOT EXISTS speech_score INTEGER;`)
    await pool.query(`ALTER TABLE screening_history ADD COLUMN IF NOT EXISTS speech_reason TEXT;`)
  } catch (e) {
    // Ignore error if columns exist
    console.log("Migration check complete")
  }
}

// GET - Fetch user's screening history
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user?.id) {
      return NextResponse.json({ history: [] }, { status: 200 })
    }

    await initTable()

    const result = await pool.query(
      `SELECT * FROM screening_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [session.user.id]
    )

    // Map database fields to frontend expected format
    const history = result.rows.map(row => ({
      id: row.id.toString(),
      prediction: row.prediction,
      probability: row.probability,
      risk_level: row.risk_level,
      confidence: row.confidence,
      aq10_total: row.aq10_total,
      social_score: row.social_score,
      attention_score: row.attention_score,
      contributing_factors: row.contributing_factors || [],
      answers: row.answers || {},
      formatted_answers: row.formatted_answers || [],
      physical_score: row.physical_score,
      physical_reason: row.physical_reason,
      speech_score: row.speech_score,
      speech_reason: row.speech_reason,
      demographics: row.demographics || {},
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
    }))

    return NextResponse.json({ history })
  } catch (error) {
    console.error("Error fetching screening history:", error)
    return NextResponse.json({ history: [], error: "Failed to fetch history" }, { status: 500 })
  }
}

// POST - Save a new screening result
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    await initTable()

    const result = await pool.query(
      `INSERT INTO screening_history (
        user_id, prediction, probability, risk_level, confidence,
        aq10_total, social_score, attention_score, contributing_factors,
        answers, demographics, formatted_answers,
        physical_score, physical_reason, speech_score, speech_reason
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
      RETURNING *`,
      [
        session.user.id,
        data.prediction,
        data.probability,
        data.risk_level,
        data.confidence,
        data.aq10_total,
        data.social_score,
        data.attention_score,
        JSON.stringify(data.contributing_factors || []),
        JSON.stringify(data.answers || {}),
        JSON.stringify(data.demographics || {}),
        JSON.stringify(data.formatted_answers || []),
        data.physical_score || null,
        data.physical_reason || null,
        data.speech_score || null,
        data.speech_reason || null
      ]
    )

    const row = result.rows[0]
    const screening = {
      id: row.id.toString(),
      prediction: row.prediction,
      probability: row.probability,
      risk_level: row.risk_level,
      confidence: row.confidence,
      aq10_total: row.aq10_total,
      social_score: row.social_score,
      attention_score: row.attention_score,
      contributing_factors: row.contributing_factors || [],
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
    }

    return NextResponse.json({ screening })
  } catch (error) {
    console.error("Error saving screening:", error)
    return NextResponse.json({ error: "Failed to save screening" }, { status: 500 })
  }
}
