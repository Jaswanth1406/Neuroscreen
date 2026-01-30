"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, Circle, ArrowRight, ArrowLeft, Loader2, Video, Upload, X, Play } from "lucide-react"
import { cn } from "@/lib/utils"

// AQ-10 Questions
const AQ10_QUESTIONS = [
  {
    id: "A1_Score",
    text: "I often notice small sounds when others do not",
    category: "attention"
  },
  {
    id: "A2_Score",
    text: "I usually concentrate more on the whole picture, rather than the small details",
    category: "attention",
    reversed: true
  },
  {
    id: "A3_Score",
    text: "I find it easy to do more than one thing at once",
    category: "attention",
    reversed: true
  },
  {
    id: "A4_Score",
    text: "If there is an interruption, I can switch back to what I was doing very quickly",
    category: "attention",
    reversed: true
  },
  {
    id: "A5_Score",
    text: "I find it easy to 'read between the lines' when someone is talking to me",
    category: "social",
    reversed: true
  },
  {
    id: "A6_Score",
    text: "I know how to tell if someone listening to me is getting bored",
    category: "social",
    reversed: true
  },
  {
    id: "A7_Score",
    text: "When I'm reading a story, I find it difficult to work out the characters' intentions",
    category: "social"
  },
  {
    id: "A8_Score",
    text: "I like to collect information about categories of things",
    category: "attention"
  },
  {
    id: "A9_Score",
    text: "I find it easy to work out what someone is thinking or feeling just by looking at their face",
    category: "social",
    reversed: true
  },
  {
    id: "A10_Score",
    text: "I find it difficult to work out people's intentions",
    category: "social"
  }
]

const ETHNICITY_OPTIONS = [
  "White-European",
  "Asian",
  "Middle Eastern",
  "South Asian",
  "Black",
  "Hispanic",
  "Pasifika",
  "Turkish",
  "Others",
  "Prefer not to say"
]

interface ScreeningFormProps {
  onComplete: (result: any) => void
}

export function ScreeningForm({ onComplete }: ScreeningFormProps) {
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [demographics, setDemographics] = useState({
    age: "",
    gender: "",
    ethnicity: "",
    jaundice: "",
    austim: "",
    used_app_before: "no"
  })

  const totalSteps = AQ10_QUESTIONS.length + 2 // Questions + Video + Demographics
  const progress = ((step + 1) / totalSteps) * 100

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
      const url = URL.createObjectURL(file)
      setVideoUrl(url)
    }
  }

  const handleRemoveVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl)
    }
    setVideoFile(null)
    setVideoUrl(null)
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
  }

  const handleQuestionAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    // Auto-advance to next question
    if (step < AQ10_QUESTIONS.length - 1) {
      setTimeout(() => setStep(step + 1), 300)
    } else {
      // Go to video step after last question
      setTimeout(() => setStep(AQ10_QUESTIONS.length), 300)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      // Calculate total score for result field
      const aq10Total = Object.values(answers).reduce((sum, val) => sum + val, 0)

      const requestBody = {
        ...answers,
        age: parseFloat(demographics.age),
        gender: demographics.gender,
        ethnicity: demographics.ethnicity === "Prefer not to say" ? "?" : demographics.ethnicity,
        jaundice: demographics.jaundice,
        austim: demographics.austim,
        used_app_before: demographics.used_app_before,
        result: aq10Total
      }

      // Make prediction request
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error("Prediction failed")
      }

      const result = await response.json()

      // If video was uploaded, analyze it with Gemini
      let videoAnalysisResult = null
      if (videoFile) {
        try {
          console.log("Uploading video for analysis...", videoFile.name)
          const formData = new FormData()
          formData.append("file", videoFile)

          const videoResponse = await fetch("http://localhost:8000/analyze-video", {
            method: "POST",
            body: formData,
          })

          if (videoResponse.ok) {
            videoAnalysisResult = await videoResponse.json()
            console.log("Video analysis result:", videoAnalysisResult)
          } else {
            console.error("Video analysis failed with status:", videoResponse.status)
          }
        } catch (videoError) {
          console.error("Video analysis failed:", videoError)
          // Continue without video analysis
        }
      }

      // Combine results with fusion logic
      let finalProbability = result.probability
      let finalRiskLevel = result.risk_level

      if (videoAnalysisResult?.physical_score !== undefined) {
        // Normalize video scores (0-100 -> 0-1)
        const physicalProb = (videoAnalysisResult.physical_score || 0) / 100
        const speechProb = (videoAnalysisResult.speech_score || 0) / 100

        // Weighted Fusion: 50% AQ-10, 25% Physical, 25% Speech
        finalProbability = (result.probability * 0.5)
          + (physicalProb * 0.25)
          + (speechProb * 0.25)

        // Recalculate risk level based on combined probability
        if (finalProbability >= 0.6) finalRiskLevel = "High"
        else if (finalProbability >= 0.4) finalRiskLevel = "Medium"
        else finalRiskLevel = "Low"
      } else if (videoAnalysisResult?.score) {
        // Fallback for legacy format
        const videoProb = videoAnalysisResult.score / 100
        finalProbability = (result.probability * 0.7) + (videoProb * 0.3)
      }

      onComplete({
        ...result,
        probability: finalProbability,
        risk_level: finalRiskLevel,
        answers: answers,
        demographics: demographics,
        video_analysis: videoAnalysisResult,
        fusion_details: videoAnalysisResult ? {
          aq10_contribution: (result.probability * 0.5).toFixed(2),
          physical_contribution: ((videoAnalysisResult.physical_score || 0) / 100 * 0.25).toFixed(2),
          speech_contribution: ((videoAnalysisResult.speech_score || 0) / 100 * 0.25).toFixed(2),
          original_aq10_prob: result.probability,
          original_physical_score: videoAnalysisResult.physical_score || 0,
          original_speech_score: videoAnalysisResult.speech_score || 0
        } : null
      })

    } catch (error) {
      console.error("Error:", error)

      // Try video analysis even if prediction failed
      let videoAnalysisResult = null
      if (videoFile) {
        try {
          const formData = new FormData()
          formData.append("file", videoFile)

          const videoResponse = await fetch("http://localhost:8000/analyze-video", {
            method: "POST",
            body: formData,
          })

          if (videoResponse.ok) {
            videoAnalysisResult = await videoResponse.json()
          }
        } catch (videoError) {
          console.error("Video analysis failed:", videoError)
        }
      }

      // Use mock result for demo if API fails
      const totalScore = (Object.values(answers) as number[]).reduce((s, v) => s + v, 0)

      // Generate descriptive answers for context
      const formattedAnswers = Object.entries(answers).map(([key, value]) => {
        const question = AQ10_QUESTIONS.find(q => q.id === key)
        if (!question) return ""
        if (value === 1) {
          // User agreed
          return question.text
        } else {
          // User disagreed - create negation
          return `User did not agree that: ${question.text}`
        }
      })

      const mockResult = {
        prediction: totalScore >= 6 ? 1 : 0,
        probability: totalScore / 10,
        risk_level: totalScore >= 6 ? "High" : totalScore >= 4 ? "Medium" : "Low",
        aq10_total: totalScore,
        social_score: [answers.A5_Score, answers.A6_Score, answers.A7_Score, answers.A9_Score, answers.A10_Score].reduce((s, v) => s + (v || 0), 0),
        attention_score: [answers.A1_Score, answers.A2_Score, answers.A3_Score, answers.A4_Score, answers.A8_Score].reduce((s, v) => s + (v || 0), 0),
        contributing_factors: Object.entries(answers)
          .filter(([_, v]) => v === 1)
          .slice(0, 5)
          .map(([k, v]) => ({
            feature: k,
            question: AQ10_QUESTIONS.find(q => q.id === k)?.text || k,
            value: v,
            importance: 0.1
          })),
        answers: answers,
        formatted_answers: formattedAnswers, // Pass new descriptive field
        demographics: demographics,
        recommendations: [
          "This is a demo mode result. Connect to the ML backend for accurate predictions.",
          "Please consult with a healthcare professional for proper evaluation."
        ],
        video_analysis: videoAnalysisResult
      }

      // Apply fusion to mock result if video exists
      // Simulate 4-part score for mock mode
      if (videoUrl) {
        mockResult.video_analysis = {
          physical_score: 65,
          physical_reason: "Mock: Avoids direct eye contact, frequent hand fidgeting.",
          speech_score: 40,
          speech_reason: "Mock: Speech is slightly monotonous but responsive."
        }

        const aq10Prob = totalScore / 10
        const physicalProb = 0.65
        const speechProb = 0.40

        const finalProb = (aq10Prob * 0.5) + (physicalProb * 0.25) + (speechProb * 0.25)
        mockResult.probability = finalProb
        mockResult.risk_level = finalProb >= 0.6 ? "High" : finalProb >= 0.4 ? "Medium" : "Low"

        // Add mock fusion details
        // @ts-ignore
        mockResult.fusion_details = {
          aq10_contribution: (aq10Prob * 0.5).toFixed(2),
          physical_contribution: (physicalProb * 0.25).toFixed(2),
          speech_contribution: (speechProb * 0.25).toFixed(2),
          original_aq10_prob: aq10Prob,
          original_physical_score: 65,
          original_speech_score: 40
        }
      }

      onComplete(mockResult)
    } finally {
      setIsLoading(false)
    }
  }

  const canProceedFromDemographics =
    demographics.age &&
    demographics.gender &&
    demographics.jaundice &&
    demographics.austim

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>{step + 1} of {totalSteps}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Steps */}
      {step < AQ10_QUESTIONS.length && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded">
              {AQ10_QUESTIONS[step].category === "social" ? "Social Communication" : "Attention & Detail"}
            </span>
            <span>Question {step + 1} of {AQ10_QUESTIONS.length}</span>
          </div>

          <Card className="border-2">
            <CardContent className="pt-6">
              <p className="text-lg font-medium mb-6">
                {AQ10_QUESTIONS[step].text}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={answers[AQ10_QUESTIONS[step].id] === 1 ? "default" : "outline"}
                  size="lg"
                  className={cn(
                    "h-16 text-base",
                    answers[AQ10_QUESTIONS[step].id] === 1 && "ring-2 ring-primary"
                  )}
                  onClick={() => handleQuestionAnswer(AQ10_QUESTIONS[step].id, 1)}
                >
                  {answers[AQ10_QUESTIONS[step].id] === 1 ? (
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                  ) : (
                    <Circle className="mr-2 h-5 w-5" />
                  )}
                  Agree
                </Button>
                <Button
                  variant={answers[AQ10_QUESTIONS[step].id] === 0 ? "default" : "outline"}
                  size="lg"
                  className={cn(
                    "h-16 text-base",
                    answers[AQ10_QUESTIONS[step].id] === 0 && "ring-2 ring-primary"
                  )}
                  onClick={() => handleQuestionAnswer(AQ10_QUESTIONS[step].id, 0)}
                >
                  {answers[AQ10_QUESTIONS[step].id] === 0 ? (
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                  ) : (
                    <Circle className="mr-2 h-5 w-5" />
                  )}
                  Disagree
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step Indicators */}
          <div className="flex justify-center gap-1">
            {AQ10_QUESTIONS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i === step ? "bg-primary" :
                    answers[AQ10_QUESTIONS[i].id] !== undefined ? "bg-primary/50" : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={() => setStep(Math.min(totalSteps - 1, step + 1))}
              disabled={answers[AQ10_QUESTIONS[step].id] === undefined}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Video Upload Step */}
      {step === AQ10_QUESTIONS.length && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Video Recording (Optional)</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Upload a short video for behavioral analysis. This helps improve screening accuracy.
            </p>

          </div>

          <Card className="border-2 border-dashed">
            <CardContent className="pt-6">
              {!videoUrl ? (
                <div
                  className="flex flex-col items-center justify-center py-10 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm font-medium mb-1">Click to upload video</p>
                  <p className="text-xs text-muted-foreground">MP4, WebM, or MOV (max 100MB)</p>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoUpload}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-contain"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {videoFile?.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({((videoFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveVideo}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="ghost"
              onClick={() => setStep(AQ10_QUESTIONS.length - 1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={() => setStep(AQ10_QUESTIONS.length + 1)}
            >
              {videoUrl ? 'Continue' : 'Skip for now'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Demographics Step */}
      {step === AQ10_QUESTIONS.length + 1 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <p className="text-sm text-muted-foreground">
              Please provide some demographic information to improve screening accuracy
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="age">Age (years)</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter age"
                value={demographics.age}
                onChange={(e) => setDemographics(prev => ({ ...prev, age: e.target.value }))}
                min="1"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={demographics.gender}
                onValueChange={(value) => setDemographics(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m">Male</SelectItem>
                  <SelectItem value="f">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ethnicity">Ethnicity (Optional)</Label>
              <Select
                value={demographics.ethnicity}
                onValueChange={(value) => setDemographics(prev => ({ ...prev, ethnicity: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ethnicity" />
                </SelectTrigger>
                <SelectContent>
                  {ETHNICITY_OPTIONS.map(eth => (
                    <SelectItem key={eth} value={eth}>{eth}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jaundice">Born with jaundice?</Label>
              <Select
                value={demographics.jaundice}
                onValueChange={(value) => setDemographics(prev => ({ ...prev, jaundice: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="austim">Family member with ASD?</Label>
              <Select
                value={demographics.austim}
                onValueChange={(value) => setDemographics(prev => ({ ...prev, austim: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="used_app">Used screening app before?</Label>
              <Select
                value={demographics.used_app_before}
                onValueChange={(value) => setDemographics(prev => ({ ...prev, used_app_before: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="ghost"
              onClick={() => setStep(AQ10_QUESTIONS.length)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canProceedFromDemographics || isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Get Screening Results
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
