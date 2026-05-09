"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { backgrounds, type Background, type CharacterSheet } from "@/lib/rpg-data"
import { Check, Sparkles } from "lucide-react"

interface StepBackgroundProps {
  sheet: CharacterSheet
  onUpdate: (updates: Partial<CharacterSheet>) => void
  onNext: () => void
  onBack: () => void
}

export function StepBackground({ sheet, onUpdate, onNext, onBack }: StepBackgroundProps) {
  const handleSelect = (bg: Background) => {
    onUpdate({ background: bg })
  }

  const handleGenerateStory = () => {
    if (!sheet.background) return
    const bg = sheet.background
    const trait = bg.traits[Math.floor(Math.random() * bg.traits.length)]
    const ideal = bg.ideals[Math.floor(Math.random() * bg.ideals.length)]
    const bond = bg.bonds[Math.floor(Math.random() * bg.bonds.length)]
    const flaw = bg.flaws[Math.floor(Math.random() * bg.flaws.length)]
    onUpdate({
      personalityTrait: trait,
      ideal,
      bond,
      flaw,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-wider mb-2">
          Escolha seu Antecedente
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Seu passado molda quem você é e define sua história.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {backgrounds.map((bg, index) => {
          const isSelected = sheet.background?.name === bg.name
          return (
            <motion.button
              key={bg.name}
              onClick={() => handleSelect(bg)}
              className={`group relative overflow-hidden rounded-lg border text-left transition-all duration-300 cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "border-border bg-card hover:border-primary/30 hover:bg-card/80"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}

              {/* Image */}
              <div className="relative h-28 overflow-hidden">
                <Image
                  src={bg.image}
                  alt={bg.name}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-3">
                <h4 className="font-serif font-bold text-foreground tracking-wider mb-1">
                  {bg.name}
                </h4>
                <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                  {bg.description}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Generate Story Button */}
      {sheet.background && (
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button
            onClick={handleGenerateStory}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary/15 border border-primary/40 text-foreground font-serif text-sm tracking-wider hover:bg-primary/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            Gerar História
          </button>

          {sheet.personalityTrait && (
            <motion.div
              className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {[
                { label: "Traço", value: sheet.personalityTrait },
                { label: "Ideal", value: sheet.ideal },
                { label: "Vínculo", value: sheet.bond },
                { label: "Defeito", value: sheet.flaw },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg bg-secondary/60 border border-border">
                  <span className="text-[10px] uppercase tracking-wider text-primary font-serif block mb-1">
                    {item.label}
                  </span>
                  <p className="text-foreground text-xs leading-relaxed">{item.value}</p>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}

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
          disabled={!sheet.background}
          className="px-8 py-3 rounded-lg border border-primary/50 bg-primary/10 text-foreground font-serif text-sm tracking-widest uppercase hover:bg-primary/20 hover:border-primary transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          whileHover={sheet.background ? { scale: 1.03 } : {}}
          whileTap={sheet.background ? { scale: 0.97 } : {}}
        >
          Próximo
        </motion.button>
      </div>
    </div>
  )
}
