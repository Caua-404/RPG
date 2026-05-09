"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import {
  FAMILY_RELATIONSHIPS,
  type CharacterSheet,
  type FamilyMember,
  type RelationshipEntry,
} from "@/lib/rpg-data"
import {
  Users,
  UserPlus,
  PawPrint,
  Skull,
  MapPin,
  Heart,
  Plus,
  Trash2,
  Upload,
  User,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react"

interface StepRelationshipsProps {
  sheet: CharacterSheet
  onUpdate: (updates: Partial<CharacterSheet>) => void
  onNext: () => void
  onBack: () => void
}

const PLACEHOLDER_IMAGES: Record<string, string> = {
  family: "/images/characters/char-05.jpg",
  friends: "/images/characters/char-01.jpg",
  mascot: "/images/characters/char-11.jpg",
  enemy: "/images/characters/char-09.jpg",
  city: "/images/characters/char-03.jpg",
  passion: "/images/characters/char-12.jpg",
}

function ImageUploadButton({
  image,
  onUpload,
  placeholderSrc,
  label,
  size = "md",
}: {
  image: string
  onUpload: (dataUrl: string) => void
  placeholderSrc: string
  label: string
  size?: "sm" | "md"
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onUpload(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const dim = size === "sm" ? "w-16 h-16" : "w-20 h-20"

  return (
    <>
      <motion.button
        type="button"
        onClick={() => fileRef.current?.click()}
        className={`relative ${dim} rounded-xl border-2 border-dashed border-border bg-secondary/40 flex items-center justify-center overflow-hidden hover:border-primary/50 transition-all cursor-pointer group shrink-0`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {image ? (
          <>
            <Image src={image} alt={label} fill className="object-cover" />
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="w-4 h-4 text-foreground" />
            </div>
          </>
        ) : (
          <div className="relative w-full h-full">
            <Image src={placeholderSrc} alt="" fill className="object-cover opacity-20" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
              <User className="w-5 h-5" />
              <span className="text-[8px] uppercase tracking-wider font-serif mt-0.5">Foto</span>
            </div>
          </div>
        )}
      </motion.button>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
    </>
  )
}

function FamilyMemberCard({
  member,
  index,
  onUpdate,
  onRemove,
}: {
  member: FamilyMember
  index: number
  onUpdate: (index: number, updates: Partial<FamilyMember>) => void
  onRemove: (index: number) => void
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <motion.div
      className="rounded-xl border border-border bg-card/60 overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      layout
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary/30">
        <div className="flex items-center gap-2">
          <span className="text-xs font-serif text-primary tracking-wider uppercase">
            {member.relationship || "Familiar"}
          </span>
          {member.isUnknown && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-serif">
              Desconhecido
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-md hover:bg-secondary transition-colors cursor-pointer text-muted-foreground"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1 rounded-md hover:bg-destructive/10 transition-colors cursor-pointer text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="px-4 py-3 flex flex-col gap-3"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="flex gap-3">
              <ImageUploadButton
                image={member.image}
                onUpload={(img) => onUpdate(index, { image: img })}
                placeholderSrc={PLACEHOLDER_IMAGES.family}
                label={member.name || "Familiar"}
                size="sm"
              />
              <div className="flex-1 flex flex-col gap-2">
                {/* Unknown toggle */}
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={member.isUnknown}
                    onChange={(e) => onUpdate(index, { isUnknown: e.target.checked })}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      member.isUnknown
                        ? "bg-primary/20 border-primary/60"
                        : "border-border bg-secondary/40"
                    }`}
                  >
                    {member.isUnknown && <HelpCircle className="w-3 h-3 text-primary" />}
                  </div>
                  <span className="text-xs text-muted-foreground font-serif group-hover:text-foreground transition-colors">
                    Identidade desconhecida
                  </span>
                </label>

                {/* Relationship select */}
                <select
                  value={member.relationship}
                  onChange={(e) => onUpdate(index, { relationship: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-secondary/60 border border-border text-foreground font-serif text-sm focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
                >
                  <option value="">Tipo de familiar...</option>
                  {FAMILY_RELATIONSHIPS.map((rel) => (
                    <option key={rel} value={rel}>
                      {rel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!member.isUnknown ? (
              <>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => onUpdate(index, { name: e.target.value })}
                  placeholder="Nome do familiar..."
                  className="px-3 py-2 rounded-lg bg-secondary/60 border border-border text-foreground font-serif text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
                  maxLength={40}
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={member.age}
                    onChange={(e) => onUpdate(index, { age: e.target.value })}
                    placeholder="Idade"
                    className="w-20 px-3 py-2 rounded-lg bg-secondary/60 border border-border text-foreground font-serif text-sm text-center placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
                  />
                  <input
                    type="text"
                    value={member.description}
                    onChange={(e) => onUpdate(index, { description: e.target.value })}
                    placeholder="Breve descricao..."
                    className="flex-1 px-3 py-2 rounded-lg bg-secondary/60 border border-border text-foreground font-serif text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-3 rounded-lg bg-primary/5 border border-primary/10">
                <HelpCircle className="w-4 h-4 text-primary/50 shrink-0" />
                <span className="text-xs text-muted-foreground font-serif italic">
                  Os detalhes deste familiar sao um misterio...
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function RelationshipCard({
  entry,
  onUpdate,
  onRemove,
  placeholderImg,
  label,
}: {
  entry: RelationshipEntry
  onUpdate: (updates: Partial<RelationshipEntry>) => void
  onRemove: () => void
  placeholderImg: string
  label: string
}) {
  return (
    <motion.div
      className="flex gap-3 items-start p-3 rounded-xl border border-border bg-card/60"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <ImageUploadButton
        image={entry.image}
        onUpload={(img) => onUpdate({ image: img })}
        placeholderSrc={placeholderImg}
        label={label}
        size="sm"
      />
      <div className="flex-1 flex flex-col gap-2">
        <input
          type="text"
          value={entry.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Nome..."
          className="px-3 py-2 rounded-lg bg-secondary/60 border border-border text-foreground font-serif text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
          maxLength={40}
        />
        <input
          type="text"
          value={entry.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Breve descricao..."
          className="px-3 py-2 rounded-lg bg-secondary/60 border border-border text-foreground font-serif text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-1 rounded-md hover:bg-destructive/10 transition-colors cursor-pointer text-muted-foreground hover:text-destructive shrink-0 mt-1"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

interface SectionToggle {
  family: boolean
  friends: boolean
  mascot: boolean
  enemy: boolean
  city: boolean
  passion: boolean
}

export function StepRelationships({ sheet, onUpdate, onNext, onBack }: StepRelationshipsProps) {
  const [sections, setSections] = useState<SectionToggle>({
    family: sheet.family.length > 0,
    friends: sheet.friends.length > 0,
    mascot: sheet.mascot !== null,
    enemy: sheet.mortalEnemy !== null,
    city: sheet.city !== "",
    passion: sheet.passion !== "",
  })

  const toggleSection = (key: keyof SectionToggle) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }))
    if (key === "mascot" && !sections.mascot) {
      onUpdate({ mascot: { name: "", description: "", image: "" } })
    }
    if (key === "enemy" && !sections.enemy) {
      onUpdate({ mortalEnemy: { name: "", description: "", image: "" } })
    }
    if (key === "mascot" && sections.mascot) {
      onUpdate({ mascot: null })
    }
    if (key === "enemy" && sections.enemy) {
      onUpdate({ mortalEnemy: null })
    }
    if (key === "city" && sections.city) {
      onUpdate({ city: "" })
    }
    if (key === "passion" && sections.passion) {
      onUpdate({ passion: "" })
    }
  }

  const addFamilyMember = () => {
    onUpdate({
      family: [
        ...sheet.family,
        { relationship: "", name: "", age: "", description: "", image: "", isUnknown: false },
      ],
    })
  }

  const updateFamilyMember = (index: number, updates: Partial<FamilyMember>) => {
    const updated = [...sheet.family]
    updated[index] = { ...updated[index], ...updates }
    onUpdate({ family: updated })
  }

  const removeFamilyMember = (index: number) => {
    onUpdate({ family: sheet.family.filter((_, i) => i !== index) })
  }

  const addFriend = () => {
    onUpdate({
      friends: [...sheet.friends, { name: "", description: "", image: "" }],
    })
  }

  const updateFriend = (index: number, updates: Partial<RelationshipEntry>) => {
    const updated = [...sheet.friends]
    updated[index] = { ...updated[index], ...updates }
    onUpdate({ friends: updated })
  }

  const removeFriend = (index: number) => {
    onUpdate({ friends: sheet.friends.filter((_, i) => i !== index) })
  }

  const OPTIONAL_SECTIONS = [
    { key: "family" as const, icon: Users, label: "Familia", desc: "Adicione membros da familia do seu personagem" },
    { key: "friends" as const, icon: UserPlus, label: "Amigos", desc: "Amigos e aliados importantes" },
    { key: "mascot" as const, icon: PawPrint, label: "Mascote", desc: "Um companheiro animal ou criatura" },
    { key: "enemy" as const, icon: Skull, label: "Inimigo Mortal", desc: "O maior adversario do seu personagem" },
    { key: "city" as const, icon: MapPin, label: "Cidade", desc: "Cidade natal ou residencia atual" },
    { key: "passion" as const, icon: Heart, label: "Paixao", desc: "O grande amor ou paixao do personagem" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-wider mb-2">
          Relacionamentos
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Adicione detalhes opcionais sobre a vida do seu personagem. Clique para ativar cada secao.
        </p>
      </div>

      <div className="max-w-lg mx-auto w-full flex flex-col gap-4">
        {/* Section toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {OPTIONAL_SECTIONS.map((section) => (
            <motion.button
              key={section.key}
              type="button"
              onClick={() => toggleSection(section.key)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${
                sections[section.key]
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-border bg-card/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <section.icon className="w-5 h-5" />
              <span className="text-xs font-serif tracking-wider uppercase">{section.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Activated sections */}
        <AnimatePresence>
          {/* FAMILY */}
          {sections.family && (
            <motion.div
              key="family"
              className="flex flex-col gap-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-serif text-foreground tracking-wider">Familia</span>
                </div>
                <motion.button
                  type="button"
                  onClick={addFamilyMember}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 text-primary text-xs font-serif tracking-wider hover:bg-primary/10 transition-all cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Plus className="w-3 h-3" />
                  Adicionar
                </motion.button>
              </div>

              {sheet.family.length === 0 && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border bg-card/30">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden opacity-30 shrink-0">
                    <Image src={PLACEHOLDER_IMAGES.family} alt="" fill className="object-cover" />
                  </div>
                  <p className="text-xs text-muted-foreground font-serif italic">
                    Nenhum familiar adicionado. Clique em {'\"'}Adicionar{'\"'} para criar.
                  </p>
                </div>
              )}

              <AnimatePresence>
                {sheet.family.map((member, i) => (
                  <FamilyMemberCard
                    key={`family-${i}`}
                    member={member}
                    index={i}
                    onUpdate={updateFamilyMember}
                    onRemove={removeFamilyMember}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* FRIENDS */}
          {sections.friends && (
            <motion.div
              key="friends"
              className="flex flex-col gap-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-primary" />
                  <span className="text-sm font-serif text-foreground tracking-wider">Amigos</span>
                </div>
                <motion.button
                  type="button"
                  onClick={addFriend}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 text-primary text-xs font-serif tracking-wider hover:bg-primary/10 transition-all cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Plus className="w-3 h-3" />
                  Adicionar
                </motion.button>
              </div>

              {sheet.friends.length === 0 && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border bg-card/30">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden opacity-30 shrink-0">
                    <Image src={PLACEHOLDER_IMAGES.friends} alt="" fill className="object-cover" />
                  </div>
                  <p className="text-xs text-muted-foreground font-serif italic">
                    Nenhum amigo adicionado ainda.
                  </p>
                </div>
              )}

              <AnimatePresence>
                {sheet.friends.map((friend, i) => (
                  <RelationshipCard
                    key={`friend-${i}`}
                    entry={friend}
                    onUpdate={(updates) => updateFriend(i, updates)}
                    onRemove={() => removeFriend(i)}
                    placeholderImg={PLACEHOLDER_IMAGES.friends}
                    label="Amigo"
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* MASCOT */}
          {sections.mascot && sheet.mascot && (
            <motion.div
              key="mascot"
              className="flex flex-col gap-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center gap-2">
                <PawPrint className="w-4 h-4 text-primary" />
                <span className="text-sm font-serif text-foreground tracking-wider">Mascote</span>
              </div>
              <div className="flex gap-3 items-start p-3 rounded-xl border border-border bg-card/60">
                <ImageUploadButton
                  image={sheet.mascot.image}
                  onUpload={(img) => onUpdate({ mascot: { ...sheet.mascot!, image: img } })}
                  placeholderSrc={PLACEHOLDER_IMAGES.mascot}
                  label="Mascote"
                  size="sm"
                />
                <div className="flex-1 flex flex-col gap-2">
                  <input
                    type="text"
                    value={sheet.mascot.name}
                    onChange={(e) => onUpdate({ mascot: { ...sheet.mascot!, name: e.target.value } })}
                    placeholder="Nome do mascote..."
                    className="px-3 py-2 rounded-lg bg-secondary/60 border border-border text-foreground font-serif text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
                    maxLength={40}
                  />
                  <input
                    type="text"
                    value={sheet.mascot.description}
                    onChange={(e) => onUpdate({ mascot: { ...sheet.mascot!, description: e.target.value } })}
                    placeholder="Tipo de criatura, aparencia..."
                    className="px-3 py-2 rounded-lg bg-secondary/60 border border-border text-foreground font-serif text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* MORTAL ENEMY */}
          {sections.enemy && sheet.mortalEnemy && (
            <motion.div
              key="enemy"
              className="flex flex-col gap-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center gap-2">
                <Skull className="w-4 h-4 text-primary" />
                <span className="text-sm font-serif text-foreground tracking-wider">Inimigo Mortal</span>
              </div>
              <div className="flex gap-3 items-start p-3 rounded-xl border border-border bg-card/60">
                <ImageUploadButton
                  image={sheet.mortalEnemy.image}
                  onUpload={(img) => onUpdate({ mortalEnemy: { ...sheet.mortalEnemy!, image: img } })}
                  placeholderSrc={PLACEHOLDER_IMAGES.enemy}
                  label="Inimigo"
                  size="sm"
                />
                <div className="flex-1 flex flex-col gap-2">
                  <input
                    type="text"
                    value={sheet.mortalEnemy.name}
                    onChange={(e) => onUpdate({ mortalEnemy: { ...sheet.mortalEnemy!, name: e.target.value } })}
                    placeholder="Nome do inimigo..."
                    className="px-3 py-2 rounded-lg bg-secondary/60 border border-border text-foreground font-serif text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
                    maxLength={40}
                  />
                  <input
                    type="text"
                    value={sheet.mortalEnemy.description}
                    onChange={(e) => onUpdate({ mortalEnemy: { ...sheet.mortalEnemy!, description: e.target.value } })}
                    placeholder="Motivo da rivalidade..."
                    className="px-3 py-2 rounded-lg bg-secondary/60 border border-border text-foreground font-serif text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* CITY */}
          {sections.city && (
            <motion.div
              key="city"
              className="flex flex-col gap-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-serif text-foreground tracking-wider">Cidade</span>
              </div>
              <div className="flex gap-3 items-center p-3 rounded-xl border border-border bg-card/60">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden opacity-40 shrink-0">
                  <Image src={PLACEHOLDER_IMAGES.city} alt="" fill className="object-cover" />
                </div>
                <input
                  type="text"
                  value={sheet.city}
                  onChange={(e) => onUpdate({ city: e.target.value })}
                  placeholder="Nome da cidade natal ou residencia..."
                  className="flex-1 px-3 py-2 rounded-lg bg-secondary/60 border border-border text-foreground font-serif text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
                  maxLength={60}
                />
              </div>
            </motion.div>
          )}

          {/* PASSION */}
          {sections.passion && (
            <motion.div
              key="passion"
              className="flex flex-col gap-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-sm font-serif text-foreground tracking-wider">Paixao</span>
              </div>
              <div className="flex gap-3 items-center p-3 rounded-xl border border-border bg-card/60">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden opacity-40 shrink-0">
                  <Image src={PLACEHOLDER_IMAGES.passion} alt="" fill className="object-cover" />
                </div>
                <input
                  type="text"
                  value={sheet.passion}
                  onChange={(e) => onUpdate({ passion: e.target.value })}
                  placeholder="Nome ou descricao da paixao..."
                  className="flex-1 px-3 py-2 rounded-lg bg-secondary/60 border border-border text-foreground font-serif text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
                  maxLength={60}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
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
          className="px-8 py-3 rounded-lg border border-primary/50 bg-primary/20 text-foreground font-serif text-sm tracking-widest uppercase hover:bg-primary/30 hover:border-primary transition-all duration-300 cursor-pointer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Proximo
        </motion.button>
      </div>
    </div>
  )
}
