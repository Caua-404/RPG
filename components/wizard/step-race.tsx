"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { races, type Race, type CharacterSheet } from "@/lib/rpg-data"
import { Check, ChevronDown, X } from "lucide-react"

interface StepRaceProps {
  sheet: CharacterSheet
  onUpdate: (updates: Partial<CharacterSheet>) => void
  onNext: () => void
}

export function StepRace({ sheet, onUpdate, onNext }: StepRaceProps) {
  const [revealedRace, setRevealedRace] = useState<string | null>(null)

  const handleCardClick = (race: Race) => {
    if (revealedRace === race.name) {
      // Segundo clique - confirma a escolha
      const newAttributes = { ...sheet.attributes }
      if (sheet.race) {
        for (const [attr, bonus] of Object.entries(sheet.race.bonuses)) {
          newAttributes[attr as keyof typeof newAttributes] -= bonus
        }
      }
      for (const [attr, bonus] of Object.entries(race.bonuses)) {
        newAttributes[attr as keyof typeof newAttributes] += bonus
      }
      onUpdate({ race, attributes: newAttributes })
      setRevealedRace(null)
    } else {
      // Primeiro clique - revela informacoes
      setRevealedRace(race.name)
    }
  }

  const isSelected = (name: string) => sheet.race?.name === name

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-wider mb-2">
          Escolha sua Raca
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Clique em um card para revelar as informacoes. Clique novamente para confirmar sua escolha.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
        {races.map((race, index) => {
          const isRevealed = revealedRace === race.name
          const selected = isSelected(race.name)

          return (
            <motion.div
              key={race.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <AnimatePresence mode="wait">
                {isRevealed ? (
                  /* Revealed state - shows full info */
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
                    onClick={() => handleCardClick(race)}
                  >
                    {selected && (
                      <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}

                    {/* Close button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setRevealedRace(null) }}
                      className="absolute top-2 left-2 z-10 w-5 h-5 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>

                    {/* Small image */}
                    <div className="relative h-20 overflow-hidden">
                      <Image
                        src={race.image}
                        alt={race.name}
                        fill
                        className="object-cover object-top"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                    </div>

                    {/* Full info */}
                    <div className="p-3">
                      <h4 className="font-serif font-bold text-foreground tracking-wider text-sm mb-1">
                        {race.name}
                      </h4>
                      <p className="text-muted-foreground text-[10px] leading-relaxed mb-2">
                        {race.description}
                      </p>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {Object.entries(race.bonuses).map(([attr, bonus]) => (
                          <span
                            key={attr}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-bold"
                          >
                            +{bonus} {attr}
                          </span>
                        ))}
                      </div>

                      {/* Traits */}
                      <div className="flex flex-col gap-0.5 mb-2">
                        {race.traits.map((trait) => (
                          <span key={trait} className="text-[9px] text-muted-foreground leading-tight">
                            - {trait}
                          </span>
                        ))}
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap gap-2 text-[9px] text-muted-foreground">
                        <span>Vel: {race.speed}</span>
                        <span>Tam: {race.size}</span>
                      </div>

                      {/* Confirm hint */}
                      <div className="mt-2 py-1.5 text-center rounded bg-primary/10 border border-primary/20">
                        <span className="text-[10px] text-primary font-serif tracking-wider uppercase">
                          {selected ? "Selecionada" : "Clique para confirmar"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Compact card state */
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
                    onClick={() => handleCardClick(race)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {selected && (
                      <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative h-32 overflow-hidden">
                      <Image
                        src={race.image}
                        alt={race.name}
                        fill
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                    </div>

                    {/* Name + hint */}
                    <div className="p-3">
                      <h4 className="font-serif font-bold text-foreground tracking-wider mb-1">
                        {race.name}
                      </h4>
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

      <div className="flex justify-end">
        <motion.button
          onClick={onNext}
          disabled={!sheet.race}
          className="px-8 py-3 rounded-lg border border-primary/50 bg-primary/10 text-foreground font-serif text-sm tracking-widest uppercase hover:bg-primary/20 hover:border-primary transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          whileHover={sheet.race ? { scale: 1.03 } : {}}
          whileTap={sheet.race ? { scale: 0.97 } : {}}
        >
          Proximo
        </motion.button>
      </div>
    </div>
  )
}
