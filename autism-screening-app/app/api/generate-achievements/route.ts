import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';

// Allow up to 30 seconds for generation
export const maxDuration = 30;

// Initialize Groq client
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { stats, unlockedAchievements = [] } = await req.json();

    const result = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: `Generate 3 NEW unique achievements for a therapy game app designed to help individuals with autism spectrum disorder.

Current user stats:
- Emotion Recognition Score: ${stats.emotionScore || 0}
- Best Emotion Streak: ${stats.emotionBest || 0}
- Breathing Sessions Completed: ${stats.breathingSessions || 0}
- Breathing Minutes: ${stats.breathingMinutes || 0}
- Social Scenarios Correct: ${stats.socialCorrect || 0}
- Social Scenarios Total: ${stats.socialTotal || 0}
- Total Points: ${stats.totalPoints || 0}

Already unlocked achievements: ${unlockedAchievements.join(', ') || 'None'}

Create achievements that:
1. Are slightly harder than what the user has already achieved
2. Encourage continued progress
3. Have fun, encouraging names
4. Are specific and measurable
5. Cover different game types (emotion, breathing, social)

Each achievement needs:
- id: unique snake_case identifier (e.g., "emotion_master_25")
- name: catchy achievement name (2-4 words)
- description: what the user needs to do (short phrase)
- icon: one of these exact values: "Smile", "Flame", "Wind", "Users", "Star", "Trophy", "Heart", "Brain", "Target", "Sparkles"
- requirement: object with { type: "emotion_score" | "emotion_streak" | "breathing_sessions" | "breathing_minutes" | "social_correct" | "social_rate" | "total_points", value: number }

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "achievements": [
    {
      "id": "unique_id",
      "name": "Achievement Name",
      "description": "What to do",
      "icon": "Smile",
      "requirement": { "type": "emotion_score", "value": 20 }
    }
  ]
}`,
    });

    // Parse the JSON from the response
    const text = result.text.trim();
    
    // Handle cases where the model wraps JSON in markdown code blocks
    let jsonStr = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    const parsed = JSON.parse(jsonStr);

    if (parsed.achievements && Array.isArray(parsed.achievements)) {
      return Response.json({ 
        success: true, 
        achievements: parsed.achievements 
      });
    } else {
      throw new Error("Invalid response structure");
    }
  } catch (error) {
    console.error("Error generating achievements:", error);
    return Response.json(
      { 
        success: false, 
        error: "Failed to generate achievements",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
