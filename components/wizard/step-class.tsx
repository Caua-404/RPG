"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { classes, type CharacterClass, type CharacterSheet } from "@/lib/rpg-data"
import { Check, ChevronDown, X, Shield, Swords } from "lucide-react"

interface StepClassProps {
  sheet: CharacterSheet
  onUpdate: (updates: Partial<CharacterSheet>) => void
  onNext: () => void
  onBack: () => void
}

export function StepClass({ sheet, onUpdate, onNext, onBack }: StepClassProps) {
  const [revealedClass, setRevealedClass] = useState<string | null>(null)

  const handleCardClick = (cls: CharacterClass) => {
    if (revealedClass === cls.name) {
      // Segundo clique - confirma a escolha
      onUpdate({
        class: cls,
        equipment: [],
        equippedArmor: null,
        equippedShield: null,
      })
      setRevealedClass(null)
    } else {
      // Primeiro clique - revela informacoes
      setRevealedClass(cls.name)
    }
  }

  const isSelected = (name: string) => sheet.class?.name === name

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-wider mb-2">
          Escolha sua Classe
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Clique em um card para revelar as informacoes. Clique novamente para confirmar sua escolha.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
        {classes.map((cls, index) => {
          const isRevealed = revealedClass === cls.name
          const selected = isSelected(cls.name)

          return (
            <motion.div
              key={cls.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.4 }}
            >
              <AnimatePresence mode="wait">
                {isRevealed ? (
                  /* Revealed state */
                  <motion.div
                    key="revealed"
                    className={`relative overflow-hidden rounded-lg border text-left cursor-pointer transition-all duration-300 ${
                      selected
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-primary/40 bg-card"
                    }`}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleCardClick(cls)}
                  >
                    {selected && (
                      <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}

                    <button
                      onClick={(e) => { e.stopPropagation(); setRevealedClass(null) }}
                      className="absolute top-2 left-2 z-10 w-5 h-5 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>

                    <div className="relative h-20 overflow-hidden">
                      <Image
                        src={cls.image}
                        alt={cls.name}
                        fill
                        className="object-cover object-top"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                    </div>

                    <div className="p-3">
                      <h4 className="font-serif font-bold text-foreground tracking-wider text-sm mb-1">
                        {cls.name}
                      </h4>
                      <p className="text-muted-foreground text-[10px] leading-relaxed mb-2">
                        {cls.description}
                      </p>

                      {/* Core stats */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-bold flex items-center gap-0.5">
                          <Shield className="w-2.5 h-2.5" />
                          {cls.hitDie}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                          {cls.primaryAbility}
                        </span>
                      </div>

                      {/* Abilities */}
                      <div className="flex flex-col gap-0.5 mb-2">
                        {cls.abilities.map((ability) => (
                          <span key={ability} className="text-[9px] text-muted-foreground leading-tight">
                            - {ability}
                          </span>
                        ))}
                      </div>

                      {/* Proficiencies */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {cls.proficiencies.slice(0, 3).map((prof) => (
                          <span key={prof} className="text-[8px] px-1 py-0.5 rounded bg-secondary/60 text-muted-foreground truncate max-w-[90px]">
                            {prof}
                          </span>
                        ))}
                        {cls.proficiencies.length > 3 && (
                          <span className="text-[8px] px-1 py-0.5 rounded bg-secondary/60 text-muted-foreground">
                            +{cls.proficiencies.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Saving Throws */}
                      <div className="text-[9px] text-muted-foreground mb-2">
                        Salvaguardas: {cls.savingThrows.join(", ")}
                      </div>

                      {/* Confirm hint */}
                      <div className="mt-1 py-1.5 text-center rounded bg-primary/10 border border-primary/20">
                        <span className="text-[10px] text-primary font-serif tracking-wider uppercase">
                          {selected ? "Selecionada" : "Clique para confirmar"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Compact card */
                  <motion.button
                    key="card"
                    className={`group relative w-full overflow-hidden rounded-lg border text-left transition-all duration-300 cursor-pointer ${
                      selected
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-border bg-card hover:border-primary/30 hover:bg-card/80"
                    }`}
                    initial={{ rotateY: -90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleCardClick(cls)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {selected && (
                      <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}

                    <div className="relative h-32 overflow-hidden">
                      <Image
                        src={cls.image}
                        alt={cls.name}
                        fill
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                    </div>

                    <div className="p-3">
                      <h4 className="font-serif font-bold text-foreground tracking-wider mb-1">
                        {cls.name}
                      </h4>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <span className="flex items-center gap-1 text-[10px]">
                          <Shield className="w-3 h-3 text-primary/60" />
                          {cls.hitDie}
                        </span>
                        <span className="flex items-center gap-1 text-[10px]">
                          <Swords className="w-3 h-3 text-primary/60" />
                          {cls.primaryAbility}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span className="text-[10px]">Clique para ver detalhes</span>
                        <ChevronDown className="w-3 h-3" />
                      </div>
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>
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
          disabled={!sheet.class}
          className="px-8 py-3 rounded-lg border border-primary/50 bg-primary/10 text-foreground font-serif text-sm tracking-widest uppercase hover:bg-primary/20 hover:border-primary transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          whileHover={sheet.class ? { scale: 1.03 } : {}}
          whileTap={sheet.class ? { scale: 0.97 } : {}}
        >
          Proximo
        </motion.button>
      </div>
    </div>
  )
}
