"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Gamepad2,
  Brain,
  Heart,
  Wind,
  Users,
  Trophy,
  Star,
  Flame,
  Target,
  Smile,
  Frown,
  Meh,
  PartyPopper,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Volume2,
  Sparkles,
  Timer,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "motion/react"

// Emotion data for the recognition game
const EMOTIONS = [
  { name: "Happy", emoji: "😊", color: "bg-yellow-100 text-yellow-700" },
  { name: "Sad", emoji: "😢", color: "bg-blue-100 text-blue-700" },
  { name: "Angry", emoji: "😠", color: "bg-red-100 text-red-700" },
  { name: "Surprised", emoji: "😮", color: "bg-purple-100 text-purple-700" },
  { name: "Scared", emoji: "😨", color: "bg-orange-100 text-orange-700" },
  { name: "Disgusted", emoji: "🤢", color: "bg-green-100 text-green-700" },
  { name: "Neutral", emoji: "😐", color: "bg-gray-100 text-gray-700" },
  { name: "Excited", emoji: "🤩", color: "bg-pink-100 text-pink-700" },
]

// Breathing patterns
const BREATHING_PATTERNS = [
  { name: "4-7-8 Relaxing", inhale: 4, hold: 7, exhale: 8, description: "Calming technique for anxiety" },
  { name: "Box Breathing", inhale: 4, hold: 4, exhale: 4, description: "Balance and focus" },
  { name: "Energizing", inhale: 6, hold: 0, exhale: 2, description: "Quick energy boost" },
  { name: "Deep Calm", inhale: 5, hold: 5, exhale: 5, description: "Deep relaxation" },
]

// Social scenarios for practice
const SOCIAL_SCENARIOS = [
  {
    situation: "Someone at school says 'Hi!' to you in the hallway.",
    options: [
      { text: "Ignore them and keep walking", correct: false, feedback: "It's polite to acknowledge greetings" },
      { text: "Wave and say 'Hi!' back", correct: true, feedback: "Great! Responding to greetings shows friendliness" },
      { text: "Run away quickly", correct: false, feedback: "This might seem rude or confusing" },
      { text: "Stare at them silently", correct: false, feedback: "A verbal or non-verbal response is better" },
    ]
  },
  {
    situation: "Your friend looks sad and is sitting alone.",
    options: [
      { text: "Ignore them - they probably want to be alone", correct: false, feedback: "Checking in shows you care" },
      { text: "Go over and ask 'Are you okay?'", correct: true, feedback: "Perfect! Showing concern is supportive" },
      { text: "Tell them to stop being sad", correct: false, feedback: "This invalidates their feelings" },
      { text: "Make fun of them for being sad", correct: false, feedback: "This would hurt their feelings more" },
    ]
  },
  {
    situation: "You want to join a group playing a game.",
    options: [
      { text: "Just start playing without asking", correct: false, feedback: "It's better to ask first" },
      { text: "Watch from far away and never approach", correct: false, feedback: "You can politely ask to join" },
      { text: "Ask 'Can I play too?'", correct: true, feedback: "Asking politely is the best approach!" },
      { text: "Push someone out of the way", correct: false, feedback: "This is not kind or respectful" },
    ]
  },
  {
    situation: "Someone gives you a gift you don't really like.",
    options: [
      { text: "Say 'I don't like this' and give it back", correct: false, feedback: "This could hurt their feelings" },
      { text: "Say 'Thank you!' and smile", correct: true, feedback: "Being gracious shows good manners" },
      { text: "Throw it on the ground", correct: false, feedback: "This is very hurtful" },
      { text: "Ignore them completely", correct: false, feedback: "Acknowledging gifts is polite" },
    ]
  },
  {
    situation: "You accidentally bump into someone.",
    options: [
      { text: "Keep walking like nothing happened", correct: false, feedback: "Apologizing is the right thing to do" },
      { text: "Say 'Sorry!' or 'Excuse me'", correct: true, feedback: "Apologizing shows you care about others" },
      { text: "Blame them for being in your way", correct: false, feedback: "Taking responsibility is important" },
      { text: "Start crying loudly", correct: false, feedback: "A simple apology is enough" },
    ]
  },
]

interface GameStats {
  emotionScore: number
  emotionStreak: number
  emotionBest: number
  breathingMinutes: number
  breathingSessions: number
  socialCorrect: number
  socialTotal: number
  totalPoints: number
  achievements: string[]
}

const DEFAULT_STATS: GameStats = {
  emotionScore: 0,
  emotionStreak: 0,
  emotionBest: 0,
  breathingMinutes: 0,
  breathingSessions: 0,
  socialCorrect: 0,
  socialTotal: 0,
  totalPoints: 0,
  achievements: [],
}

export default function TherapyGamesPage() {
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS)
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const [showAchievement, setShowAchievement] = useState<string | null>(null)

  // Load stats from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("therapy-game-stats")
    if (saved) {
      setStats(JSON.parse(saved))
    }
  }, [])

  // Save stats to localStorage
  const saveStats = useCallback((newStats: GameStats) => {
    setStats(newStats)
    localStorage.setItem("therapy-game-stats", JSON.stringify(newStats))
  }, [])

  // Check and award achievements
  const checkAchievements = useCallback((newStats: GameStats) => {
    const newAchievements: string[] = [...newStats.achievements]
    
    if (newStats.emotionScore >= 10 && !newAchievements.includes("emotion_10")) {
      newAchievements.push("emotion_10")
      setShowAchievement("Emotion Expert: 10 correct answers!")
    }
    if (newStats.emotionBest >= 5 && !newAchievements.includes("streak_5")) {
      newAchievements.push("streak_5")
      setShowAchievement("On Fire: 5 streak!")
    }
    if (newStats.breathingSessions >= 5 && !newAchievements.includes("breath_5")) {
      newAchievements.push("breath_5")
      setShowAchievement("Zen Master: 5 breathing sessions!")
    }
    if (newStats.socialCorrect >= 5 && !newAchievements.includes("social_5")) {
      newAchievements.push("social_5")
      setShowAchievement("Social Star: 5 correct responses!")
    }
    
    return { ...newStats, achievements: newAchievements }
  }, [])

  return (
    <div className="space-y-8" role="main" aria-label="Therapy Games">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <Gamepad2 className="h-8 w-8 text-primary" />
            Therapy Games
          </h1>
          <p className="text-muted-foreground mt-1">
            Fun interactive exercises to practice social skills, manage emotions, and relax
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 px-3 py-1">
            <Star className="h-4 w-4 text-yellow-500" />
            {stats.totalPoints} Points
          </Badge>
          <Badge variant="outline" className="gap-1 px-3 py-1">
            <Trophy className="h-4 w-4 text-amber-500" />
            {stats.achievements.length} Badges
          </Badge>
        </div>
      </div>

      {/* Achievement Popup */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <Card className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-2xl">
              <CardContent className="flex items-center gap-3 p-4">
                <PartyPopper className="h-8 w-8" />
                <div>
                  <p className="font-bold">Achievement Unlocked!</p>
                  <p className="text-sm">{showAchievement}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Emotion Recognition Game */}
        <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer group">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 group-hover:scale-110 transition-transform">
                <Smile className="h-6 w-6 text-yellow-600" />
              </div>
              <Badge variant="secondary">Social Skills</Badge>
            </div>
            <CardTitle className="mt-4">Emotion Recognition</CardTitle>
            <CardDescription>
              Practice identifying emotions from facial expressions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Best Streak: <span className="font-bold text-foreground">{stats.emotionBest}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Score: <span className="font-bold text-foreground">{stats.emotionScore}</span>
              </div>
            </div>
            <Button 
              className="w-full gap-2" 
              onClick={() => setActiveGame("emotion")}
            >
              <Play className="h-4 w-4" />
              Play Now
            </Button>
          </CardContent>
        </Card>

        {/* Breathing Exercise */}
        <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer group">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 group-hover:scale-110 transition-transform">
                <Wind className="h-6 w-6 text-cyan-600" />
              </div>
              <Badge variant="secondary">Relaxation</Badge>
            </div>
            <CardTitle className="mt-4">Breathing Exercises</CardTitle>
            <CardDescription>
              Guided breathing patterns to help you calm down and focus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Sessions: <span className="font-bold text-foreground">{stats.breathingSessions}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Minutes: <span className="font-bold text-foreground">{stats.breathingMinutes}</span>
              </div>
            </div>
            <Button 
              className="w-full gap-2" 
              variant="outline"
              onClick={() => setActiveGame("breathing")}
            >
              <Play className="h-4 w-4" />
              Start Session
            </Button>
          </CardContent>
        </Card>

        {/* Social Scenarios */}
        <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer group">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <Badge variant="secondary">Communication</Badge>
            </div>
            <CardTitle className="mt-4">Social Scenarios</CardTitle>
            <CardDescription>
              Practice responding to common social situations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Correct: <span className="font-bold text-foreground">{stats.socialCorrect}/{stats.socialTotal}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Rate: <span className="font-bold text-foreground">
                  {stats.socialTotal > 0 ? ((stats.socialCorrect / stats.socialTotal) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
            <Button 
              className="w-full gap-2" 
              variant="outline"
              onClick={() => setActiveGame("social")}
            >
              <Play className="h-4 w-4" />
              Practice
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Your Achievements
          </CardTitle>
          <CardDescription>
            Collect badges by completing activities and reaching milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AchievementBadge 
              name="Emotion Expert"
              description="Get 10 correct answers"
              icon={Smile}
              unlocked={stats.achievements.includes("emotion_10")}
            />
            <AchievementBadge 
              name="On Fire"
              description="5 answer streak"
              icon={Flame}
              unlocked={stats.achievements.includes("streak_5")}
            />
            <AchievementBadge 
              name="Zen Master"
              description="Complete 5 breathing sessions"
              icon={Wind}
              unlocked={stats.achievements.includes("breath_5")}
            />
            <AchievementBadge 
              name="Social Star"
              description="5 correct social responses"
              icon={Users}
              unlocked={stats.achievements.includes("social_5")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Game Dialogs */}
      <EmotionGameDialog 
        open={activeGame === "emotion"}
        onClose={() => setActiveGame(null)}
        stats={stats}
        onUpdateStats={(newStats) => {
          const updated = checkAchievements(newStats)
          saveStats(updated)
          setTimeout(() => setShowAchievement(null), 3000)
        }}
      />

      <BreathingDialog 
        open={activeGame === "breathing"}
        onClose={() => setActiveGame(null)}
        stats={stats}
        onUpdateStats={(newStats) => {
          const updated = checkAchievements(newStats)
          saveStats(updated)
          setTimeout(() => setShowAchievement(null), 3000)
        }}
      />

      <SocialScenariosDialog 
        open={activeGame === "social"}
        onClose={() => setActiveGame(null)}
        stats={stats}
        onUpdateStats={(newStats) => {
          const updated = checkAchievements(newStats)
          saveStats(updated)
          setTimeout(() => setShowAchievement(null), 3000)
        }}
      />
    </div>
  )
}

// Achievement Badge Component
function AchievementBadge({ 
  name, 
  description, 
  icon: Icon, 
  unlocked 
}: { 
  name: string
  description: string
  icon: any
  unlocked: boolean 
}) {
  return (
    <div className={cn(
      "p-4 rounded-xl border-2 text-center transition-all",
      unlocked 
        ? "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300"
        : "bg-muted/50 border-muted opacity-50"
    )}>
      <div className={cn(
        "w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2",
        unlocked ? "bg-yellow-100 dark:bg-yellow-900/50" : "bg-muted"
      )}>
        <Icon className={cn("h-6 w-6", unlocked ? "text-yellow-600" : "text-muted-foreground")} />
      </div>
      <p className="font-semibold text-sm">{name}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

// Emotion Recognition Game Dialog
function EmotionGameDialog({ 
  open, 
  onClose, 
  stats, 
  onUpdateStats 
}: { 
  open: boolean
  onClose: () => void
  stats: GameStats
  onUpdateStats: (stats: GameStats) => void
}) {
  const [currentEmotion, setCurrentEmotion] = useState(EMOTIONS[0])
  const [options, setOptions] = useState<typeof EMOTIONS>([])
  const [streak, setStreak] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null)

  const generateQuestion = useCallback(() => {
    const correct = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)]
    const wrongOptions = EMOTIONS.filter(e => e.name !== correct.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    const allOptions = [...wrongOptions, correct].sort(() => Math.random() - 0.5)
    
    setCurrentEmotion(correct)
    setOptions(allOptions)
    setFeedback(null)
  }, [])

  useEffect(() => {
    if (open) {
      generateQuestion()
      setStreak(0)
      setScore(0)
    }
  }, [open, generateQuestion])

  const handleAnswer = (selected: typeof EMOTIONS[0]) => {
    const isCorrect = selected.name === currentEmotion.name
    
    if (isCorrect) {
      const newStreak = streak + 1
      const newScore = score + 1
      setStreak(newStreak)
      setScore(newScore)
      setFeedback({ correct: true, message: "Correct! Great job!" })
      
      // Update stats
      const newBest = Math.max(stats.emotionBest, newStreak)
      onUpdateStats({
        ...stats,
        emotionScore: stats.emotionScore + 1,
        emotionStreak: newStreak,
        emotionBest: newBest,
        totalPoints: stats.totalPoints + 10,
      })
    } else {
      setStreak(0)
      setFeedback({ correct: false, message: `That was ${currentEmotion.name}. Try again!` })
    }

    setTimeout(() => {
      generateQuestion()
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smile className="h-5 w-5 text-yellow-500" />
            Emotion Recognition
          </DialogTitle>
          <DialogDescription>
            Look at the emoji and select the matching emotion
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Score display */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              Score: {score}
            </Badge>
            <Badge variant="outline" className={cn("gap-1", streak >= 3 && "bg-orange-100 text-orange-700")}>
              <Flame className={cn("h-4 w-4", streak >= 3 ? "text-orange-500" : "text-muted-foreground")} />
              Streak: {streak}
            </Badge>
          </div>

          {/* Emoji display */}
          <div className="flex justify-center">
            <div className="text-9xl animate-bounce-slow">
              {currentEmotion.emoji}
            </div>
          </div>

          {/* Feedback */}
          <AnimatePresence mode="wait">
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "p-3 rounded-lg text-center font-medium",
                  feedback.correct 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}
              >
                {feedback.correct ? <CheckCircle2 className="h-5 w-5 inline mr-2" /> : <XCircle className="h-5 w-5 inline mr-2" />}
                {feedback.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {options.map((emotion) => (
              <Button
                key={emotion.name}
                variant="outline"
                className={cn("h-auto py-4 text-lg", emotion.color)}
                onClick={() => handleAnswer(emotion)}
                disabled={!!feedback}
              >
                {emotion.name}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Breathing Exercise Dialog
function BreathingDialog({ 
  open, 
  onClose, 
  stats, 
  onUpdateStats 
}: { 
  open: boolean
  onClose: () => void
  stats: GameStats
  onUpdateStats: (stats: GameStats) => void
}) {
  const [selectedPattern, setSelectedPattern] = useState(BREATHING_PATTERNS[0])
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale")
  const [timer, setTimer] = useState(0)
  const [cycles, setCycles] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(0)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setTimer((prev) => {
        const nextTimer = prev + 1
        setTotalSeconds(s => s + 1)

        // Determine phase transitions
        if (phase === "inhale" && nextTimer >= selectedPattern.inhale) {
          if (selectedPattern.hold > 0) {
            setPhase("hold")
          } else {
            setPhase("exhale")
          }
          return 0
        }
        if (phase === "hold" && nextTimer >= selectedPattern.hold) {
          setPhase("exhale")
          return 0
        }
        if (phase === "exhale" && nextTimer >= selectedPattern.exhale) {
          setPhase("inhale")
          setCycles(c => c + 1)
          return 0
        }

        return nextTimer
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, phase, selectedPattern])

  const handleStart = () => {
    setIsActive(true)
    setPhase("inhale")
    setTimer(0)
    setCycles(0)
    setTotalSeconds(0)
  }

  const handleStop = () => {
    setIsActive(false)
    
    // Save stats
    const minutes = Math.ceil(totalSeconds / 60)
    if (cycles > 0) {
      onUpdateStats({
        ...stats,
        breathingMinutes: stats.breathingMinutes + minutes,
        breathingSessions: stats.breathingSessions + 1,
        totalPoints: stats.totalPoints + (cycles * 5),
      })
    }
  }

  const getPhaseProgress = () => {
    const duration = selectedPattern[phase]
    return duration > 0 ? (timer / duration) * 100 : 0
  }

  const getCircleScale = () => {
    if (phase === "inhale") return 1 + (timer / selectedPattern.inhale) * 0.5
    if (phase === "exhale") return 1.5 - (timer / selectedPattern.exhale) * 0.5
    return 1.5
  }

  return (
    <Dialog open={open} onOpenChange={() => { handleStop(); onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-cyan-500" />
            Breathing Exercise
          </DialogTitle>
          <DialogDescription>
            Follow the circle to breathe in rhythm
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Pattern selector */}
          {!isActive && (
            <div className="grid grid-cols-2 gap-2">
              {BREATHING_PATTERNS.map((pattern) => (
                <Button
                  key={pattern.name}
                  variant={selectedPattern.name === pattern.name ? "default" : "outline"}
                  className="h-auto py-3 flex-col"
                  onClick={() => setSelectedPattern(pattern)}
                >
                  <span className="font-medium">{pattern.name}</span>
                  <span className="text-xs opacity-70">{pattern.description}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Breathing visualization */}
          <div className="flex flex-col items-center justify-center py-8">
            <motion.div
              className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-lg"
              animate={{ scale: isActive ? getCircleScale() : 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <span className="text-lg font-bold capitalize">
                {isActive ? phase : "Ready"}
              </span>
            </motion.div>

            {isActive && (
              <div className="mt-6 text-center">
                <p className="text-4xl font-bold text-primary">{timer}s</p>
                <p className="text-muted-foreground capitalize">{phase}</p>
                <div className="mt-4 w-48">
                  <Progress value={getPhaseProgress()} className="h-2" />
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">{cycles}</p>
              <p className="text-sm text-muted-foreground">Cycles</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{Math.floor(totalSeconds / 60)}:{(totalSeconds % 60).toString().padStart(2, '0')}</p>
              <p className="text-sm text-muted-foreground">Duration</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            {!isActive ? (
              <Button onClick={handleStart} className="gap-2">
                <Play className="h-4 w-4" />
                Start Breathing
              </Button>
            ) : (
              <Button onClick={handleStop} variant="outline" className="gap-2">
                <Pause className="h-4 w-4" />
                Stop
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Social Scenarios Dialog
function SocialScenariosDialog({ 
  open, 
  onClose, 
  stats, 
  onUpdateStats 
}: { 
  open: boolean
  onClose: () => void
  stats: GameStats
  onUpdateStats: (stats: GameStats) => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const currentScenario = SOCIAL_SCENARIOS[currentIndex]

  useEffect(() => {
    if (open) {
      setCurrentIndex(0)
      setSelectedOption(null)
      setShowFeedback(false)
    }
  }, [open])

  const handleSelect = (index: number) => {
    setSelectedOption(index)
    setShowFeedback(true)

    const isCorrect = currentScenario.options[index].correct
    
    onUpdateStats({
      ...stats,
      socialCorrect: stats.socialCorrect + (isCorrect ? 1 : 0),
      socialTotal: stats.socialTotal + 1,
      totalPoints: stats.totalPoints + (isCorrect ? 15 : 0),
    })
  }

  const handleNext = () => {
    if (currentIndex < SOCIAL_SCENARIOS.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedOption(null)
      setShowFeedback(false)
    } else {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            Social Scenarios
          </DialogTitle>
          <DialogDescription>
            Scenario {currentIndex + 1} of {SOCIAL_SCENARIOS.length}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress */}
          <Progress value={((currentIndex + 1) / SOCIAL_SCENARIOS.length) * 100} className="h-2" />

          {/* Scenario */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-lg font-medium">{currentScenario.situation}</p>
            </CardContent>
          </Card>

          {/* Options */}
          <div className="space-y-2">
            {currentScenario.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className={cn(
                  "w-full h-auto py-3 px-4 justify-start text-left whitespace-normal",
                  showFeedback && option.correct && "bg-green-100 border-green-500 dark:bg-green-900/30",
                  showFeedback && selectedOption === index && !option.correct && "bg-red-100 border-red-500 dark:bg-red-900/30"
                )}
                onClick={() => !showFeedback && handleSelect(index)}
                disabled={showFeedback}
              >
                {option.text}
              </Button>
            ))}
          </div>

          {/* Feedback */}
          {showFeedback && selectedOption !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-4 rounded-lg",
                currentScenario.options[selectedOption].correct 
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-amber-100 dark:bg-amber-900/30"
              )}
            >
              <p className="font-medium flex items-center gap-2">
                {currentScenario.options[selectedOption].correct ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Sparkles className="h-5 w-5 text-amber-600" />
                )}
                {currentScenario.options[selectedOption].feedback}
              </p>
            </motion.div>
          )}

          {/* Next button */}
          {showFeedback && (
            <Button onClick={handleNext} className="w-full gap-2">
              {currentIndex < SOCIAL_SCENARIOS.length - 1 ? (
                <>
                  Next Scenario
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4" />
                  Complete!
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
