"use client"

import { useState, useEffect, useMemo, type FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MysteryBackground } from "@/components/mystery-background"

interface Particle {
  id: number
  x: number
  y: number
  duration: number
  delay: number
}

interface WelcomeScreenProps {
  onComplete: (name: string) => void
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [name, setName] = useState("")
  const [phase, setPhase] = useState<"intro" | "ask-name">("intro")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const particles: Particle[] = useMemo(() => {
    if (!mounted) return []
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      duration: 4 + Math.random() * 4,
      delay: Math.random() * 3,
    }))
  }, [mounted])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onComplete(name.trim())
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Mysterious character images in background */}
      <MysteryBackground />

      {/* Floating ember particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            initial={{ x: p.x, y: p.y, opacity: 0 }}
            animate={{
              y: [p.y, p.y - 150],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--background)_80%)] z-[2]" />

      <AnimatePresence mode="wait">
        {phase === "intro" ? (
          <motion.div
            key="intro"
            className="relative z-10 flex flex-col items-center gap-8 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8 }}
          >
            {/* Mysterious glow instead of single character image */}
            <motion.div
              className="relative w-40 h-40 md:w-56 md:h-56"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <div className="absolute inset-0 rounded-full bg-primary/15 blur-3xl animate-red-pulse" />
              <div className="absolute inset-4 rounded-full border border-primary/20 animate-spin" style={{ animationDuration: "20s" }} />
              <div className="absolute inset-8 rounded-full border border-primary/10 animate-spin" style={{ animationDuration: "30s", animationDirection: "reverse" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-primary/60 animate-red-pulse" />
              </div>
            </motion.div>

            {/* Welcome text */}
            <motion.div
              className="flex flex-col items-center gap-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground tracking-wider text-balance">
                Bem-vindo, Viajante
              </h1>
              <div className="w-24 h-0.5 bg-primary/60" />
              <p className="text-muted-foreground text-base md:text-lg max-w-md leading-relaxed">
                Os portais entre mundos se abriram. Seu destino aguarda nas sombras.
              </p>
            </motion.div>

            {/* Continue button */}
            <motion.button
              onClick={() => setPhase("ask-name")}
              className="mt-4 px-8 py-3 rounded-lg border border-primary/50 bg-primary/10 text-foreground font-serif text-lg tracking-widest uppercase hover:bg-primary/20 hover:border-primary transition-all duration-300 animate-red-pulse cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Adentrar
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="ask-name"
            className="relative z-10 flex flex-col items-center gap-8 px-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="flex flex-col items-center gap-3 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-foreground tracking-wider text-balance">
                Como devo te chamar?
              </h2>
              <p className="text-muted-foreground text-sm md:text-base max-w-sm leading-relaxed">
                Diga-me seu nome para que eu possa guiar sua jornada.
              </p>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit}
              className="flex flex-col items-center gap-4 w-full max-w-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome..."
                className="w-full px-6 py-4 bg-secondary/60 border border-border rounded-lg text-foreground text-center font-serif text-lg placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all duration-300"
                autoFocus
                maxLength={30}
              />

              <motion.button
                type="submit"
                disabled={!name.trim()}
                className="px-10 py-3 rounded-lg border border-primary/50 bg-primary/10 text-foreground font-serif text-base tracking-widest uppercase hover:bg-primary/20 hover:border-primary transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                whileHover={name.trim() ? { scale: 1.05 } : {}}
                whileTap={name.trim() ? { scale: 0.98 } : {}}
              >
                Continuar
              </motion.button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
