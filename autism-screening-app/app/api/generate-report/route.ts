import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { getPool } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

// Allow up to 60 seconds for generation
export const maxDuration = 60;

// Initialize Groq client
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const pool = getPool()

interface ScreeningResult {
  id: string
  prediction: number
  probability: number
  risk_level: string
  confidence: string
  aq10_total: number
  social_score: number
  attention_score: number
  contributing_factors: { feature: string; importance: number; direction: string }[]
  formatted_answers?: { question: string; answer: string }[]
  physical_score?: number
  physical_reason?: string
  speech_score?: number
  speech_reason?: string
  demographics?: { age?: number; gender?: string }
  createdAt: string
}

interface TherapyTask {
  id: string
  title: string
  category: string
  completed: boolean
  createdAt: string
  completedAt?: string
}

interface TherapyGameStats {
  emotionScore: number
  emotionBest: number
  breathingMinutes: number
  breathingSessions: number
  socialCorrect: number
  socialTotal: number
  totalPoints: number
  achievements: string[]
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { includeTherapyProgress = true, includeRecommendations = true } = await req.json()

    // Fetch screening history
    const screeningResult = await pool.query(
      `SELECT * FROM screening_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [session.user.id]
    )

    const screenings: ScreeningResult[] = screeningResult.rows.map(row => ({
      id: row.id.toString(),
      prediction: row.prediction,
      probability: row.probability,
      risk_level: row.risk_level,
      confidence: row.confidence,
      aq10_total: row.aq10_total,
      social_score: row.social_score,
      attention_score: row.attention_score,
      contributing_factors: row.contributing_factors || [],
      formatted_answers: row.formatted_answers || [],
      physical_score: row.physical_score,
      physical_reason: row.physical_reason,
      speech_score: row.speech_score,
      speech_reason: row.speech_reason,
      demographics: row.demographics || {},
      createdAt: row.created_at?.toISOString() || new Date().toISOString(),
    }))

    // Fetch tasks for therapy progress
    const tasksResult = await pool.query(
      `SELECT * FROM therapy_tasks WHERE user_id = $1 ORDER BY created_at DESC`,
      [session.user.id]
    )

    const tasks: TherapyTask[] = tasksResult.rows.map(row => ({
      id: row.id.toString(),
      title: row.title,
      category: row.category,
      completed: row.completed,
      createdAt: row.created_at?.toISOString(),
      completedAt: row.completed_at?.toISOString(),
    }))

    const latestScreening = screenings[0]

    if (!latestScreening) {
      return NextResponse.json({ 
        error: "No screening data found. Please complete a screening first." 
      }, { status: 400 })
    }

    // Generate AI-powered clinical insights
    const aiResult = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: `You are a clinical report assistant generating a professional summary for an autism screening application. This report is for informational purposes and to help guide conversations with healthcare providers.

PATIENT DATA:
- User: ${session.user.name || 'Anonymous'}
- Age: ${latestScreening.demographics?.age || 'Not specified'}
- Gender: ${latestScreening.demographics?.gender || 'Not specified'}

LATEST SCREENING RESULTS:
- Risk Level: ${latestScreening.risk_level}
- Probability Score: ${(latestScreening.probability * 100).toFixed(1)}%
- Confidence: ${latestScreening.confidence}
- AQ-10 Total: ${latestScreening.aq10_total || 'N/A'}
- Social Score: ${latestScreening.social_score || 'N/A'}
- Attention Score: ${latestScreening.attention_score || 'N/A'}
- Physical Assessment: ${latestScreening.physical_score || 'N/A'}/5 - ${latestScreening.physical_reason || 'Not assessed'}
- Speech Assessment: ${latestScreening.speech_score || 'N/A'}/5 - ${latestScreening.speech_reason || 'Not assessed'}

TOP CONTRIBUTING FACTORS:
${latestScreening.contributing_factors.slice(0, 5).map(f => `- ${f.feature}: ${f.importance.toFixed(1)}% (${f.direction})`).join('\n')}

SCREENING HISTORY:
${screenings.length} screenings completed. ${screenings.length > 1 ? `Previous risk levels: ${screenings.slice(1).map(s => s.risk_level).join(', ')}` : 'This is the first screening.'}

THERAPY PROGRESS:
- Total Tasks: ${tasks.length}
- Completed Tasks: ${tasks.filter(t => t.completed).length}
- Categories: ${[...new Set(tasks.map(t => t.category))].join(', ') || 'None'}

Generate a clinical summary report with the following sections:
1. EXECUTIVE SUMMARY (2-3 sentences overview)
2. SCREENING ANALYSIS (detailed analysis of the screening results and what they suggest)
3. KEY OBSERVATIONS (3-5 bullet points of notable patterns or areas of concern)
4. ${includeTherapyProgress ? 'THERAPY PROGRESS NOTES (assessment of engagement with therapy tasks)' : ''}
5. ${includeRecommendations ? 'RECOMMENDATIONS (3-5 specific, actionable next steps for the patient and/or caregivers)' : ''}
6. IMPORTANT DISCLAIMERS

Format the response as clean markdown. Be professional but compassionate. Remember this is a screening tool, not a diagnostic tool.`,
    });

    // Calculate therapy stats summary
    const completedTasks = tasks.filter(t => t.completed)
    const tasksByCategory = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const completedByCategory = completedTasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Build the report data
    const report = {
      generatedAt: new Date().toISOString(),
      userName: session.user.name || 'Anonymous User',
      userEmail: session.user.email,
      
      // Latest Screening Summary
      latestScreening: {
        date: latestScreening.createdAt,
        riskLevel: latestScreening.risk_level,
        probability: latestScreening.probability,
        confidence: latestScreening.confidence,
        aq10Total: latestScreening.aq10_total,
        socialScore: latestScreening.social_score,
        attentionScore: latestScreening.attention_score,
        physicalScore: latestScreening.physical_score,
        physicalReason: latestScreening.physical_reason,
        speechScore: latestScreening.speech_score,
        speechReason: latestScreening.speech_reason,
        contributingFactors: latestScreening.contributing_factors,
        demographics: latestScreening.demographics,
      },

      // Historical Data
      screeningHistory: screenings.map(s => ({
        date: s.createdAt,
        riskLevel: s.risk_level,
        probability: s.probability,
      })),

      // Therapy Progress
      therapyProgress: {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length * 100).toFixed(1) : 0,
        tasksByCategory,
        completedByCategory,
        recentCompletedTasks: completedTasks.slice(0, 5).map(t => ({
          title: t.title,
          category: t.category,
          completedAt: t.completedAt,
        })),
      },

      // AI-Generated Clinical Summary
      clinicalSummary: aiResult.text,
    }

    return NextResponse.json({ 
      success: true, 
      report 
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to generate report",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
