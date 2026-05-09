"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ATTRIBUTES,
  STANDARD_ARRAY,
  roll4d6DropLowest,
  getModifier,
  formatModifier,
  type CharacterSheet,
  type Attribute,
} from "@/lib/rpg-data"
import { Dice6, RotateCcw } from "lucide-react"

interface StepAttributesProps {
  sheet: CharacterSheet
  onUpdate: (updates: Partial<CharacterSheet>) => void
  onNext: () => void
  onBack: () => void
}

export function StepAttributes({ sheet, onUpdate, onNext, onBack }: StepAttributesProps) {
  const [mode, setMode] = useState<"standard" | "roll">("standard")
  const [assigned, setAssigned] = useState<Record<string, number | null>>({})
  const [rolling, setRolling] = useState<string | null>(null)

  const usedValues = Object.values(assigned).filter(Boolean) as number[]
  const availableValues = STANDARD_ARRAY.filter(
    (v) => usedValues.filter((u) => u === v).length < STANDARD_ARRAY.filter((s) => s === v).length
  )

  const handleStandardAssign = (attr: Attribute, value: number) => {
    const newAssigned = { ...assigned, [attr]: value }
    setAssigned(newAssigned)

    const newAttributes = { ...sheet.attributes }
    const raceBonus = sheet.race?.bonuses[attr] || 0
    newAttributes[attr] = value + raceBonus
    onUpdate({ attributes: newAttributes })
  }

  const handleRoll = (attr: Attribute) => {
    setRolling(attr)
    setTimeout(() => {
      const result = roll4d6DropLowest()
      const raceBonus = sheet.race?.bonuses[attr] || 0
      const newAttributes = { ...sheet.attributes }
      newAttributes[attr] = result + raceBonus
      onUpdate({ attributes: newAttributes })
      setRolling(null)
    }, 600)
  }

  const handleRollAll = () => {
    const newAttributes = { ...sheet.attributes }
    for (const attr of ATTRIBUTES) {
      const result = roll4d6DropLowest()
      const raceBonus = sheet.race?.bonuses[attr] || 0
      newAttributes[attr] = result + raceBonus
    }
    onUpdate({ attributes: newAttributes })
  }

  const handleResetAll = () => {
    setAssigned({})
    const newAttributes = { ...sheet.attributes }
    for (const attr of ATTRIBUTES) {
      const raceBonus = sheet.race?.bonuses[attr] || 0
      newAttributes[attr] = 10 + raceBonus
    }
    onUpdate({ attributes: newAttributes })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-wider mb-2">
          Defina seus Atributos
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Distribua seus pontos entre os atributos do personagem.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => { setMode("standard"); handleResetAll() }}
          className={`px-6 py-2 rounded-lg font-serif text-sm tracking-wider transition-all duration-300 cursor-pointer ${
            mode === "standard"
              ? "bg-primary/20 border border-primary/50 text-foreground"
              : "border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Distribuição Padrão
        </button>
        <button
          onClick={() => { setMode("roll"); handleResetAll() }}
          className={`px-6 py-2 rounded-lg font-serif text-sm tracking-wider transition-all duration-300 cursor-pointer ${
            mode === "roll"
              ? "bg-primary/20 border border-primary/50 text-foreground"
              : "border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Rolagem 4d6
        </button>
      </div>

      {mode === "roll" && (
        <div className="flex justify-center gap-3">
          <button
            onClick={handleRollAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 bg-primary/5 text-foreground text-sm font-serif hover:bg-primary/10 transition-all cursor-pointer"
          >
            <Dice6 className="w-4 h-4 text-primary" />
            Rolar Todos
          </button>
          <button
            onClick={handleResetAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-muted-foreground text-sm font-serif hover:text-foreground transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Resetar
          </button>
        </div>
      )}

      {/* Standard mode: available values */}
      {mode === "standard" && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-muted-foreground text-xs font-serif mr-2">Disponíveis:</span>
          {STANDARD_ARRAY.map((val, idx) => {
            const isUsed = usedValues.filter((u) => u === val).length >= STANDARD_ARRAY.filter((s) => s === val).length
            return (
              <span
                key={idx}
                className={`px-3 py-1 rounded-md text-sm font-serif font-bold ${
                  isUsed
                    ? "bg-secondary/30 text-muted-foreground/40 line-through"
                    : "bg-primary/10 border border-primary/30 text-foreground"
                }`}
              >
                {val}
              </span>
            )
          })}
        </div>
      )}

      {/* Attribute Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {ATTRIBUTES.map((attr, index) => {
          const baseValue = sheet.attributes[attr]
          const raceBonus = sheet.race?.bonuses[attr] || 0
          const mod = getModifier(baseValue)
          const isRolling = rolling === attr

          return (
            <motion.div
              key={attr}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
            >
              <span className="text-xs font-serif tracking-wider text-muted-foreground uppercase">
                {attr}
              </span>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${attr}-${baseValue}`}
                  className="text-3xl font-serif font-bold text-foreground"
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isRolling ? (
                    <motion.span
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                    >
                      <Dice6 className="w-8 h-8 text-primary" />
                    </motion.span>
                  ) : (
                    baseValue
                  )}
                </motion.div>
              </AnimatePresence>

              <span className={`text-sm font-serif font-bold ${mod >= 0 ? "text-primary" : "text-destructive"}`}>
                {formatModifier(mod)}
              </span>

              {raceBonus > 0 && (
                <span className="text-[10px] text-primary/70">
                  (+{raceBonus} raça)
                </span>
              )}

              {mode === "standard" ? (
                <select
                  value={assigned[attr] ?? ""}
                  onChange={(e) => handleStandardAssign(attr, Number(e.target.value))}
                  className="w-full px-2 py-1 rounded-md bg-secondary border border-border text-foreground text-xs font-serif text-center focus:outline-none focus:border-primary/50 cursor-pointer"
                >
                  <option value="">Atribuir</option>
                  {STANDARD_ARRAY.filter(
                    (v) =>
                      v === assigned[attr] ||
                      availableValues.includes(v)
                  ).map((v, i) => (
                    <option key={`${v}-${i}`} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              ) : (
                <button
                  onClick={() => handleRoll(attr)}
                  disabled={isRolling}
                  className="flex items-center gap-1 px-3 py-1 rounded-md bg-primary/10 border border-primary/30 text-foreground text-xs font-serif hover:bg-primary/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Dice6 className="w-3 h-3" />
                  Rolar
                </button>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="flex justify-between">
        <motion.button
          onClick={onBack}
          className="px-8 py-3 rounded-lg border border-border text-muted-foreground font-serif text-sm tracking-widest uppercase hover:text-foreground hover:border-muted-foreground transition-all duration-300 cursor-pointer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Voltar
        </motion.button>
        <motion.button
          onClick={onNext}
          className="px-8 py-3 rounded-lg border border-primary/50 bg-primary/10 text-foreground font-serif text-sm tracking-widest uppercase hover:bg-primary/20 hover:border-primary transition-all duration-300 cursor-pointer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Próximo
        </motion.button>
      </div>
    </div>
  )
}
