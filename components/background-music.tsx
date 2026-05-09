"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, VolumeX } from "lucide-react"

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    const handleClick = () => {
      if (!hasInteracted && audioRef.current) {
        audioRef.current.volume = 0.3
        audioRef.current.play().then(() => {
          setIsPlaying(true)
          setHasInteracted(true)
        }).catch(() => {
          // Browser may block autoplay
        })
      }
    }

    document.addEventListener("click", handleClick, { once: true })
    return () => document.removeEventListener("click", handleClick)
  }, [hasInteracted])

  const toggleMusic = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.volume = 0.3
      audioRef.current.play()
      setIsPlaying(true)
      setHasInteracted(true)
    }
  }

  return (
    <>
      <audio ref={audioRef} src="/audio/background-music.mp3" loop preload="auto" />
      <motion.button
        onClick={toggleMusic}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-card/80 backdrop-blur-sm border border-border hover:border-primary/50 transition-all cursor-pointer"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isPlaying ? "Pausar musica" : "Tocar musica"}
      >
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div key="on" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Volume2 className="w-5 h-5 text-primary" />
            </motion.div>
          ) : (
            <motion.div key="off" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <VolumeX className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  )
}
