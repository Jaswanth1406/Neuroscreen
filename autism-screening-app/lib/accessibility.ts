/**
 * Accessibility Utilities for NeuroScreen
 * Provides helpers for keyboard navigation, focus management, and ARIA attributes
 */

import React from 'react'

/**
 * Creates keyboard event handlers for common accessibility patterns
 */
export function createKeyboardHandler(
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowKeys?: {
    onUp?: () => void
    onDown?: () => void
    onLeft?: () => void
    onRight?: () => void
  }
) {
  return (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        if (onEnter) {
          event.preventDefault()
          onEnter()
        }
        break
      case 'Escape':
        if (onEscape) {
          event.preventDefault()
          onEscape()
        }
        break
      case 'ArrowUp':
        if (onArrowKeys?.onUp) {
          event.preventDefault()
          onArrowKeys.onUp()
        }
        break
      case 'ArrowDown':
        if (onArrowKeys?.onDown) {
          event.preventDefault()
          onArrowKeys.onDown()
        }
        break
      case 'ArrowLeft':
        if (onArrowKeys?.onLeft) {
          event.preventDefault()
          onArrowKeys.onLeft()
        }
        break
      case 'ArrowRight':
        if (onArrowKeys?.onRight) {
          event.preventDefault()
          onArrowKeys.onRight()
        }
        break
    }
  }
}

/**
 * Screen reader only component - visually hidden but accessible
 */
export function ScreenReaderOnly({ children }: { children: React.ReactNode }): React.ReactElement {
  return React.createElement('span', { className: 'sr-only' }, children)
}

/**
 * Skip to main content link for keyboard users
 */
export function SkipToContent({ targetId = "main-content" }: { targetId?: string }): React.ReactElement {
  return React.createElement('a', {
    href: `#${targetId}`,
    className: "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
  }, 'Skip to main content')
}

/**
 * Live region announcer for dynamic content updates
 */
export function useAnnounce() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    document.body.appendChild(announcer)
    
    // Small delay to ensure the element is in the DOM
    setTimeout(() => {
      announcer.textContent = message
    }, 100)
    
    // Clean up after announcement
    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  }
  
  return announce
}

/**
 * Focus trap utility for modals and dialogs
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstFocusable = focusableElements[0] as HTMLElement
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable.focus()
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable.focus()
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown)
  
  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Generate unique IDs for form elements
 */
let idCounter = 0
export function generateId(prefix = 'id') {
  return `${prefix}-${++idCounter}`
}

/**
 * Common ARIA labels for the app
 */
export const ARIA_LABELS = {
  // Navigation
  mainNavigation: 'Main navigation',
  dashboardNavigation: 'Dashboard navigation',
  breadcrumb: 'Breadcrumb navigation',
  
  // Actions
  closeDialog: 'Close dialog',
  openMenu: 'Open menu',
  toggleTheme: 'Toggle color theme',
  submitForm: 'Submit form',
  
  // Screening
  screeningForm: 'AQ-10 Screening questionnaire',
  screeningResults: 'Screening results',
  riskLevel: 'Risk level assessment',
  
  // Dashboard
  taskList: 'Therapy tasks list',
  progressChart: 'Progress chart',
  analyticsOverview: 'Analytics overview',
  
  // Games
  emotionGame: 'Emotion recognition game',
  breathingExercise: 'Breathing exercise',
  socialScenarios: 'Social scenarios practice',
}

/**
 * Reduced motion preference check
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * High contrast mode check
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-contrast: more)').matches
}
