"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { type CharacterSheet, createEmptySheet } from "@/lib/rpg-data"
import { StepRace } from "@/components/wizard/step-race"
import { StepClass } from "@/components/wizard/step-class"
import { StepAttributes } from "@/components/wizard/step-attributes"
import { StepBackground } from "@/components/wizard/step-background"
import { StepEquipment } from "@/components/wizard/step-equipment"
import { StepAppearance } from "@/components/wizard/step-appearance"
import { StepRelationships } from "@/components/wizard/step-relationships"
import { CharacterSheetPreview } from "@/components/character-sheet-preview"
import { DiceRoller } from "@/components/dice-roller"
import { ArrowLeft, Dice6 } from "lucide-react"

const STEPS = [
  { key: "race", label: "Raca" },
  { key: "class", label: "Classe" },
  { key: "attributes", label: "Atributos" },
  { key: "background", label: "Antecedente" },
  { key: "equipment", label: "Equipamentos" },
  { key: "relationships", label: "Relacoes" },
  { key: "appearance", label: "Aparencia" },
]

interface CharacterWizardProps {
  playerName: string
  campaignId: string
  onComplete: (sheet: CharacterSheet) => void
  onBack: () => void
}

export function CharacterWizard({ playerName, campaignId, onComplete, onBack }: CharacterWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [sheet, setSheet] = useState<CharacterSheet>(() => ({
    ...createEmptySheet(playerName),
    campaignId,
  }))
  const [showDice, setShowDice] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleUpdate = (updates: Partial<CharacterSheet>) => {
    setSheet((prev) => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleFinish = () => {
    onComplete(sheet)
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-serif text-sm tracking-wider">Voltar</span>
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-1">
          {STEPS.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "bg-primary w-6"
                    : index < currentStep
                      ? "bg-primary/50"
                      : "bg-border"
                }`}
              />
              {index < STEPS.length - 1 && <div className="w-4 h-px bg-border mx-0.5" />}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDice(!showDice)}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              showDice ? "border-primary/50 bg-primary/10" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Dice6 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-2 rounded-lg border font-serif text-xs tracking-wider transition-all cursor-pointer lg:hidden ${
              showPreview ? "border-primary/50 bg-primary/10 text-foreground" : "border-border text-muted-foreground"
            }`}
          >
            Ficha
          </button>
        </div>
      </div>

      {/* Step label */}
      <div className="text-center py-3 border-b border-border/50">
        <span className="text-xs font-serif tracking-[0.3em] uppercase text-primary">
          Etapa {currentStep + 1} de {STEPS.length} — {STEPS[currentStep].label}
        </span>
      </div>

      {/* Dice roller popup */}
      <AnimatePresence>
        {showDice && (
          <motion.div
            className="absolute top-24 right-4 z-30 p-4 rounded-xl border border-border bg-card shadow-2xl"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <DiceRoller />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 px-4 md:px-8 py-6 overflow-y-auto">
        {/* Wizard steps */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && (
                <StepRace sheet={sheet} onUpdate={handleUpdate} onNext={handleNext} />
              )}
              {currentStep === 1 && (
                <StepClass sheet={sheet} onUpdate={handleUpdate} onNext={handleNext} onBack={handleBack} />
              )}
              {currentStep === 2 && (
                <StepAttributes sheet={sheet} onUpdate={handleUpdate} onNext={handleNext} onBack={handleBack} />
              )}
              {currentStep === 3 && (
                <StepBackground sheet={sheet} onUpdate={handleUpdate} onNext={handleNext} onBack={handleBack} />
              )}
              {currentStep === 4 && (
                <StepEquipment sheet={sheet} onUpdate={handleUpdate} onNext={handleNext} onBack={handleBack} />
              )}
              {currentStep === 5 && (
                <StepRelationships sheet={sheet} onUpdate={handleUpdate} onNext={handleNext} onBack={handleBack} />
              )}
              {currentStep === 6 && (
                <StepAppearance sheet={sheet} onUpdate={handleUpdate} onFinish={handleFinish} onBack={handleBack} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Live preview sidebar - always visible on desktop */}
        <div className={`${showPreview ? "block" : "hidden"} lg:block`}>
          <CharacterSheetPreview sheet={sheet} />
        </div>
      </div>
    </motion.div>
  )
}
