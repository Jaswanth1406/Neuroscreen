"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Share2, Copy, Check, Link, Mail, MessageSquare } from "lucide-react"
import type { ScreeningResult } from "@/app/page"

interface ShareResultsProps {
  result: ScreeningResult
  screeningId?: string
}

export function ShareResults({ result, screeningId }: ShareResultsProps) {
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Generate a shareable summary (no PII)
  const generateShareText = () => {
    return `NeuroScreen AQ-10 Screening Summary:
• Risk Level: ${result.risk_level}
• AQ-10 Score: ${result.aq10_total}/10
• Social Score: ${result.social_score}/5
• Attention Score: ${result.attention_score}/5

Note: This is a screening tool, not a diagnosis. Please consult a healthcare professional for proper evaluation.

Learn more: ${window.location.origin}`
  }

  const shareUrl = screeningId 
    ? `${window.location.origin}/results/${screeningId}` 
    : window.location.origin

  const shareText = generateShareText()

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent('My NeuroScreen Assessment Summary')
    const body = encodeURIComponent(shareText)
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
  }

  const shareViaNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NeuroScreen Assessment',
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled')
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" aria-label="Share screening results">
          <Share2 className="h-4 w-4" />
          Share Results
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Results</DialogTitle>
          <DialogDescription>
            Share a summary of your screening results. No personal information is included.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Quick summary preview */}
          <div className="p-4 bg-muted rounded-lg text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Risk Level:</span>
              <span className="font-medium">{result.risk_level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">AQ-10 Score:</span>
              <span className="font-medium">{result.aq10_total}/10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Social Score:</span>
              <span className="font-medium">{result.social_score}/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Attention Score:</span>
              <span className="font-medium">{result.attention_score}/5</span>
            </div>
          </div>

          {/* Copy summary text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Copy Summary</label>
            <div className="flex gap-2">
              <Input 
                value={shareText.substring(0, 50) + '...'} 
                readOnly 
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => copyToClipboard(shareText)}
                aria-label={copied ? "Copied!" : "Copy to clipboard"}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Share options */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Share via</label>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={shareViaEmail}
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              
              {'share' in navigator && (
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={shareViaNative}
                >
                  <MessageSquare className="h-4 w-4" />
                  More Options
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="gap-2 col-span-2"
                onClick={() => copyToClipboard(shareUrl)}
              >
                <Link className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </div>

          {/* Privacy notice */}
          <p className="text-xs text-muted-foreground">
            🔒 Your privacy is important. Only screening scores are shared — no personal 
            information or detailed answers are included.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
