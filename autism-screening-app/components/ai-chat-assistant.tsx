"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Conversation, 
  ConversationContent,
  ConversationScrollButton
} from "@/components/ai-elements/conversation"
import { 
  Message, 
  MessageContent, 
  MessageResponse,
  MessageActions,
  MessageAction
} from "@/components/ai-elements/message"
import { Loader } from "@/components/ai-elements/loader"
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
  type PromptInputMessage
} from "@/components/ai-elements/prompt-input"
import { 
  Brain, 
  Copy, 
  RefreshCw, 
  Sparkles,
  MessageSquare,
  FileText,
  HelpCircle,
  Mic,
  MicOff,
  Volume2
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ScreeningResult } from "@/app/page"

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

interface AIChatAssistantProps {
  screeningResult: ScreeningResult | null
}

// Suggested prompts
const SUGGESTED_PROMPTS = [
  {
    icon: Brain,
    title: "Explain my results",
    prompt: "Can you explain what my screening results mean in simple terms?"
  },
  {
    icon: HelpCircle,
    title: "What is ASD?",
    prompt: "What is Autism Spectrum Disorder and how does screening work?"
  },
  {
    icon: FileText,
    title: "Next steps",
    prompt: "What should I do next based on my screening results?"
  },
  {
    icon: Sparkles,
    title: "Support resources",
    prompt: "What resources and support are available for ASD?"
  }
]

export function AIChatAssistant({ screeningResult }: AIChatAssistantProps) {
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState("")
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  
  const { messages, append, isLoading, stop, reload } = useChat({
    api: '/api/chat',
    body: {
      screeningResult
    },
    streamProtocol: 'text',
  })

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        setSpeechSupported(true)
        const recognition = new SpeechRecognition()
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
            setInput(prev => prev + final)
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

  const handleSendMessage = (message: PromptInputMessage) => {
    const text = typeof message === 'string' ? message : message.text
    if (!text?.trim()) return

    append({ role: 'user', content: text })
    setInput("")
  }

  const handleSuggestedPrompt = (prompt: string) => {
    append({ role: 'user', content: prompt })
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Map status for PromptInputSubmit
  const status = isLoading ? 'streaming' : 'ready'

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">AI Screening Assistant</CardTitle>
            <CardDescription>
              Ask questions about ASD, your screening results, or get support
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col min-h-0 pb-4">
        <Conversation className="flex-1 min-h-0">
          <ConversationContent className="pr-2">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Brain className="h-16 w-16 text-primary/20 mb-4" />
                <h3 className="font-semibold text-lg mb-2">How can I help you today?</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-md">
                  I can explain your screening results, answer questions about ASD, 
                  or help you understand next steps.
                </p>
                
                {/* Suggested Prompts */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                  {SUGGESTED_PROMPTS.map((item, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto py-3 px-4 justify-start gap-2 text-left"
                      onClick={() => handleSuggestedPrompt(item.prompt)}
                      disabled={isLoading}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{item.title}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.filter(m => m.role === 'user' || m.role === 'assistant').map((message) => (
                  <Message key={message.id} from={message.role as 'user' | 'assistant'}>
                    <MessageContent>
                      <MessageResponse>
                        {message.content}
                      </MessageResponse>
                      {message.role === "assistant" && (
                        <MessageActions>
                          <MessageAction
                            onClick={() => handleCopy(message.content)}
                            tooltip="Copy"
                          >
                            <Copy className="h-3 w-3" />
                          </MessageAction>
                          <MessageAction
                            onClick={() => reload()}
                            tooltip="Regenerate"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </MessageAction>
                        </MessageActions>
                      )}
                    </MessageContent>
                  </Message>
                ))}
                {isLoading && <Loader />}
              </>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Input Area */}
        <PromptInput 
          onSubmit={handleSendMessage}
          className="mt-4 shrink-0"
        >
          <PromptInputBody>
            <PromptInputTextarea
              placeholder={isListening ? "Listening... speak now" : "Ask about ASD, your screening results, or get support..."}
              value={input + interimTranscript}
              onChange={(e) => setInput(e.target.value)}
              className={cn(isListening && "border-primary ring-2 ring-primary/20")}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <div className="flex items-center gap-2">
                {speechSupported && (
                  <Button
                    type="button"
                    variant={isListening ? "default" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-full transition-all",
                      isListening && "bg-red-500 hover:bg-red-600 animate-pulse"
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
                <span className="text-xs text-muted-foreground">
                  {isListening 
                    ? '🔴 Listening... click mic to stop' 
                    : isLoading 
                      ? 'Generating...' 
                      : speechSupported 
                        ? 'Press Enter or use mic 🎤' 
                        : 'Press Enter to send'}
                </span>
              </div>
            </PromptInputTools>
            <PromptInputSubmit 
              disabled={(!input.trim() && !interimTranscript.trim()) && !isLoading}
              status={status}
              onStop={stop}
            />
          </PromptInputFooter>
        </PromptInput>
      </CardContent>
    </Card>
  )
}
