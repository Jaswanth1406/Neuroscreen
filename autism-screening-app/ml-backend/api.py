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
from pathlib import Path
import re

# Load environment variables - check multiple locations
script_dir = Path(__file__).resolve().parent
env_path = script_dir / '.env'
env_local_path = script_dir.parent / '.env.local'
root_env_path = script_dir.parent.parent / '.env'

if env_local_path.exists():
    print(f"Loading env from: {env_local_path}")
    load_dotenv(env_local_path)
elif env_path.exists():
    print(f"Loading env from: {env_path}")
    load_dotenv(env_path)
elif root_env_path.exists():
    print(f"Loading env from: {root_env_path}")
    load_dotenv(root_env_path)
else:
    print("No .env file found, using system environment")
    load_dotenv()  # Try default locations

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
    
    Use the following CLINICAL KNOWLEDGE BASE to guide your analysis:
    \"\"\"
    {knowledge_base_content}
    \"\"\"

    Analyze the video for TWO distinct modalities based on the knowledge base:
    1. **Physical Behavior**: Facial expressions, eye contact (or lack thereof), hand flapping, rocking, body language.
    2. **Speech & Audio**: Tone fairness, prosody (monotone vs expressive), speech rate, response latency, echolalia.
    
    Provide EXACTLY four outputs:
    1. **Physical Score**: Risk score 1-100 based on VISUALS (1=typical, 100=high autism traits).
    2. **Physical Reason**: Concise explanation of the visual signs, referencing terms from the Knowledge Base (e.g. "visual stimming", "ocular behaviors").
    3. **Speech Score**: Risk score 1-100 based on AUDIO (1=typical, 100=high autism traits).
    4. **Speech Reason**: Concise explanation of the auditory signs, referencing terms from the Knowledge Base (e.g. "monotone prosody", "echolalia").
    
    Format your response exactly like this:
    Physical Score: [Number]
    Physical Reason: [Text]
    Speech Score: [Number]
    Speech Reason: [Text]
    
    If the video is unclear or no person/audio is present, return 0 for scores and "Unable to analyze" for reasons.
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
                print(f"Gemini Raw Response: {analysis_text}") # Debug log

                # Robust parsing with Regex
                data = {
                    "physical_score": 0,
                    "physical_reason": "Analysis failed to extract physical reason.",
                    "speech_score": 0,
                    "speech_reason": "Analysis failed to extract speech reason."
                }
                
                # Regex patterns (case insensitive)
                # Matches: "Physical Score: 50" or "**Physical Score**: 50" or "1. Physical Score: 50"
                p_score = re.search(r"physical\s+score\**\s*:\s*(\d+)", analysis_text, re.IGNORECASE)
                s_score = re.search(r"speech\s+score\**\s*:\s*(\d+)", analysis_text, re.IGNORECASE)
                
                if p_score:
                    data["physical_score"] = int(p_score.group(1))
                
                if s_score:
                    data["speech_score"] = int(s_score.group(1))
                    
                # Extract reasons (capture everything after "Reason:" until next line or end)
                p_reason = re.search(r"physical\s+reason\**\s*:\s*(.+?)(?=\n|speech|$)", analysis_text, re.IGNORECASE | re.DOTALL)
                s_reason = re.search(r"speech\s+reason\**\s*:\s*(.+?)(?=$)", analysis_text, re.IGNORECASE | re.DOTALL)
                
                if p_reason:
                    data["physical_reason"] = p_reason.group(1).strip()
                if s_reason:
                    data["speech_reason"] = s_reason.group(1).strip()

                return data

            except (KeyError, IndexError, TypeError) as e:
                print(f"Parsing Error: {str(e)}")
                print(f"Unexpected response structure: {result}")
                # Return default zero structure instead of partial_error to avoid frontend "No data"
                return {
                    "physical_score": 0,
                    "physical_reason": f"Error parsing AI response: {str(e)}",
                    "speech_score": 0,
                    "speech_reason": "Error parsing AI response."
                }
                
    except Exception as e:
        print(f"Video analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
