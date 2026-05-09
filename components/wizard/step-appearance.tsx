"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { ALIGNMENTS, type CharacterSheet } from "@/lib/rpg-data"
import { Upload, User } from "lucide-react"

interface StepAppearanceProps {
  sheet: CharacterSheet
  onUpdate: (updates: Partial<CharacterSheet>) => void
  onFinish: () => void
  onBack: () => void
}

export function StepAppearance({ sheet, onUpdate, onFinish, onBack }: StepAppearanceProps) {
  const isValid = sheet.name.trim().length > 0
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      onUpdate({ characterImage: result })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-wider mb-2">
          Aparência do Personagem
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Dê um nome, envie uma foto e defina a aparência do seu personagem.
        </p>
      </div>

      <div className="max-w-lg mx-auto w-full flex flex-col gap-4">
        {/* Character Image Upload */}
        <div className="flex flex-col items-center gap-3">
          <label className="text-xs font-serif tracking-wider text-muted-foreground uppercase">
            Foto do Personagem
          </label>
          <motion.button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-32 h-32 rounded-xl border-2 border-dashed border-border bg-secondary/40 flex items-center justify-center overflow-hidden hover:border-primary/50 transition-all cursor-pointer group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {sheet.characterImage ? (
              <>
                <Image
                  src={sheet.characterImage}
                  alt="Foto do personagem"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-6 h-6 text-foreground" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                <User className="w-8 h-8" />
                <span className="text-[10px] uppercase tracking-wider font-serif">Enviar foto</span>
              </div>
            )}
          </motion.button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-serif tracking-wider text-muted-foreground uppercase">
            Nome do Personagem *
          </label>
          <input
            type="text"
            value={sheet.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Ex: Thorin, Elara, Kael..."
            className="px-4 py-3 rounded-lg bg-secondary/60 border border-border text-foreground font-serif placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
            maxLength={40}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Age */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-serif tracking-wider text-muted-foreground uppercase">
              Idade
            </label>
            <input
              type="text"
              value={sheet.age}
              onChange={(e) => onUpdate({ age: e.target.value })}
              placeholder="25"
              className="px-4 py-3 rounded-lg bg-secondary/60 border border-border text-foreground font-serif text-center placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>

          {/* Height */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-serif tracking-wider text-muted-foreground uppercase">
              Altura
            </label>
            <input
              type="text"
              value={sheet.height}
              onChange={(e) => onUpdate({ height: e.target.value })}
              placeholder="1.80m"
              className="px-4 py-3 rounded-lg bg-secondary/60 border border-border text-foreground font-serif text-center placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>

          {/* Weight */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-serif tracking-wider text-muted-foreground uppercase">
              Peso
            </label>
            <input
              type="text"
              value={sheet.weight}
              onChange={(e) => onUpdate({ weight: e.target.value })}
              placeholder="80kg"
              className="px-4 py-3 rounded-lg bg-secondary/60 border border-border text-foreground font-serif text-center placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Alignment */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-serif tracking-wider text-muted-foreground uppercase">
            Tendência
          </label>
          <select
            value={sheet.alignment}
            onChange={(e) => onUpdate({ alignment: e.target.value })}
            className="px-4 py-3 rounded-lg bg-secondary/60 border border-border text-foreground font-serif focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
          >
            <option value="">Selecionar...</option>
            {ALIGNMENTS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-serif tracking-wider text-muted-foreground uppercase">
            Descrição da Aparência
          </label>
          <textarea
            value={sheet.appearance}
            onChange={(e) => onUpdate({ appearance: e.target.value })}
            placeholder="Descreva a aparência do seu personagem..."
            rows={3}
            className="px-4 py-3 rounded-lg bg-secondary/60 border border-border text-foreground font-serif placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all resize-none"
          />
        </div>
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
          onClick={onFinish}
          disabled={!isValid}
          className="px-8 py-3 rounded-lg border border-primary/50 bg-primary/20 text-foreground font-serif text-sm tracking-widest uppercase hover:bg-primary/30 hover:border-primary transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer animate-red-pulse"
          whileHover={isValid ? { scale: 1.03 } : {}}
          whileTap={isValid ? { scale: 0.97 } : {}}
        >
          Gerar Ficha
        </motion.button>
      </div>
    </div>
  )
}
