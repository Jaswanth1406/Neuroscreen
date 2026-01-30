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
    const { difficulty = "medium", ageGroup = "child" } = await req.json();

    const difficultyPrompts = {
      easy: "simple everyday situations like greetings and basic manners",
      medium: "common social interactions at school, home, or with friends",
      hard: "more complex situations involving emotions, conflicts, or group dynamics",
    };

    const agePrompts = {
      child: "appropriate for children ages 5-12",
      teen: "appropriate for teenagers ages 13-18",
      adult: "appropriate for adults in work or social settings",
    };

    const result = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: `Generate 5 unique social scenarios for a therapy game designed to help individuals with autism spectrum disorder practice social skills.

Requirements:
- Difficulty level: ${difficultyPrompts[difficulty as keyof typeof difficultyPrompts] || difficultyPrompts.medium}
- Age appropriateness: ${agePrompts[ageGroup as keyof typeof agePrompts] || agePrompts.child}
- Each scenario should have exactly 4 response options
- Only ONE option should be marked as correct (the most socially appropriate response)
- The other 3 options should be incorrect but realistic alternatives
- Feedback should be educational and encouraging

Focus on scenarios that teach:
- Recognizing and responding to others' emotions
- Appropriate greetings and farewells  
- Turn-taking and sharing
- Asking for help or permission
- Handling disagreements politely

IMPORTANT: Respond ONLY with valid JSON in this exact format, no other text:
{
  "scenarios": [
    {
      "situation": "Description of the social situation",
      "options": [
        { "text": "First option", "correct": false, "feedback": "Why this isn't ideal" },
        { "text": "Second option", "correct": true, "feedback": "Why this is good" },
        { "text": "Third option", "correct": false, "feedback": "Why this isn't ideal" },
        { "text": "Fourth option", "correct": false, "feedback": "Why this isn't ideal" }
      ]
    }
  ]
}`,
    });

    // Parse the JSON from the response
    const text = result.text.trim();
    
    // Try to extract JSON from the response
    let jsonStr = text;
    
    // Handle cases where the model wraps JSON in markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    const parsed = JSON.parse(jsonStr);

    if (parsed.scenarios && Array.isArray(parsed.scenarios)) {
      return Response.json({ 
        success: true, 
        scenarios: parsed.scenarios 
      });
    } else {
      throw new Error("Invalid response structure");
    }
  } catch (error) {
    console.error("Error generating scenarios:", error);
    return Response.json(
      { 
        success: false, 
        error: "Failed to generate scenarios",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
