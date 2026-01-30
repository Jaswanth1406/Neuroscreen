import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { getPool } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Initialize Groq client
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const pool = getPool();

export async function POST(req: Request) {
  const { messages, screeningResult } = await req.json();

  // Fetch user's screening history and tasks from database
  let userScreeningHistory: any[] = [];
  let userTasks: any[] = [];
  
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (session?.user?.id) {
      // Fetch screening history
      const historyResult = await pool.query(
        `SELECT * FROM screening_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
        [session.user.id]
      );
      userScreeningHistory = historyResult.rows;

      // Fetch tasks
      const tasksResult = await pool.query(
        `SELECT * FROM therapy_tasks WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
        [session.user.id]
      );
      userTasks = tasksResult.rows;
    }
  } catch (error) {
    console.error("Failed to fetch user data:", error);
  }

  // Build context from screening result
  let systemContext = `You are a compassionate and knowledgeable AI assistant specializing in autism spectrum disorder (ASD) screening support. Your role is to:

1. Explain screening results in clear, non-clinical language
2. Provide accurate information about ASD
3. Offer emotional support and reassurance
4. Suggest appropriate next steps and resources
5. Always emphasize that this is a screening tool, NOT a diagnosis

Important guidelines:
- Never diagnose or suggest a diagnosis
- Always recommend consulting healthcare professionals
- Be empathetic and supportive
- Use inclusive and respectful language
- Provide practical, actionable advice
- Format responses with markdown for readability
- When suggesting tasks, format them clearly so users can add them to their tracker`;

  // Add user's screening history from database
  if (userScreeningHistory.length > 0) {
    systemContext += `

=== USER'S SCREENING HISTORY (from database) ===
The user has completed ${userScreeningHistory.length} screening(s). Here are their results:

`;
    userScreeningHistory.forEach((screening, index) => {
      systemContext += `
**Screening ${index + 1}** (${new Date(screening.created_at).toLocaleDateString()}):
- Risk Level: ${screening.risk_level}
- Probability Score: ${(screening.probability * 100).toFixed(1)}%
- AQ-10 Total Score: ${screening.aq10_total}/10
- Social Communication Score: ${screening.social_score}/5
- Attention & Detail Score: ${screening.attention_score}/5
- Contributing Factors: ${JSON.stringify(screening.contributing_factors || [])}
`;
    });
  }

  // Add user's current tasks
  if (userTasks.length > 0) {
    const completedTasks = userTasks.filter(t => t.completed).length;
    const pendingTasks = userTasks.filter(t => !t.completed);
    
    systemContext += `

=== USER'S CURRENT THERAPY TASKS ===
Total tasks: ${userTasks.length} (${completedTasks} completed, ${pendingTasks.length} pending)

Pending tasks:
${pendingTasks.map(t => `- ${t.title} (${t.category})`).join('\n') || 'None'}

Completed tasks:
${userTasks.filter(t => t.completed).map(t => `- ${t.title} (${t.category})`).join('\n') || 'None'}
`;
  }

  // Also include current session screening result if provided
  if (screeningResult) {
    systemContext += `

=== CURRENT SESSION SCREENING RESULT ===
The user just completed a new screening with:
- Risk Level: ${screeningResult.risk_level}
- Confidence Score: ${(screeningResult.probability * 100).toFixed(1)}%
- AQ-10 Total Score: ${screeningResult.aq10_total}/10
- Social Communication Score: ${screeningResult.social_score}/5
- Attention & Detail Score: ${screeningResult.attention_score}/5

Key contributing factors:
${screeningResult.contributing_factors?.map((f: any) => `- ${f.question}: ${f.value === 1 ? 'Present' : 'Absent'}`).join('\n') || 'No specific factors identified'}

Recommendations provided:
${screeningResult.recommendations?.join('\n') || 'Standard follow-up recommended'}`;
  }

  if (userScreeningHistory.length === 0 && !screeningResult) {
    systemContext += `

No screening has been completed yet. Encourage the user to complete the AQ-10 screening questionnaire for personalized insights.`;
  }

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: systemContext,
    messages,
  });

  return result.toTextStreamResponse();
}
