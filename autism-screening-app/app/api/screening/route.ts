import { NextResponse } from 'next/server';

// AQ-10 Questions for reference
const AQ10_QUESTIONS = {
  'A1_Score': 'I often notice small sounds when others do not',
  'A2_Score': 'I usually concentrate more on the whole picture, rather than small details',
  'A3_Score': 'I find it easy to do more than one thing at once',
  'A4_Score': 'If there is an interruption, I can switch back to what I was doing very quickly',
  'A5_Score': 'I find it easy to read between the lines when someone is talking to me',
  'A6_Score': 'I know how to tell if someone listening to me is getting bored',
  'A7_Score': 'When reading a story, I find it difficult to work out the characters intentions',
  'A8_Score': 'I like to collect information about categories of things',
  'A9_Score': 'I find it easy to work out what someone is thinking or feeling',
  'A10_Score': 'I find it difficult to work out peoples intentions'
};

export async function GET() {
  return NextResponse.json({
    questions: Object.entries(AQ10_QUESTIONS).map(([id, text]) => ({
      id,
      text
    }))
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Try to call the ML backend
    const mlApiUrl = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${mlApiUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      if (response.ok) {
        const result = await response.json();
        return NextResponse.json(result);
      }
    } catch (error) {
      console.log('ML backend not available, using fallback');
    }
    
    // Fallback: Calculate result locally
    const aq10Scores = [
      body.A1_Score, body.A2_Score, body.A3_Score, body.A4_Score, body.A5_Score,
      body.A6_Score, body.A7_Score, body.A8_Score, body.A9_Score, body.A10_Score
    ];
    
    const aq10Total = aq10Scores.reduce((sum: number, score: number) => sum + score, 0);
    const socialScores = [body.A5_Score, body.A6_Score, body.A7_Score, body.A9_Score, body.A10_Score];
    const attentionScores = [body.A1_Score, body.A2_Score, body.A3_Score, body.A4_Score, body.A8_Score];
    
    const socialScore = socialScores.reduce((sum: number, score: number) => sum + score, 0);
    const attentionScore = attentionScores.reduce((sum: number, score: number) => sum + score, 0);
    
    // Simple probability calculation
    const probability = aq10Total / 10;
    const prediction = probability >= 0.6 ? 1 : 0;
    const riskLevel = probability >= 0.6 ? 'High' : probability >= 0.4 ? 'Medium' : 'Low';
    
    // Get contributing factors
    const contributingFactors = Object.entries(body)
      .filter(([key, value]) => key.startsWith('A') && key.endsWith('_Score') && value === 1)
      .slice(0, 5)
      .map(([key]) => ({
        feature: key,
        question: AQ10_QUESTIONS[key as keyof typeof AQ10_QUESTIONS] || key,
        value: 1,
        importance: 0.1
      }));
    
    // Generate recommendations
    let recommendations: string[] = [];
    if (riskLevel === 'High') {
      recommendations = [
        'Consider scheduling a comprehensive evaluation with a developmental specialist or psychologist',
        'Discuss findings with primary healthcare provider for referral guidance',
        'Document specific behavioral observations to share with evaluating clinician',
        'Review available early intervention programs in your area'
      ];
    } else if (riskLevel === 'Medium') {
      recommendations = [
        'Monitor for additional behavioral indicators over the coming months',
        'Discuss observations with primary healthcare provider',
        'Consider re-screening in 3-6 months if concerns persist',
        'Explore developmental resources and support groups'
      ];
    } else {
      recommendations = [
        'Continue routine developmental monitoring',
        'Re-screen if new concerns arise',
        'Maintain open communication with healthcare providers about development'
      ];
    }
    
    return NextResponse.json({
      prediction,
      probability,
      risk_level: riskLevel,
      aq10_total: aq10Total,
      social_score: socialScore,
      attention_score: attentionScore,
      contributing_factors: contributingFactors,
      recommendations
    });
    
  } catch (error) {
    console.error('Error in screening API:', error);
    return NextResponse.json(
      { error: 'Failed to process screening' },
      { status: 500 }
    );
  }
}
