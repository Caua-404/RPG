"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { rollDie } from "@/lib/rpg-data"
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react"

const DICE_TYPES = [4, 6, 8, 10, 12, 20] as const

const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]

export function DiceRoller() {
  const [result, setResult] = useState<number | null>(null)
  const [currentDie, setCurrentDie] = useState<number>(20)
  const [isRolling, setIsRolling] = useState(false)

  const handleRoll = (sides: number) => {
    setCurrentDie(sides)
    setIsRolling(true)
    setResult(null)

    setTimeout(() => {
      setResult(rollDie(sides))
      setIsRolling(false)
    }, 500)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Result */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isRolling ? (
            <motion.div
              key="rolling"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
            >
              <Dice6 className="w-10 h-10 text-primary" />
            </motion.div>
          ) : result !== null ? (
            <motion.span
              key={`result-${result}-${Date.now()}`}
              className="text-2xl font-serif font-bold text-foreground"
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {result}
            </motion.span>
          ) : (
            <span className="text-muted-foreground/40 text-sm font-serif">d{currentDie}</span>
          )}
        </AnimatePresence>
      </div>

      {/* Dice buttons */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {DICE_TYPES.map((sides, i) => {
          const Icon = diceIcons[i]
          return (
            <button
              key={sides}
              onClick={() => handleRoll(sides)}
              disabled={isRolling}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-serif transition-all cursor-pointer disabled:opacity-50 ${
                currentDie === sides && result !== null
                  ? "bg-primary/20 border border-primary/50 text-foreground"
                  : "bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              <Icon className="w-3 h-3" />
              d{sides}
            </button>
          )
        })}
      </div>
    </div>
  )
}
