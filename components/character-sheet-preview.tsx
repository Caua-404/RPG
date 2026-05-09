"use client"

import { motion } from "framer-motion"
import {
  type CharacterSheet,
  ATTRIBUTES,
  getModifier,
  formatModifier,
  calculateHP,
  calculateAC,
  getProficiencyBonus,
} from "@/lib/rpg-data"
import { Heart, Shield, Star, Swords, Sword } from "lucide-react"

interface CharacterSheetPreviewProps {
  sheet: CharacterSheet
}

export function CharacterSheetPreview({ sheet }: CharacterSheetPreviewProps) {
  const hp = calculateHP(sheet)
  const ac = calculateAC(sheet)
  const profBonus = getProficiencyBonus(sheet.level)

  return (
    <motion.div
      className="w-full lg:w-80 flex-shrink-0 rounded-xl border border-border bg-card/80 backdrop-blur-sm p-5 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-120px)]"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="text-center border-b border-border pb-3">
        <h4 className="font-serif font-bold text-foreground tracking-wider text-lg">
          {sheet.name || "Sem nome"}
        </h4>
        <p className="text-muted-foreground text-xs mt-1">
          {sheet.race?.name || "?"} - {sheet.class?.name || "?"} - Nv. {sheet.level}
        </p>
        {sheet.background && (
          <p className="text-primary/70 text-[10px] tracking-wider uppercase mt-1">
            {sheet.background.name}
          </p>
        )}
      </div>

      {/* Core Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center p-2 rounded-lg bg-primary/10 border border-primary/20">
          <Heart className="w-4 h-4 text-primary mb-1" />
          <span className="text-lg font-serif font-bold text-foreground">{hp}</span>
          <span className="text-[10px] text-muted-foreground uppercase">HP</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-secondary border border-border">
          <Shield className="w-4 h-4 text-muted-foreground mb-1" />
          <span className="text-lg font-serif font-bold text-foreground">{ac}</span>
          <span className="text-[10px] text-muted-foreground uppercase">CA</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-secondary border border-border">
          <Star className="w-4 h-4 text-muted-foreground mb-1" />
          <span className="text-lg font-serif font-bold text-foreground">+{profBonus}</span>
          <span className="text-[10px] text-muted-foreground uppercase">Prof.</span>
        </div>
      </div>

      {/* Attributes */}
      <div>
        <h5 className="text-[10px] uppercase tracking-wider text-primary font-serif mb-2 flex items-center gap-2">
          <Swords className="w-3 h-3" />
          Atributos
        </h5>
        <div className="grid grid-cols-2 gap-1.5">
          {ATTRIBUTES.map((attr) => {
            const val = sheet.attributes[attr]
            const mod = getModifier(val)
            return (
              <div
                key={attr}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-secondary/60 border border-border"
              >
                <span className="text-[10px] text-muted-foreground uppercase font-serif">
                  {attr.slice(0, 3)}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-serif font-bold text-foreground">{val}</span>
                  <span
                    className={`text-[10px] font-bold ${mod >= 0 ? "text-primary" : "text-destructive"}`}
                  >
                    {formatModifier(mod)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Class info */}
      {sheet.class && (
        <div>
          <h5 className="text-[10px] uppercase tracking-wider text-primary font-serif mb-2">
            Classe
          </h5>
          <div className="flex flex-wrap gap-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-foreground">
              {sheet.class.hitDie}
            </span>
            {sheet.class.abilities.map((a) => (
              <span
                key={a}
                className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Armor */}
      {(sheet.equippedArmor || sheet.equippedShield) && (
        <div>
          <h5 className="text-[10px] uppercase tracking-wider text-primary font-serif mb-2 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Armadura
          </h5>
          <div className="flex flex-col gap-1">
            {sheet.equippedArmor && (
              <span className="text-xs text-foreground font-serif">
                {sheet.equippedArmor.name} ({sheet.equippedArmor.category})
              </span>
            )}
            {sheet.equippedShield && (
              <span className="text-xs text-muted-foreground font-serif">
                Escudo (+2 CA)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Weapons */}
      {(sheet.equippedWeapons || []).length > 0 && (
        <div>
          <h5 className="text-[10px] uppercase tracking-wider text-primary font-serif mb-2 flex items-center gap-1">
            <Sword className="w-3 h-3" />
            Armas
          </h5>
          <div className="flex flex-col gap-1">
            {(sheet.equippedWeapons || []).slice(0, 4).map((w) => (
              <span key={w.name} className="text-xs text-foreground font-serif">
                {w.name} <span className="text-muted-foreground">({w.damage})</span>
              </span>
            ))}
            {(sheet.equippedWeapons || []).length > 4 && (
              <span className="text-[10px] text-muted-foreground/60">
                + {(sheet.equippedWeapons || []).length - 4} mais...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Money */}
      {sheet.money && (sheet.money.PC > 0 || sheet.money.PP > 0 || sheet.money.PE > 0 || sheet.money.PO > 0 || sheet.money.PL > 0) && (
        <div>
          <h5 className="text-[10px] uppercase tracking-wider text-primary font-serif mb-2">
            Dinheiro
          </h5>
          <div className="flex flex-wrap gap-1.5">
            {sheet.money.PC > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400">PC: {sheet.money.PC}</span>}
            {sheet.money.PP > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-400/10 text-gray-300">PP: {sheet.money.PP}</span>}
            {sheet.money.PE > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-400/10 text-indigo-300">PE: {sheet.money.PE}</span>}
            {sheet.money.PO > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">PO: {sheet.money.PO}</span>}
            {sheet.money.PL > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-400/10 text-blue-300">PL: {sheet.money.PL}</span>}
          </div>
        </div>
      )}

      {/* Equipment */}
      {sheet.equipment.length > 0 && (
        <div>
          <h5 className="text-[10px] uppercase tracking-wider text-primary font-serif mb-2">
            Equipamentos
          </h5>
          <div className="flex flex-col gap-1">
            {sheet.equipment.slice(0, 6).map((item, i) => (
              <span key={`${item}-${i}`} className="text-xs text-muted-foreground font-serif">
                - {item}
              </span>
            ))}
            {sheet.equipment.length > 6 && (
              <span className="text-[10px] text-muted-foreground/60">
                + {sheet.equipment.length - 6} mais...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Personality */}
      {sheet.personalityTrait && (
        <div>
          <h5 className="text-[10px] uppercase tracking-wider text-primary font-serif mb-2">
            Personalidade
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {sheet.personalityTrait}
          </p>
        </div>
      )}
    </motion.div>
  )
}
