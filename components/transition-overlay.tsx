"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TransitionOverlayProps {
  playerName: string
  onComplete: () => void
}

// Smoke particle component
function SmokeParticle({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        bottom: "30%",
        background: "radial-gradient(circle, oklch(0.5 0.2 25 / 0.15), oklch(0.3 0.05 15 / 0.05))",
        filter: `blur(${size * 0.6}px)`,
      }}
      initial={{ opacity: 0, y: 60, scale: 0.3 }}
      animate={{
        opacity: [0, 0.7, 0.5, 0],
        y: [60, -20, -80, -160],
        scale: [0.3, 1.2, 1.8, 2.5],
        x: [0, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 120],
      }}
      transition={{
        duration: 3,
        delay,
        ease: "easeOut",
      }}
    />
  )
}

export function TransitionOverlay({ playerName, onComplete }: TransitionOverlayProps) {
  const [phase, setPhase] = useState<"name" | "nameReveal" | "dissolve" | "smoke" | "credits" | "fadeout">("name")

  const nameLetters = useMemo(() => playerName.split(""), [playerName])

  const creditText = "Desenvolvido por Levi e Havenna, simbolos da ordem e do caos"
  const creditWords = useMemo(() => creditText.split(" "), [])

  // Smoke particles for name entrance
  const nameSmokeParticles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: i * 0.06,
      x: 20 + Math.random() * 60,
      size: 50 + Math.random() * 70,
    })),
  [])

  // Smoke particles for credits transition
  const creditsSmokeParticles = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      delay: i * 0.08,
      x: 15 + Math.random() * 70,
      size: 40 + Math.random() * 80,
    })),
  [])

  const handleDissolveComplete = useCallback(() => {
    setPhase("smoke")
  }, [])

  // Phase timing: smoke first, then name emerges, then scatter
  useEffect(() => {
    const smokeTimer = setTimeout(() => setPhase("nameReveal"), 100)
    return () => clearTimeout(smokeTimer)
  }, [])

  useEffect(() => {
    if (phase === "nameReveal") {
      // Name fully revealed, stays visible, then dissolve into mist
      const dissolveTimer = setTimeout(() => setPhase("dissolve"), 3200)
      return () => clearTimeout(dissolveTimer)
    }
  }, [phase])

  useEffect(() => {
    if (phase === "smoke") {
      // After smoke starts, show credits
      const creditsTimer = setTimeout(() => setPhase("credits"), 800)
      return () => clearTimeout(creditsTimer)
    }
    if (phase === "credits") {
      // After credits display, fade out
      const fadeTimer = setTimeout(() => setPhase("fadeout"), 3500)
      return () => clearTimeout(fadeTimer)
    }
    if (phase === "fadeout") {
      const completeTimer = setTimeout(onComplete, 1200)
      return () => clearTimeout(completeTimer)
    }
  }, [phase, onComplete])

  // Smoke particles for name exit (dissipating mist)
  const nameExitSmokeParticles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      delay: i * 0.05,
      x: 25 + Math.random() * 50,
      size: 60 + Math.random() * 80,
    })),
  [])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "fadeout" ? 0 : 1 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      {/* Radial red glow */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--primary)/0.12,transparent_60%)]"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: phase === "name" || phase === "nameReveal" || phase === "dissolve" ? 1 : phase === "smoke" || phase === "credits" ? 0.6 : 0,
          scale: phase === "dissolve" ? 1.8 : 1.2,
        }}
        transition={{ duration: 1 }}
      />

      {/* Name entrance smoke particles */}
      {(phase === "name" || phase === "nameReveal") && (
        <div className="absolute inset-0 pointer-events-none z-[3]">
          {nameSmokeParticles.map((p) => (
            <SmokeParticle key={`name-smoke-${p.id}`} delay={p.delay} x={p.x} size={p.size} />
          ))}
        </div>
      )}

      {/* Ember particles in background */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`ember-${i}`}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{ left: `${10 + Math.random() * 80}%` }}
            initial={{ y: "100vh", opacity: 0 }}
            animate={{ y: "-10vh", opacity: [0, 0.6, 0] }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Exit dissolve smoke particles */}
      {phase === "dissolve" && (
        <div className="absolute inset-0 pointer-events-none z-[4]">
          {nameExitSmokeParticles.map((p) => (
            <SmokeParticle key={`exit-smoke-${p.id}`} delay={p.delay} x={p.x} size={p.size} />
          ))}
        </div>
      )}

      <AnimatePresence mode="sync">
        {/* Phase 1 & 2: Name emerging from smoke & dissolving into mist */}
        {(phase === "name" || phase === "nameReveal" || phase === "dissolve") && (
          <motion.div
            key="name-container"
            className="relative z-10 flex flex-col items-center gap-6"
          >
            {/* Residual smoke haze behind name */}
            <motion.div
              className="absolute -inset-20 pointer-events-none"
              initial={{ opacity: 0.8 }}
              animate={{
                opacity: phase === "dissolve" ? [0.1, 0.6, 0.8, 0] : phase === "nameReveal" ? [0.8, 0.3, 0.1] : 0.8,
                scale: phase === "dissolve" ? [1, 1.5, 2.5] : 1,
              }}
              transition={{ duration: phase === "dissolve" ? 1.8 : 2.5 }}
            >
              <div
                className="w-full h-full"
                style={{
                  background: "radial-gradient(ellipse, oklch(0.5 0.2 25 / 0.15), transparent 60%)",
                  filter: "blur(40px)",
                }}
              />
            </motion.div>

            {/* Subtitle emerging from smoke */}
            <motion.p
              className="text-muted-foreground text-base md:text-lg tracking-[0.3em] uppercase font-serif"
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={
                phase === "dissolve"
                  ? { opacity: 0, scale: 1.1, filter: "blur(20px)" }
                  : phase === "nameReveal"
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 20, filter: "blur(10px)" }
              }
              transition={{ duration: phase === "dissolve" ? 1.2 : 1 }}
            >
              Preparando seu destino
            </motion.p>

            {/* Name - each letter emerges from smoke, dissolves back into mist */}
            <div className="flex items-center justify-center flex-wrap">
              {nameLetters.map((letter, i) => (
                <motion.span
                  key={`letter-${i}`}
                  className="text-4xl md:text-6xl font-serif font-bold text-foreground tracking-wider inline-block animate-text-glow"
                  initial={{
                    opacity: 0,
                    y: 40,
                    scale: 0.7,
                    filter: "blur(16px)",
                  }}
                  animate={
                    phase === "dissolve"
                      ? {
                          opacity: 0,
                          scale: 1.15,
                          filter: "blur(24px)",
                          y: 0,
                        }
                      : phase === "nameReveal"
                      ? {
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          filter: "blur(0px)",
                        }
                      : {
                          opacity: 0,
                          y: 40,
                          scale: 0.7,
                          filter: "blur(16px)",
                        }
                  }
                  transition={
                    phase === "dissolve"
                      ? {
                          duration: 1.4,
                          delay: i * 0.06,
                          ease: [0.4, 0, 0.2, 1],
                        }
                      : {
                          duration: 1,
                          delay: 0.3 + i * 0.1,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }
                  }
                  onAnimationComplete={
                    phase === "dissolve" && i === nameLetters.length - 1
                      ? handleDissolveComplete
                      : undefined
                  }
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </div>

            {/* Decorative line emerging from smoke */}
            <motion.div
              className="w-32 h-0.5 bg-primary"
              initial={{ scaleX: 0, opacity: 0, filter: "blur(8px)" }}
              animate={
                phase === "dissolve"
                  ? { scaleX: 1.5, opacity: 0, filter: "blur(12px)" }
                  : phase === "nameReveal"
                  ? { scaleX: 1, opacity: 1, filter: "blur(0px)" }
                  : { scaleX: 0, opacity: 0, filter: "blur(8px)" }
              }
              transition={{
                duration: phase === "dissolve" ? 1.2 : 0.8,
                delay: phase === "nameReveal" ? 0.3 + nameLetters.length * 0.1 + 0.2 : 0,
              }}
            />

            {/* Subtext emerging from smoke */}
            <motion.p
              className="text-muted-foreground text-sm md:text-base tracking-widest uppercase font-serif"
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={
                phase === "dissolve"
                  ? { opacity: 0, scale: 1.1, filter: "blur(20px)" }
                  : phase === "nameReveal"
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 20, filter: "blur(10px)" }
              }
              transition={{
                duration: phase === "dissolve" ? 1.2 : 0.9,
                delay: phase === "nameReveal" ? 0.3 + nameLetters.length * 0.1 + 0.4 : 0,
              }}
            >
              O Fim Comeca Agora
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 3: Smoke effect for credits transition */}
      {(phase === "smoke" || phase === "credits" || phase === "fadeout") && (
        <div className="absolute inset-0 pointer-events-none z-[5]">
          {creditsSmokeParticles.map((p) => (
            <SmokeParticle key={`credits-smoke-${p.id}`} delay={p.delay} x={p.x} size={p.size} />
          ))}
        </div>
      )}

      {/* Phase 4: Credits text emerging from smoke */}
      {(phase === "credits" || phase === "fadeout") && (
        <motion.div
          className="relative z-10 flex flex-col items-center gap-6 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Top decorative smoke wisps */}
          <motion.div
            className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0.2, 0] }}
            transition={{ duration: 3, ease: "easeOut" }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background: "radial-gradient(ellipse, oklch(0.5 0.2 25 / 0.1), transparent 70%)",
                filter: "blur(20px)",
              }}
            />
          </motion.div>

          {/* Main credit text - word by word from smoke */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 max-w-lg">
            {creditWords.map((word, i) => {
              // Highlight specific words
              const isName = word === "Levi" || word === "Havenna,"
              const isTheme = word === "ordem" || word === "caos"

              return (
                <motion.span
                  key={`word-${i}`}
                  className={`text-lg md:text-2xl font-serif tracking-wider inline-block ${
                    isName
                      ? "font-bold text-primary animate-text-glow"
                      : isTheme
                      ? "font-bold text-foreground"
                      : "text-muted-foreground"
                  }`}
                  initial={{
                    opacity: 0,
                    y: 30,
                    scale: 0.8,
                    filter: "blur(12px)",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)",
                  }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.12,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  {word}
                </motion.span>
              )
            })}
          </div>

          {/* Decorative line */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: creditWords.length * 0.12 + 0.3, duration: 0.8 }}
          >
            <motion.div
              className="w-12 h-px bg-primary/60"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: creditWords.length * 0.12 + 0.3, duration: 0.6 }}
            />
            <motion.div
              className="w-2 h-2 rounded-full bg-primary/40"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: creditWords.length * 0.12 + 0.5, duration: 0.5 }}
            />
            <motion.div
              className="w-12 h-px bg-primary/60"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: creditWords.length * 0.12 + 0.3, duration: 0.6 }}
            />
          </motion.div>

          {/* Residual smoke at the bottom */}
          <motion.div
            className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-40"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.2, 0] }}
            transition={{ duration: 3, ease: "easeOut" }}
          >
            <div
              className="w-full h-full"
              style={{
                background: "radial-gradient(ellipse at bottom, oklch(0.5 0.2 25 / 0.08), transparent 70%)",
                filter: "blur(30px)",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
