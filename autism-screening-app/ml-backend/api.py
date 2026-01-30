"""
FastAPI Backend for ASD Screening Application
Provides REST API endpoints for ML predictions and LLM integration
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import os
import json
import base64
import httpx
from fastapi import FastAPI, HTTPException, UploadFile, File
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from train import load_model, predict, engineer_features, AQ10_QUESTIONS

app = FastAPI(
    title="ASD Screening API",
    description="AI-powered Autism Spectrum Disorder Screening Support Tool",
    version="1.0.0"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model on startup
MODEL_DIR = "models"
model_artifacts = None


@app.on_event("startup")
async def startup_event():
    global model_artifacts
    if os.path.exists(MODEL_DIR):
        try:
            model_artifacts = load_model(MODEL_DIR)
            print("Model loaded successfully")
        except Exception as e:
            print(f"Warning: Could not load model: {e}")
            print("Run train.py first to create the model")
    else:
        print("Warning: Model directory not found. Run train.py first.")


class ScreeningInput(BaseModel):
    """Input schema for ASD screening questionnaire"""
    A1_Score: int = Field(..., ge=0, le=1, description="I often notice small sounds when others do not")
    A2_Score: int = Field(..., ge=0, le=1, description="I usually concentrate more on the whole picture")
    A3_Score: int = Field(..., ge=0, le=1, description="I find it easy to do more than one thing at once")
    A4_Score: int = Field(..., ge=0, le=1, description="If there is an interruption, I can switch back quickly")
    A5_Score: int = Field(..., ge=0, le=1, description="I find it easy to read between the lines")
    A6_Score: int = Field(..., ge=0, le=1, description="I know how to tell if someone is getting bored")
    A7_Score: int = Field(..., ge=0, le=1, description="I find it difficult to work out characters intentions")
    A8_Score: int = Field(..., ge=0, le=1, description="I like to collect information about categories")
    A9_Score: int = Field(..., ge=0, le=1, description="I find it easy to work out what someone is thinking")
    A10_Score: int = Field(..., ge=0, le=1, description="I find it difficult to work out peoples intentions")
    age: float = Field(..., gt=0, le=100, description="Age in years")
    gender: str = Field(..., description="Gender (m/f)")
    ethnicity: str = Field(default="?", description="Ethnicity")
    jaundice: str = Field(..., description="Born with jaundice (yes/no)")
    austim: str = Field(..., description="Family member with ASD (yes/no)")
    used_app_before: str = Field(default="no", description="Used screening app before (yes/no)")
    result: float = Field(default=0, description="Previous screening result if any")


class ScreeningResult(BaseModel):
    """Output schema for screening result"""
    prediction: int
    probability: float
    risk_level: str
    aq10_total: int
    social_score: int
    attention_score: int
    contributing_factors: List[dict]
    evidence_summary: Optional[str] = None
    recommendations: Optional[List[str]] = None


class EvidenceSummaryRequest(BaseModel):
    """Request for generating evidence summary"""
    screening_result: ScreeningResult
    include_recommendations: bool = True


@app.get("/")
async def root():
    return {
        "message": "ASD Screening API",
        "status": "running",
        "model_loaded": model_artifacts is not None
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model_artifacts is not None
    }


@app.get("/questions")
async def get_questions():
    """Get the AQ-10 questionnaire questions"""
    return {
        "questions": [
            {"id": key, "text": value} 
            for key, value in AQ10_QUESTIONS.items()
        ]
    }


@app.post("/predict", response_model=ScreeningResult)
async def make_prediction(input_data: ScreeningInput):
    """Make an ASD screening prediction"""
    
    if model_artifacts is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Please run train.py first.")
    
    try:
        # Convert to dict
        input_dict = input_data.model_dump()
        
        # Make prediction
        result = predict(model_artifacts, input_dict)
        
        # Generate basic recommendations based on risk level
        recommendations = generate_recommendations(result)
        
        return ScreeningResult(
            prediction=result['prediction'],
            probability=result['probability'],
            risk_level=result['risk_level'],
            aq10_total=result['aq10_total'],
            social_score=result['social_score'],
            attention_score=result['attention_score'],
            contributing_factors=result['contributing_factors'],
            recommendations=recommendations
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-summary")
async def generate_evidence_summary(request: EvidenceSummaryRequest):
    """Generate an evidence summary for the screening result (for LLM integration)"""
    
    result = request.screening_result
    
    # Build the prompt context for LLM
    prompt_context = {
        "risk_level": result.risk_level,
        "probability": f"{result.probability:.1%}",
        "aq10_total": f"{result.aq10_total}/10",
        "social_score": f"{result.social_score}/5",
        "attention_score": f"{result.attention_score}/5",
        "contributing_factors": [
            {
                "factor": cf['feature'],
                "description": cf['question'],
                "value": cf['value']
            }
            for cf in result.contributing_factors[:3]
        ]
    }
    
    # Generate a template summary (to be enhanced by frontend LLM)
    summary = f"""
**Screening Analysis Summary**

Risk Assessment: {result.risk_level} ({result.probability:.1%} probability)

**AQ-10 Scores:**
- Total Score: {result.aq10_total}/10
- Social Communication: {result.social_score}/5
- Attention to Detail: {result.attention_score}/5

**Key Observations:**
"""
    
    for cf in result.contributing_factors[:3]:
        summary += f"\n- {cf['question']}: {'Present' if cf['value'] == 1 else 'Absent'}"
    
    if request.include_recommendations:
        summary += "\n\n**Recommendations:**\n"
        for rec in result.recommendations or []:
            summary += f"\n- {rec}"
    
    summary += "\n\n⚠️ **Disclaimer:** This is a screening support tool only and is not a diagnostic instrument. Please consult with a qualified healthcare professional for proper evaluation."
    
    return {
        "summary": summary,
        "prompt_context": prompt_context
    }


def generate_recommendations(result: dict) -> List[str]:
    """Generate recommendations based on screening result"""
    
    recommendations = []
    
    if result['risk_level'] == "High":
        recommendations.extend([
            "Consider scheduling a comprehensive evaluation with a developmental specialist or psychologist",
            "Discuss findings with primary healthcare provider for referral guidance",
            "Document specific behavioral observations to share with evaluating clinician",
            "Review available early intervention programs in your area"
        ])
    elif result['risk_level'] == "Medium":
        recommendations.extend([
            "Monitor for additional behavioral indicators over the coming months",
            "Discuss observations with primary healthcare provider",
            "Consider re-screening in 3-6 months if concerns persist",
            "Explore developmental resources and support groups"
        ])
    else:
        recommendations.extend([
            "Continue routine developmental monitoring",
            "Re-screen if new concerns arise",
            "Maintain open communication with healthcare providers about development"
        ])
    
    # Add specific recommendations based on scores
    if result['social_score'] >= 4:
        recommendations.append("Focus on social communication skill-building activities")
    
    if result['attention_score'] >= 4:
        recommendations.append("Consider structured activities that leverage attention to detail strengths")
    
    return recommendations


@app.post("/batch-predict")
async def batch_prediction(inputs: List[ScreeningInput]):
    """Make predictions for multiple samples (for test set evaluation)"""
    
    if model_artifacts is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    results = []
    for input_data in inputs:
        try:
            input_dict = input_data.model_dump()
            result = predict(model_artifacts, input_dict)
            results.append({
                "prediction": result['prediction'],
                "probability": result['probability']
            })
        except Exception as e:
            results.append({
                "error": str(e)
            })
    
    return {"results": results}


@app.post("/analyze-video")
async def analyze_video(file: UploadFile = File(...)):
    """
    Analyze a video file for signs of autism using Gemini 1.5 Flash via AI Pipe.
    """
    api_key = os.getenv("AIPIPE_API_KEY")
    if not api_key:
         raise HTTPException(status_code=500, detail="AIPIPE_API_KEY not configured in environment")

    # Limit file size (optional safety check, e.g. 25MB)
    # content_length = request.headers.get('content-length')
    
    try:
        # Read file content
        content = await file.read()
        
        # Encode to base64
        video_b64 = base64.b64encode(content).decode("utf-8")
        
        # Determine mime type
        mime_type = file.content_type or "video/mp4"
        
        # Get model from env or default to gemini-1.5-flash
        model_name = os.getenv("AI_MODEL", "gemini-1.5-flash")

        # Prepare request to AI Pipe (serving Gemini)
        url = f"https://aipipe.org/geminiv1beta/models/{model_name}:generateContent"
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
        prompt = """
        You are an expert clinical autism specialist. 
        Analyze the behavior, facial expressions, eye contact, and body language of the person in this video.
        
        Provide ONLY the following two outputs:
        1. **Score**: A risk score from 1-100 (1 = low risk, 100 = high indications).
        2. **Reason**: A concise explanation of why this score was assigned based on specific visual evidence.
        
        Format your response exactly like this:
        Score: [Number]
        Reason: [Text]
        
        If the video is unclear or no person is visible, return:
        Score: 0
        Reason: Unable to analyze video.
        """

        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": video_b64
                        }
                    }
                ]
            }]
        }

        async with httpx.AsyncClient() as client:
            # Video processing might take a bit of time
            response = await client.post(url, headers=headers, json=payload, timeout=120.0)
            
            if response.status_code != 200:
                print(f"AI Pipe Error: {response.text}")
                raise HTTPException(status_code=response.status_code, detail=f"AI Provider Error: {response.text}")
                
            result = response.json()
            
            # Extract text from Gemini response structure
            try:
                analysis_text = result["candidates"][0]["content"]["parts"][0]["text"]
                
                # Simple parsing to extract Score and Reason
                score = 0
                reason = "Unable to parse analysis."
                
                lines = analysis_text.strip().split('\n')
                for line in lines:
                    if line.lower().startswith("score:"):
                        try:
                            score_text = line.split(":", 1)[1].strip()
                            # Handle cases like "1 (Low Risk)" by taking just the number
                            score = int(''.join(filter(str.isdigit, score_text.split()[0]))) 
                        except ValueError:
                            pass
                    elif line.lower().startswith("reason:"):
                        reason = line.split(":", 1)[1].strip()
                
                # If reason spans multiple lines (simple fallback)
                if reason == "Unable to parse analysis." and len(lines) > 1:
                     reason = analysis_text.replace("Score:", "").strip()

                return {
                    "score": score,
                    "reason": reason
                }
            except (KeyError, IndexError, TypeError):
                print(f"Unexpected response structure: {result}")
                return {
                    "status": "partial_error",
                    "analysis": "Analysis completed but response format was unexpected.",
                    "raw": result
                }
                
    except Exception as e:
        print(f"Video analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
