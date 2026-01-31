"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { useSession } from "@/lib/auth-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquareHeart,
  Send,
  Sparkles,
  Plus,
  Lightbulb,
  Heart,
  Brain,
  CheckCircle,
  Square,
  Copy,
  Check,
  RefreshCw,
  Mic,
  MicOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message?: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface TherapyTask {
  id: string
  title: string
  description: string
  category: string
  completed: boolean
  createdAt: string
}

const SUGGESTED_PROMPTS = [
  {
    icon: Brain,
    text: "What daily exercises can help with social interaction?",
    category: "Social Skills",
  },
  {
    icon: Heart,
    text: "How can I manage sensory overload situations?",
    category: "Sensory",
  },
  {
    icon: Lightbulb,
    text: "Suggest therapy activities for improving communication",
    category: "Communication",
  },
  {
    icon: Sparkles,
    text: "Create a weekly therapy task schedule for me",
    category: "Planning",
  },
]

const CATEGORIES = [
  { value: "Social Skills", color: "bg-teal-500" },
  { value: "Communication", color: "bg-green-500" },
  { value: "Sensory", color: "bg-purple-500" },
  { value: "Daily Living", color: "bg-orange-500" },
  { value: "Emotional", color: "bg-pink-500" },
  { value: "Therapy", color: "bg-cyan-500" },
  { value: "Other", color: "bg-gray-500" },
]

export default function ClinicalSupportPage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<TherapyTask[]>([])
  const [mounted, setMounted] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState("")
  const [voiceInput, setVoiceInput] = useState("")
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const [context, setContext] = useState<string>("")

  // useChat must be called before any effects that use its values
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, setMessages, reload } = useChat({
    api: "/api/clinical-chat",
    streamProtocol: "text",
    body: { context }
  })

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognitionAPI) {
        setSpeechSupported(true)
        const recognition = new SpeechRecognitionAPI()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onstart = () => {
          setIsListening(true)
        }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interim = ''
          let final = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              final += transcript
            } else {
              interim += transcript
            }
          }

          if (final) {
            setVoiceInput(prev => prev + final)
            setInterimTranscript('')
          } else {
            setInterimTranscript(interim)
          }
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          setInterimTranscript('')
        }

        recognition.onend = () => {
          setIsListening(false)
          setInterimTranscript('')
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }, [isListening])

  // Sync voice input with chat input
  useEffect(() => {
    if (voiceInput) {
      setInput(input + voiceInput)
      setVoiceInput("")
    }
  }, [voiceInput, input, setInput])

  // Fetch screening history to build context
  useEffect(() => {
    const fetchContext = async () => {
      try {
        const res = await fetch("/api/screening-history")
        if (res.ok) {
          const data = await res.json()
          if (data.history && data.history.length > 0) {
            const latest = data.history[0]

            // Format demographics
            const demo = latest.demographics || {}
            const demographicText = `
User Profile:
- Age: ${demo.age || "Unknown"}
- Gender: ${demo.gender || "Unknown"}
- Born with Jaundice: ${demo.jaundice || "Unknown"}
- Family History of ASD: ${demo.austim || "Unknown"}
            `.trim()

            // Format answers
            let answerText = ""
            if (latest.formatted_answers && latest.formatted_answers.length > 0) {
              answerText = latest.formatted_answers.join("\n")
            } else {
              // Fallback for old records
              const answers = latest.answers || {}
              answerText = Object.entries(answers)
                .map(([key, val]) => {
                  return `- Question ${key}: ${val === 1 ? "Agree/Yes" : "Disagree/No"}`
                })
                .join("\n")
            }

            const contextString = `
SCREENING CONTEXT:
Risk Level: ${latest.risk_level}
Probability: ${(latest.probability * 100).toFixed(1)}%

${demographicText}

Questionnaire Responses:
${answerText}
            `.trim()

            setContext(contextString)
            console.log("Loaded context:", contextString)
          }
        }
      } catch (error) {
        console.error("Failed to fetch screening context:", error)
      }
    }
    if (session) fetchContext()
  }, [session])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && messages.length === 0) {
      const userName = session?.user?.name?.split(" ")[0]
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hello${userName ? `, ${userName}` : ""}! 👋 I'm your AI Clinical Support Assistant, specialized in autism therapy and developmental support.

I can help you with:
- **Personalized therapy recommendations** based on your needs
- **Daily exercises** for social skills, communication, and sensory management
- **Coping strategies** for challenging situations
- **Task suggestions** that you can add to your Progress Tracker

Feel free to ask me anything about autism support, therapy techniques, or managing daily challenges. I can also create specific therapy tasks for you to work on!

*Note: I provide supportive guidance, but please consult healthcare professionals for medical advice.*`,
        },
      ])
    }
  }, [mounted, session, messages.length, setMessages])

  // Fetch tasks from database
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks")
        if (res.ok) {
          const data = await res.json()
          setTasks(data.tasks || [])
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error)
      }
    }
    if (session) fetchTasks()
  }, [session])

  const addTask = async (title: string, description: string, category: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.task) {
          setTasks(prev => [data.task, ...prev])
        }
      }
    } catch (error) {
      console.error("Failed to add task:", error)
    }
  }

  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const parseTasksFromMessage = (content: string) => {
    // Parse tasks with optional category: **Task:** [Category] Task title
    // or just **Task:** Task title (defaults based on content keywords)
    const taskMatches = content.matchAll(/\*\*Task:\*\*\s*(?:\[([^\]]+)\]\s*)?(.+?)(?:\n|$)/g)
    const tasks: { title: string; category: string }[] = []

    for (const match of taskMatches) {
      const explicitCategory = match[1]?.trim()
      const title = match[2].trim()

      // Determine category from explicit tag, or infer from keywords
      let category = "Therapy"
      if (explicitCategory) {
        // Check if it matches a known category
        const found = CATEGORIES.find(c => c.value.toLowerCase() === explicitCategory.toLowerCase())
        category = found ? found.value : explicitCategory
      } else {
        // Infer category from task content
        const lowerTitle = title.toLowerCase()
        if (lowerTitle.includes("social") || lowerTitle.includes("friend") || lowerTitle.includes("conversation") || lowerTitle.includes("eye contact")) {
          category = "Social Skills"
        } else if (lowerTitle.includes("speak") || lowerTitle.includes("talk") || lowerTitle.includes("communicat") || lowerTitle.includes("express")) {
          category = "Communication"
        } else if (lowerTitle.includes("sensory") || lowerTitle.includes("noise") || lowerTitle.includes("light") || lowerTitle.includes("texture") || lowerTitle.includes("calm")) {
          category = "Sensory"
        } else if (lowerTitle.includes("routine") || lowerTitle.includes("morning") || lowerTitle.includes("brush") || lowerTitle.includes("dress") || lowerTitle.includes("eat") || lowerTitle.includes("sleep")) {
          category = "Daily Living"
        } else if (lowerTitle.includes("emotion") || lowerTitle.includes("feel") || lowerTitle.includes("anxie") || lowerTitle.includes("stress") || lowerTitle.includes("happy") || lowerTitle.includes("sad")) {
          category = "Emotional"
        }
      }

      tasks.push({ title, category })
    }
    return tasks
  }

  const getCategoryColor = (category: string) => {
    const found = CATEGORIES.find(c => c.value === category)
    return found?.color || "bg-gray-500"
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/25">
              <MessageSquareHeart className="h-6 w-6 text-white" />
            </div>
            Clinical Support AI
          </h1>
          <p className="text-muted-foreground mt-1">
            Get personalized therapy recommendations and create tasks
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Online
        </Badge>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Chat Section */}
        <Card className="lg:col-span-3 border-0 shadow-2xl overflow-hidden bg-white dark:bg-gray-900">
          <CardContent className="p-0 flex flex-col h-[calc(100vh-280px)] min-h-[600px]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {messages.map((message, index) => (
                  <div key={message.id} className={cn(
                    "flex gap-4",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}>
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/25">
                          <Brain className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}

                    <div className={cn(
                      "flex flex-col max-w-[80%]",
                      message.role === "user" ? "items-end" : "items-start"
                    )}>
                      {message.role === "assistant" && (
                        <span className="text-xs font-medium text-muted-foreground mb-1.5 ml-1">
                          Clinical Support AI
                        </span>
                      )}

                      <div className={cn(
                        "rounded-2xl px-4 py-3 shadow-sm",
                        message.role === "user"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-tr-sm"
                          : "bg-slate-100 dark:bg-gray-800 rounded-tl-sm"
                      )}>
                        {message.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-50">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        )}
                      </div>

                      {/* Action buttons for assistant messages */}
                      {message.role === "assistant" && message.id !== "welcome" && (
                        <div className="flex items-center gap-1 mt-2 ml-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => copyToClipboard(message.content, message.id)}
                          >
                            {copiedId === message.id ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : (
                              <Copy className="h-3 w-3 mr-1" />
                            )}
                            {copiedId === message.id ? "Copied" : "Copy"}
                          </Button>
                          {index === messages.length - 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => reload()}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Regenerate
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Task extraction */}
                      {message.role === "assistant" && message.content.includes("**Task:**") && (
                        <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-800/50 w-full">
                          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                            <Plus className="h-3.5 w-3.5" />
                            Add to Progress Tracker
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {parseTasksFromMessage(message.content).map((task, idx) => (
                              <Button
                                key={idx}
                                variant="secondary"
                                size="sm"
                                className="gap-1.5 bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 shadow-sm"
                                onClick={() => addTask(task.title, `AI-suggested ${task.category.toLowerCase()} task`, task.category)}
                              >
                                <Plus className="h-3 w-3" />
                                <span className={cn("w-2 h-2 rounded-full", getCategoryColor(task.category))} />
                                {task.title}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {message.role === "user" && (
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                          <span className="text-white font-semibold text-sm">
                            {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/25">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-muted-foreground mb-1.5 ml-1">
                        Clinical Support AI
                      </span>
                      <div className="bg-slate-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Suggested Prompts */}
            {messages.length <= 1 && (
              <div className="px-6 pb-4 border-t border-border/50 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-gray-900/50">
                <p className="text-xs font-semibold text-muted-foreground mb-3 mt-4 uppercase tracking-wide">Try asking</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePromptClick(prompt.text)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all text-left group"
                    >
                      <div className={cn(
                        "p-2 rounded-xl transition-colors",
                        idx === 0 && "bg-teal-100 dark:bg-teal-900/50 text-teal-600",
                        idx === 1 && "bg-pink-100 dark:bg-pink-900/50 text-pink-600",
                        idx === 2 && "bg-amber-100 dark:bg-amber-900/50 text-amber-600",
                        idx === 3 && "bg-purple-100 dark:bg-purple-900/50 text-purple-600",
                      )}>
                        <prompt.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{prompt.text}</p>
                        <p className="text-xs text-muted-foreground">{prompt.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area - ChatGPT Style with Voice */}
            <div className="p-4 border-t border-border/50 bg-white dark:bg-gray-900">
              <form onSubmit={handleSubmit} className="relative">
                <div className={cn(
                  "flex items-end gap-2 rounded-2xl border bg-slate-50 dark:bg-gray-800 p-2 transition-all shadow-sm",
                  isListening
                    ? "border-red-400 ring-2 ring-red-400/30"
                    : "border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                )}>
                  <textarea
                    value={input + interimTranscript}
                    onChange={handleInputChange}
                    placeholder={isListening ? "🎤 Listening... speak now" : "Message Clinical Support AI..."}
                    rows={1}
                    className="flex-1 min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus:ring-0 focus:outline-none text-sm px-3 py-3"
                    style={{ height: 'auto' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = Math.min(target.scrollHeight, 200) + 'px'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit(e as any)
                      }
                    }}
                  />
                  {speechSupported && (
                    <Button
                      type="button"
                      size="icon"
                      variant={isListening ? "default" : "ghost"}
                      className={cn(
                        "h-10 w-10 rounded-xl flex-shrink-0 transition-all",
                        isListening && "bg-red-500 hover:bg-red-600 animate-pulse text-white"
                      )}
                      onClick={toggleListening}
                      disabled={isLoading}
                      title={isListening ? "Stop listening" : "Voice input"}
                    >
                      {isListening ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading || (!input.trim() && !interimTranscript.trim())}
                    className={cn(
                      "h-10 w-10 rounded-xl transition-all flex-shrink-0",
                      (input.trim() || interimTranscript.trim())
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
                        : "bg-slate-200 dark:bg-gray-700 text-muted-foreground"
                    )}
                  >
                    {isLoading ? (
                      <Square className="h-4 w-4 fill-current" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                {isListening ? (
                  <span className="text-red-500">🔴 Recording... click mic to stop</span>
                ) : speechSupported ? (
                  "Press Enter to send or use 🎤 for voice input. AI provides supportive guidance only."
                ) : (
                  "AI provides supportive guidance only. Always consult healthcare professionals for medical advice."
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Tasks Sidebar */}
        <Card className="border-0 shadow-xl h-fit sticky top-24">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Recent Tasks
            </CardTitle>
            <CardDescription className="text-xs">
              Tasks added from chat
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.slice(-5).reverse().map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "p-3 rounded-xl border transition-all",
                      task.completed
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-slate-50 dark:bg-gray-800 border-border hover:border-primary/50"
                    )}
                  >
                    <p className={cn(
                      "text-sm font-medium line-clamp-2",
                      task.completed && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </p>
                    <Badge variant="outline" className="mt-2 text-[10px]">
                      {task.category}
                    </Badge>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => window.location.href = "/dashboard/progress"}
                >
                  View All Tasks
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium">No tasks yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ask the AI to suggest therapy tasks!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
