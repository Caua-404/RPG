"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import {
  type CharacterSheet,
  ATTRIBUTES,
  getModifier,
  formatModifier,
  calculateHP,
  calculateAC,
  getProficiencyBonus,
  getCarryCapacity,
  getCarryCategory,
  calculateEquipmentWeight,
} from "@/lib/rpg-data"
import { generateCharacterPDF } from "@/lib/generate-pdf"
import { FileDown, ArrowLeft, Heart, Shield, Star, Swords, Loader2, Users, PawPrint, Skull, MapPin, HelpCircle, UserPlus, Weight, Coins, Sword, Wrench, Languages } from "lucide-react"

interface SheetResultProps {
  sheet: CharacterSheet
  onBack: () => void
  onRestart: () => void
}

export function SheetResult({ sheet, onBack, onRestart }: SheetResultProps) {
  const [generating, setGenerating] = useState(false)
  const hp = calculateHP(sheet)
  const ac = calculateAC(sheet)
  const prof = getProficiencyBonus(sheet.level)
  const strScore = sheet.attributes["Força"] || 10
  const currentWeight = calculateEquipmentWeight(sheet)
  const carryCapacity = getCarryCapacity(strScore)
  const carryCategory = getCarryCategory(currentWeight, strScore)

  const handleGeneratePDF = async () => {
    setGenerating(true)
    try {
      await generateCharacterPDF(sheet)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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
        <span className="font-serif text-xs tracking-[0.3em] uppercase text-primary">Ficha Completa</span>
        <div />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 md:px-8 py-8 overflow-y-auto">
        <motion.div
          className="w-full max-w-2xl flex flex-col gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* Header with character/race image */}
          <div className="text-center">
            {(sheet.characterImage || sheet.race?.image) && (
              <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-2 border-primary/40">
                <Image
                  src={sheet.characterImage || sheet.race?.image || ""}
                  alt={sheet.characterImage ? sheet.name : sheet.race?.name || ""}
                  fill
                  className="object-cover object-top"
                />
              </div>
            )}
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground tracking-wider mb-2 text-balance">
              {sheet.name}
            </h2>
            <p className="text-muted-foreground text-sm">
              {sheet.race?.name} - {sheet.class?.name} - Nível {sheet.level}
            </p>
            {sheet.background && (
              <p className="text-primary/70 text-xs tracking-wider uppercase mt-1">
                {sheet.background.name}
              </p>
            )}
            <div className="w-24 h-0.5 bg-primary/60 mx-auto mt-3" />
          </div>

          {/* Core stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-4 rounded-xl bg-primary/10 border border-primary/20">
              <Heart className="w-5 h-5 text-primary mb-1" />
              <span className="text-2xl font-serif font-bold text-foreground">{hp}</span>
              <span className="text-xs text-muted-foreground uppercase">HP</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-card border border-border">
              <Shield className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-2xl font-serif font-bold text-foreground">{ac}</span>
              <span className="text-xs text-muted-foreground uppercase">CA</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-card border border-border">
              <Star className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-2xl font-serif font-bold text-foreground">+{prof}</span>
              <span className="text-xs text-muted-foreground uppercase">Proficiência</span>
            </div>
          </div>

          {/* Attributes */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h4 className="text-xs uppercase tracking-wider text-primary font-serif mb-3 flex items-center gap-2">
              <Swords className="w-3.5 h-3.5" />
              Atributos
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {ATTRIBUTES.map((attr) => {
                const val = sheet.attributes[attr]
                const mod = getModifier(val)
                return (
                  <div
                    key={attr}
                    className="flex flex-col items-center p-3 rounded-lg bg-secondary/60 border border-border"
                  >
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-serif">
                      {attr}
                    </span>
                    <span className="text-xl font-serif font-bold text-foreground">{val}</span>
                    <span className={`text-xs font-bold ${mod >= 0 ? "text-primary" : "text-destructive"}`}>
                      {formatModifier(mod)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Class with image */}
          {sheet.class && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="text-xs uppercase tracking-wider text-primary font-serif mb-3">
                Classe: {sheet.class.name} ({sheet.class.hitDie})
              </h4>
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-border">
                  <Image
                    src={sheet.class.image}
                    alt={sheet.class.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {sheet.class.abilities.map((a) => (
                      <span key={a} className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-foreground">
                        {a}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sheet.class.proficiencies.map((p) => (
                      <span key={p} className="text-[10px] px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Armor & Shield */}
          {(sheet.equippedArmor || sheet.equippedShield) && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="text-xs uppercase tracking-wider text-primary font-serif mb-3 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Armadura
              </h4>
              <div className="flex flex-wrap gap-3">
                {sheet.equippedArmor && (
                  <div className="flex-1 p-3 rounded-lg bg-secondary/60 border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase block">Armadura</span>
                    <span className="text-sm text-foreground font-serif font-bold">{sheet.equippedArmor.name}</span>
                    <span className="text-[10px] text-muted-foreground block">
                      {sheet.equippedArmor.category} | CA {sheet.equippedArmor.acBase} | {sheet.equippedArmor.weight} kg
                    </span>
                  </div>
                )}
                {sheet.equippedShield && (
                  <div className="p-3 rounded-lg bg-secondary/60 border border-border">
                    <span className="text-[10px] text-muted-foreground uppercase block">Escudo</span>
                    <span className="text-sm text-foreground font-serif font-bold">+2 CA</span>
                    <span className="text-[10px] text-muted-foreground block">{sheet.equippedShield.weight} kg</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Weapons */}
          {(sheet.equippedWeapons || []).length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="text-xs uppercase tracking-wider text-primary font-serif mb-3 flex items-center gap-2">
                <Sword className="w-3.5 h-3.5" />
                Armas
              </h4>
              <div className="flex flex-col gap-2">
                {(sheet.equippedWeapons || []).map((w) => (
                  <div key={w.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/60 border border-border">
                    <div>
                      <span className="text-sm text-foreground font-serif font-bold block">{w.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {w.category} | {w.weight} kg
                        {w.properties !== "-" && ` | ${w.properties}`}
                      </span>
                    </div>
                    <span className="text-sm font-serif font-bold text-primary">{w.damage}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Carry Weight */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h4 className="text-xs uppercase tracking-wider text-primary font-serif mb-3 flex items-center gap-2">
              <Weight className="w-3.5 h-3.5" />
              Carga - <span className={`${
                carryCategory === "Leve" ? "text-green-400" :
                carryCategory === "Media" ? "text-yellow-400" :
                carryCategory === "Pesada" ? "text-orange-400" : "text-destructive"
              }`}>{carryCategory}</span>
            </h4>
            <div className="relative h-2 rounded-full bg-secondary overflow-hidden mb-2">
              <div
                className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                  carryCategory === "Leve" ? "bg-green-500" :
                  carryCategory === "Media" ? "bg-yellow-500" :
                  carryCategory === "Pesada" ? "bg-orange-500" : "bg-destructive"
                }`}
                style={{ width: `${Math.min(100, (currentWeight / carryCapacity.max) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{currentWeight} / {carryCapacity.max} kg</span>
          </div>

          {/* Money */}
          {(sheet.money.PC > 0 || sheet.money.PP > 0 || sheet.money.PE > 0 || sheet.money.PO > 0 || sheet.money.PL > 0) && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="text-xs uppercase tracking-wider text-primary font-serif mb-3 flex items-center gap-2">
                <Coins className="w-3.5 h-3.5" />
                Dinheiro
              </h4>
              <div className="flex flex-wrap gap-3">
                {sheet.money.PC > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <span className="text-sm font-serif font-bold text-orange-400">PC</span>
                    <span className="text-sm text-foreground font-serif">{sheet.money.PC}</span>
                  </div>
                )}
                {sheet.money.PP > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-400/10 border border-gray-400/20">
                    <span className="text-sm font-serif font-bold text-gray-300">PP</span>
                    <span className="text-sm text-foreground font-serif">{sheet.money.PP}</span>
                  </div>
                )}
                {sheet.money.PE > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-400/10 border border-indigo-400/20">
                    <span className="text-sm font-serif font-bold text-indigo-300">PE</span>
                    <span className="text-sm text-foreground font-serif">{sheet.money.PE}</span>
                  </div>
                )}
                {sheet.money.PO > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <span className="text-sm font-serif font-bold text-yellow-400">PO</span>
                    <span className="text-sm text-foreground font-serif">{sheet.money.PO}</span>
                  </div>
                )}
                {sheet.money.PL > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-400/10 border border-blue-400/20">
                    <span className="text-sm font-serif font-bold text-blue-300">PL</span>
                    <span className="text-sm text-foreground font-serif">{sheet.money.PL}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Equipment */}
          {sheet.equipment.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="text-xs uppercase tracking-wider text-primary font-serif mb-3">
                Equipamentos
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {sheet.equipment.map((item, i) => (
                  <span key={`${item}-${i}`} className="text-sm text-muted-foreground font-serif flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tools */}
          {(sheet.selectedTools || []).length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="text-xs uppercase tracking-wider text-primary font-serif mb-3 flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5" />
                Ferramentas
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {(sheet.selectedTools || []).map((tool) => (
                  <div key={tool.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/60 border border-border">
                    <span className="text-xs text-foreground font-serif">{tool.name}</span>
                    <span className="text-[10px] text-muted-foreground">{tool.weight > 0 ? `${tool.weight} kg` : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {((sheet.race?.languages || []).length > 0 || (sheet.selectedLanguages || []).length > 0) && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="text-xs uppercase tracking-wider text-primary font-serif mb-3 flex items-center gap-2">
                <Languages className="w-3.5 h-3.5" />
                Idiomas
              </h4>
              <div className="flex flex-wrap gap-2">
                {(sheet.race?.languages || []).map((lang) => (
                  <span key={lang} className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs text-foreground font-serif">
                    {lang}
                  </span>
                ))}
                {(sheet.selectedLanguages || []).map((lang) => (
                  <span key={lang} className="px-2.5 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-xs text-foreground font-serif">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Personality */}
          {sheet.personalityTrait && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="text-xs uppercase tracking-wider text-primary font-serif mb-3">
                Personalidade
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Traço", value: sheet.personalityTrait },
                  { label: "Ideal", value: sheet.ideal },
                  { label: "Vínculo", value: sheet.bond },
                  { label: "Defeito", value: sheet.flaw },
                ]
                  .filter((item) => item.value)
                  .map((item) => (
                    <div key={item.label} className="p-3 rounded-lg bg-secondary/60">
                      <span className="text-[10px] text-primary uppercase tracking-wider font-serif block mb-1">
                        {item.label}
                      </span>
                      <p className="text-xs text-foreground leading-relaxed">{item.value}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Appearance details */}
          {(sheet.age || sheet.height || sheet.weight || sheet.alignment) && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="text-xs uppercase tracking-wider text-primary font-serif mb-3">
                Detalhes
              </h4>
              <div className="flex flex-wrap gap-4">
                {sheet.age && (
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">Idade</span>
                    <span className="text-sm text-foreground font-serif">{sheet.age}</span>
                  </div>
                )}
                {sheet.height && (
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">Altura</span>
                    <span className="text-sm text-foreground font-serif">{sheet.height}</span>
                  </div>
                )}
                {sheet.weight && (
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">Peso</span>
                    <span className="text-sm text-foreground font-serif">{sheet.weight}</span>
                  </div>
                )}
                {sheet.alignment && (
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">Tendência</span>
                    <span className="text-sm text-foreground font-serif">{sheet.alignment}</span>
                  </div>
                )}
              </div>
              {sheet.appearance && (
                <p className="text-xs text-muted-foreground leading-relaxed mt-3">{sheet.appearance}</p>
              )}
            </div>
          )}

          {/* Relationships */}
          {(sheet.family.length > 0 ||
            sheet.friends.length > 0 ||
            sheet.mascot ||
            sheet.mortalEnemy ||
            sheet.city ||
            sheet.passion) && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="text-xs uppercase tracking-wider text-primary font-serif mb-4 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                Relacionamentos e Vida
              </h4>

              <div className="flex flex-col gap-3">
                {/* City & Passion */}
                {(sheet.city || sheet.passion) && (
                  <div className="flex flex-wrap gap-4">
                    {sheet.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-primary/60" />
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase block">Cidade</span>
                          <span className="text-sm text-foreground font-serif">{sheet.city}</span>
                        </div>
                      </div>
                    )}
                    {sheet.passion && (
                      <div className="flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 text-primary/60" />
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase block">Paixao</span>
                          <span className="text-sm text-foreground font-serif">{sheet.passion}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Mascot */}
                {sheet.mascot && sheet.mascot.name && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/60">
                    <PawPrint className="w-4 h-4 text-primary/60 shrink-0" />
                    {sheet.mascot.image && (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border shrink-0">
                        <Image src={sheet.mascot.image} alt={sheet.mascot.name} fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-primary uppercase tracking-wider font-serif block">
                        Mascote
                      </span>
                      <p className="text-xs text-foreground">
                        {sheet.mascot.name}
                        {sheet.mascot.description && (
                          <span className="text-muted-foreground"> - {sheet.mascot.description}</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Mortal Enemy */}
                {sheet.mortalEnemy && sheet.mortalEnemy.name && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <Skull className="w-4 h-4 text-destructive/60 shrink-0" />
                    {sheet.mortalEnemy.image && (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-destructive/20 shrink-0">
                        <Image src={sheet.mortalEnemy.image} alt={sheet.mortalEnemy.name} fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-destructive uppercase tracking-wider font-serif block">
                        Inimigo Mortal
                      </span>
                      <p className="text-xs text-foreground">
                        {sheet.mortalEnemy.name}
                        {sheet.mortalEnemy.description && (
                          <span className="text-muted-foreground"> - {sheet.mortalEnemy.description}</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Family */}
                {sheet.family.length > 0 && (
                  <div>
                    <span className="text-[10px] text-primary uppercase tracking-wider font-serif block mb-2">
                      Familia
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sheet.family.map((member, i) => (
                        <div
                          key={`fam-${i}`}
                          className="flex items-center gap-2 p-2 rounded-lg bg-secondary/40 border border-border"
                        >
                          {member.image ? (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border shrink-0">
                              <Image src={member.image} alt={member.name || "Familiar"} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border shrink-0">
                              {member.isUnknown ? (
                                <HelpCircle className="w-4 h-4 text-primary/40" />
                              ) : (
                                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                              )}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-[10px] text-primary/70 font-serif block">
                              {member.relationship}
                            </span>
                            <p className="text-xs text-foreground truncate">
                              {member.isUnknown ? "Desconhecido" : member.name || "..."}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Friends */}
                {sheet.friends.length > 0 && (
                  <div>
                    <span className="text-[10px] text-primary uppercase tracking-wider font-serif block mb-2">
                      Amigos
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sheet.friends.map((friend, i) => (
                        <div
                          key={`friend-${i}`}
                          className="flex items-center gap-2 p-2 rounded-lg bg-secondary/40 border border-border"
                        >
                          {friend.image ? (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border shrink-0">
                              <Image src={friend.image} alt={friend.name} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border shrink-0">
                              <UserPlus className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs text-foreground truncate">{friend.name}</p>
                            {friend.description && (
                              <p className="text-[10px] text-muted-foreground truncate">{friend.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 pb-8">
            <motion.button
              onClick={handleGeneratePDF}
              disabled={generating}
              className="flex items-center gap-2 px-8 py-4 rounded-lg bg-primary/20 border border-primary/60 text-foreground font-serif text-base tracking-[0.2em] uppercase hover:bg-primary/30 hover:border-primary transition-all duration-300 animate-red-pulse cursor-pointer disabled:opacity-60"
              whileHover={!generating ? { scale: 1.03 } : {}}
              whileTap={!generating ? { scale: 0.97 } : {}}
            >
              {generating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FileDown className="w-5 h-5" />
              )}
              {generating ? "Gerando..." : "Gerar PDF"}
            </motion.button>

            <motion.button
              onClick={onRestart}
              className="px-8 py-4 rounded-lg border border-border text-muted-foreground font-serif text-base tracking-[0.2em] uppercase hover:text-foreground hover:border-muted-foreground transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Novo Personagem
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
