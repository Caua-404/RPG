"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

const MYSTERY_IMAGES = [
  "/images/characters/char-01.jpg",
  "/images/characters/char-02.jpg",
  "/images/characters/char-03.jpg",
  "/images/characters/char-04.jpg",
  "/images/characters/char-05.jpg",
  "/images/characters/char-06.jpg",
  "/images/characters/char-07.jpg",
  "/images/characters/char-08.jpg",
  "/images/characters/char-09.jpg",
  "/images/characters/char-10.jpg",
  "/images/characters/char-11.jpg",
  "/images/characters/char-12.jpg",
]

interface CardState {
  id: number
  src: string
  startX: number
  startY: number
  endX: number
  endY: number
  rotation: number
}

let idCounter = 0

function shuffleDirection(): CardState {
  const src = MYSTERY_IMAGES[idCounter % MYSTERY_IMAGES.length]
  idCounter++

  // Random flight path across the screen
  const side = Math.floor(Math.random() * 4)
  let startX: number, startY: number, endX: number, endY: number

  switch (side) {
    case 0: // enter from left
      startX = -30
      startY = 15 + Math.random() * 55
      endX = 120
      endY = 10 + Math.random() * 70
      break
    case 1: // enter from right
      startX = 130
      startY = 15 + Math.random() * 55
      endX = -30
      endY = 10 + Math.random() * 70
      break
    case 2: // enter from top
      startX = 10 + Math.random() * 70
      startY = -40
      endX = 15 + Math.random() * 60
      endY = 120
      break
    default: // enter from bottom
      startX = 10 + Math.random() * 70
      startY = 130
      endX = 15 + Math.random() * 60
      endY = -40
      break
  }

  return {
    id: idCounter,
    src,
    startX,
    startY,
    endX,
    endY,
    rotation: -15 + Math.random() * 30,
  }
}

export function MysteryBackground() {
  const [current, setCurrent] = useState<CardState | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate embers only once on mount
  const embers = useMemo(() => {
    if (!mounted) return []
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 2 + Math.random() * 3,
      size: 2 + Math.random() * 3,
    }))
  }, [mounted])

  const spawnNext = useCallback(() => {
    setCurrent(shuffleDirection())
  }, [])

  useEffect(() => {
    if (!mounted) return

    // First card after 2s
    const firstTimeout = setTimeout(() => {
      spawnNext()
    }, 2000)

    // Then cycle every 16s (slow reveal)
    const interval = setInterval(() => {
      spawnNext()
    }, 16000)

    return () => {
      clearTimeout(firstTimeout)
      clearInterval(interval)
    }
  }, [mounted, spawnNext])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            className="absolute"
            style={{
              width: "clamp(220px, 28vw, 360px)",
              aspectRatio: "3/4",
            }}
            initial={{
              left: `${current.startX}%`,
              top: `${current.startY}%`,
              opacity: 0,
              rotate: current.rotation - 8,
              scale: 0.7,
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              left: `${current.endX}%`,
              top: `${current.endY}%`,
              opacity: [0, 0.3, 0.3, 0.3, 0],
              rotate: current.rotation + 8,
              scale: [0.7, 1, 1, 1, 0.8],
              x: "-50%",
              y: "-50%",
            }}
            exit={{
              opacity: 0,
              scale: 0.6,
              filter: "brightness(2) blur(4px)",
            }}
            transition={{
              duration: 14,
              ease: "linear",
              opacity: {
                duration: 14,
                times: [0, 0.08, 0.3, 0.85, 1],
                ease: "easeInOut",
              },
              scale: {
                duration: 14,
                times: [0, 0.08, 0.3, 0.85, 1],
                ease: "easeInOut",
              },
            }}
          >
            {/* Card container with burning edges */}
            <div className="relative w-full h-full">
              {/* Outer fire glow */}
              <div
                className="absolute -inset-3 rounded-2xl animate-red-pulse"
                style={{
                  background:
                    "radial-gradient(ellipse at center, oklch(0.5 0.2 25 / 0.15), transparent 70%)",
                }}
              />

              {/* Card body */}
              <div className="relative w-full h-full rounded-xl overflow-hidden border border-primary/20">
                {/* The image */}
                <Image
                  src={current.src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="360px"
                  priority
                />

                {/* Dark overlay to keep it subtle */}
                <div className="absolute inset-0 bg-background/30" />

                {/* Burning edges overlay - top */}
                <div
                  className="absolute inset-x-0 top-0 h-16"
                  style={{
                    background:
                      "linear-gradient(to bottom, oklch(0.5 0.2 25 / 0.25), oklch(0.3 0.1 25 / 0.1), transparent)",
                    maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
                  }}
                />

                {/* Burning edges overlay - bottom */}
                <div
                  className="absolute inset-x-0 bottom-0 h-20"
                  style={{
                    background:
                      "linear-gradient(to top, oklch(0.5 0.2 25 / 0.35), oklch(0.3 0.1 25 / 0.1), transparent)",
                    maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
                  }}
                />

                {/* Burning edges overlay - left */}
                <div
                  className="absolute inset-y-0 left-0 w-10"
                  style={{
                    background:
                      "linear-gradient(to right, oklch(0.5 0.2 25 / 0.25), transparent)",
                    maskImage: "linear-gradient(to right, black 0%, transparent 100%)",
                  }}
                />

                {/* Burning edges overlay - right */}
                <div
                  className="absolute inset-y-0 right-0 w-10"
                  style={{
                    background:
                      "linear-gradient(to left, oklch(0.5 0.2 25 / 0.25), transparent)",
                    maskImage: "linear-gradient(to left, black 0%, transparent 100%)",
                  }}
                />

                {/* Corner ember glows */}
                <div className="absolute top-0 left-0 w-12 h-12 bg-[radial-gradient(circle,oklch(0.6_0.25_30/0.3),transparent_70%)]" />
                <div className="absolute top-0 right-0 w-12 h-12 bg-[radial-gradient(circle,oklch(0.6_0.25_30/0.2),transparent_70%)]" />
                <div className="absolute bottom-0 left-0 w-14 h-14 bg-[radial-gradient(circle,oklch(0.6_0.25_30/0.25),transparent_70%)]" />
                <div className="absolute bottom-0 right-0 w-14 h-14 bg-[radial-gradient(circle,oklch(0.6_0.25_30/0.3),transparent_70%)]" />
              </div>

              {/* Floating embers around the card */}
              {embers.map((ember) => (
                <motion.div
                  key={ember.id}
                  className="absolute rounded-full"
                  style={{
                    width: ember.size,
                    height: ember.size,
                    left: `${ember.x}%`,
                    bottom: 0,
                    background: "oklch(0.65 0.25 30 / 0.8)",
                    boxShadow: "0 0 4px oklch(0.6 0.25 30 / 0.6)",
                  }}
                  animate={{
                    y: [0, -80 - Math.random() * 120],
                    x: [-10 + Math.random() * 20, -20 + Math.random() * 40],
                    opacity: [0, 0.9, 0],
                    scale: [1, 0.3],
                  }}
                  transition={{
                    duration: ember.duration,
                    repeat: Infinity,
                    delay: ember.delay,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
