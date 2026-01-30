"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function CursorAura() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY })
      setVisible(true)
    }

    const handleLeave = () => {
      setVisible(false)
    }

    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseleave", handleLeave)

    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseleave", handleLeave)
    }
  }, [])

  return (
    <div
      className={cn(
        "neuro-cursor fixed pointer-events-none z-[9999] hidden md:block",
        visible ? "opacity-100" : "opacity-0"
      )}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
    >
      <div className="neuro-cursor-inner" />
    </div>
  )
}

