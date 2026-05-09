"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"

interface Ember {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  drift: number
}

export function FireEffect() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const embers: Ember[] = useMemo(() => {
    if (!mounted) return []
    const w = window.innerWidth
    const h = window.innerHeight
    return Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * w,
      y: h + Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 3 + Math.random() * 5,
      delay: Math.random() * 4,
      drift: (Math.random() - 0.5) * 80,
    }))
  }, [mounted])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {/* Bottom fire glow */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-primary/15 via-primary/5 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-primary/20 to-transparent blur-xl" />

      {/* Floating embers rising like fire sparks */}
      {embers.map((ember) => (
        <motion.div
          key={ember.id}
          className="absolute rounded-full"
          style={{
            width: ember.size,
            height: ember.size,
            background: `radial-gradient(circle, oklch(0.7 0.2 25 / 0.9), oklch(0.5 0.2 25 / 0.3))`,
            boxShadow: `0 0 ${ember.size * 2}px oklch(0.5 0.2 25 / 0.5)`,
          }}
          initial={{
            x: ember.x,
            y: ember.y,
            opacity: 0,
            scale: 1,
          }}
          animate={{
            y: [ember.y, ember.y - window.innerHeight * 0.7 - Math.random() * 200],
            x: [ember.x, ember.x + ember.drift],
            opacity: [0, 0.9, 0.7, 0],
            scale: [1, 0.8, 0.3],
          }}
          transition={{
            duration: ember.duration,
            repeat: Infinity,
            delay: ember.delay,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Larger slow floating fire particles */}
      {embers.slice(0, 8).map((ember) => (
        <motion.div
          key={`glow-${ember.id}`}
          className="absolute rounded-full blur-sm"
          style={{
            width: ember.size * 3,
            height: ember.size * 3,
            background: `radial-gradient(circle, oklch(0.6 0.22 25 / 0.4), transparent)`,
          }}
          initial={{
            x: ember.x + 50,
            y: ember.y + 50,
            opacity: 0,
          }}
          animate={{
            y: [ember.y + 50, ember.y - window.innerHeight * 0.4],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: ember.duration * 1.5,
            repeat: Infinity,
            delay: ember.delay + 1,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  )
}
