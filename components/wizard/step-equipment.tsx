"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  type CharacterSheet,
  type Armor,
  type Weapon,
  type Tool,
  type Money,
  armors,
  tools,
  languages,
  getAvailableArmors,
  getAvailableWeapons,
  getCarryCapacity,
  getCarryCategory,
  calculateEquipmentWeight,
} from "@/lib/rpg-data"
import { Plus, X, Package, ChevronDown, Shield, Weight, Coins, AlertTriangle, Sword, Wrench, Languages } from "lucide-react"

interface StepEquipmentProps {
  sheet: CharacterSheet
  onUpdate: (updates: Partial<CharacterSheet>) => void
  onNext: () => void
  onBack: () => void
}

export function StepEquipment({ sheet, onUpdate, onNext, onBack }: StepEquipmentProps) {
  const [newItem, setNewItem] = useState("")
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<"equipamento" | "armas" | "armadura" | "ferramentas" | "idiomas" | "dinheiro">("equipamento")

  const equipmentOptions = sheet.class?.equipmentOptions || []
  const className = sheet.class?.name || ""
  const availableArmors = useMemo(() => getAvailableArmors(className), [className])
  const shieldAvailable = availableArmors.some(a => a.isShield)
  const armorOptions = availableArmors.filter(a => !a.isShield)
  const shieldOption = armors.find(a => a.isShield)
  const availableWeapons = useMemo(() => getAvailableWeapons(className), [className])
  const hasMartial = availableWeapons.some(w => w.category.startsWith("Marcial"))

  // Carry weight calculations
  const strScore = sheet.attributes["Força"] || 10
  const currentWeight = calculateEquipmentWeight(sheet)
  const carryCapacity = getCarryCapacity(strScore)
  const carryCategory = getCarryCategory(currentWeight, strScore)

  const carryColors: Record<string, string> = {
    "Leve": "text-green-400",
    "Media": "text-yellow-400",
    "Pesada": "text-orange-400",
    "Imobilizado": "text-destructive",
  }

  const carryBarColor: Record<string, string> = {
    "Leve": "bg-green-500",
    "Media": "bg-yellow-500",
    "Pesada": "bg-orange-500",
    "Imobilizado": "bg-destructive",
  }

  // Build equipment list from selections + custom items
  useEffect(() => {
    const selectedItems = Object.values(selections).filter(Boolean)
    const customItems = sheet.equipment.filter(
      (item) => !Object.values(selections).includes(item) && !equipmentOptions.some(opt => opt.choices.includes(item))
    )
    const combined = [...selectedItems, ...customItems]
    const currentStr = JSON.stringify(sheet.equipment)
    const newStr = JSON.stringify(combined)
    if (currentStr !== newStr) {
      onUpdate({ equipment: combined })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections])

  const handleSelect = (label: string, value: string) => {
    setSelections((prev) => ({ ...prev, [label]: value }))
  }

  const handleAdd = () => {
    if (newItem.trim()) {
      onUpdate({ equipment: [...sheet.equipment, newItem.trim()] })
      setNewItem("")
    }
  }

  const handleRemoveCustom = (index: number) => {
    const selectedCount = Object.values(selections).filter(Boolean).length
    const customIndex = index - selectedCount
    if (customIndex >= 0) {
      const customItems = sheet.equipment.slice(selectedCount)
      customItems.splice(customIndex, 1)
      onUpdate({ equipment: [...Object.values(selections).filter(Boolean), ...customItems] })
    }
  }

  const handleArmorSelect = (armor: Armor) => {
    if (armor.isShield) {
      onUpdate({ equippedShield: sheet.equippedShield?.name === armor.name ? null : armor })
    } else {
      onUpdate({ equippedArmor: sheet.equippedArmor?.name === armor.name ? null : armor })
    }
  }

  const handleWeaponToggle = (weapon: Weapon) => {
    const current = sheet.equippedWeapons || []
    const exists = current.some(w => w.name === weapon.name)
    if (exists) {
      onUpdate({ equippedWeapons: current.filter(w => w.name !== weapon.name) })
    } else {
      onUpdate({ equippedWeapons: [...current, weapon] })
    }
  }

  const handleToolToggle = (tool: Tool) => {
    const current = sheet.selectedTools || []
    const exists = current.some(t => t.name === tool.name)
    if (exists) {
      onUpdate({ selectedTools: current.filter(t => t.name !== tool.name) })
    } else {
      onUpdate({ selectedTools: [...current, tool] })
    }
  }

  const handleLanguageToggle = (langName: string) => {
    const current = sheet.selectedLanguages || []
    if (current.includes(langName)) {
      onUpdate({ selectedLanguages: current.filter(l => l !== langName) })
    } else {
      onUpdate({ selectedLanguages: [...current, langName] })
    }
  }

  // Idiomas que vem da raca (ja garantidos)
  const raceLanguages = sheet.race?.languages || []

  const handleMoneyChange = (type: keyof Money, value: number) => {
    onUpdate({
      money: { ...sheet.money, [type]: Math.max(0, value) },
    })
  }

  const tabs = [
    { key: "equipamento" as const, label: "Itens", icon: Package },
    { key: "armas" as const, label: "Armas", icon: Sword },
    { key: "armadura" as const, label: "Armadura", icon: Shield },
    { key: "ferramentas" as const, label: "Ferramentas", icon: Wrench },
    { key: "idiomas" as const, label: "Idiomas", icon: Languages },
    { key: "dinheiro" as const, label: "Dinheiro", icon: Coins },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground tracking-wider mb-2">
          Equipamentos
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Escolha equipamentos, armadura e configure seu dinheiro inicial.
        </p>
      </div>

      {/* Carry Weight Bar */}
      <div className="max-w-lg mx-auto w-full">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Weight className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-serif tracking-wider text-muted-foreground">Carga</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${carryColors[carryCategory]}`}>
                {carryCategory}
              </span>
              <span className="text-xs text-muted-foreground">
                {currentWeight} / {carryCapacity.max} kg
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className={`absolute left-0 top-0 h-full rounded-full ${carryBarColor[carryCategory]}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (currentWeight / carryCapacity.max) * 100)}%` }}
              transition={{ duration: 0.4 }}
            />
            {/* Markers */}
            <div
              className="absolute top-0 h-full w-px bg-yellow-400/50"
              style={{ left: `${(carryCapacity.light / carryCapacity.max) * 100}%` }}
            />
            <div
              className="absolute top-0 h-full w-px bg-orange-400/50"
              style={{ left: `${(carryCapacity.medium / carryCapacity.max) * 100}%` }}
            />
          </div>

          <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
            <span>0 kg</span>
            <span>{carryCapacity.light} kg (leve)</span>
            <span>{carryCapacity.medium} kg (média)</span>
            <span>{carryCapacity.max} kg</span>
          </div>

          {carryCategory === "Imobilizado" && (
            <div className="flex items-center gap-2 mt-2 p-2 rounded bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
              <span className="text-[10px] text-destructive">
                Carga excessiva! Você não consegue se mover.
              </span>
            </div>
          )}
          {carryCategory === "Pesada" && (
            <div className="flex items-center gap-2 mt-2 p-2 rounded bg-orange-500/10 border border-orange-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="text-[10px] text-orange-400">
                Carga pesada: velocidade reduzida em 3 metros, desvantagem em testes de Força, Destreza e Constituição.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-lg mx-auto w-full flex items-center gap-1 p-1 rounded-lg bg-secondary/40 border border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-serif tracking-wider transition-all cursor-pointer ${
              activeTab === tab.key
                ? "bg-primary/15 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-lg mx-auto w-full flex flex-col gap-4">
        {/* Equipment Tab */}
        {activeTab === "equipamento" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            {equipmentOptions.length > 0 && (
              <div className="flex flex-col gap-3">
                <h4 className="text-xs uppercase tracking-wider text-primary font-serif flex items-center gap-2">
                  <Package className="w-3.5 h-3.5" />
                  Equipamento Inicial - {sheet.class?.name}
                </h4>
                {equipmentOptions.map((option, index) => (
                  <motion.div
                    key={option.label}
                    className="flex flex-col gap-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <label className="text-xs font-serif tracking-wider text-muted-foreground">
                      {option.label}
                    </label>
                    <div className="relative">
                      <select
                        value={selections[option.label] || ""}
                        onChange={(e) => handleSelect(option.label, e.target.value)}
                        aria-label={option.label}
                        className="w-full appearance-none px-4 py-3 rounded-lg bg-secondary/60 border border-border text-foreground text-sm font-serif focus:outline-none focus:border-primary/50 transition-all cursor-pointer pr-10"
                      >
                        <option value="">Selecionar {option.label.toLowerCase()}...</option>
                        {option.choices.map((choice) => (
                          <option key={choice} value={choice}>
                            {choice}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-serif">Itens adicionais</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {sheet.equipment.length > 0 && (
              <div className="flex flex-col gap-2">
                {sheet.equipment.map((item, index) => {
                  const isFromSelection = Object.values(selections).includes(item)
                  return (
                    <motion.div
                      key={`${item}-${index}`}
                      className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-card border border-border"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-4 h-4 text-primary/60" />
                        <span className="text-foreground text-sm font-serif">{item}</span>
                      </div>
                      {!isFromSelection && (
                        <button
                          onClick={() => handleRemoveCustom(index)}
                          aria-label={`Remover ${item}`}
                          title={`Remover ${item}`}
                          className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Adicionar equipamento personalizado..."
                className="flex-1 px-4 py-3 rounded-lg bg-secondary/60 border border-border text-foreground text-sm font-serif placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
              />
              <button
                onClick={handleAdd}
                disabled={!newItem.trim()}
                aria-label="Adicionar item personalizado"
                title="Adicionar item personalizado"
                className="px-4 py-3 rounded-lg bg-primary/10 border border-primary/30 text-foreground hover:bg-primary/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Weapons Tab */}
        {activeTab === "armas" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            {/* Equipped weapons summary */}
            {(sheet.equippedWeapons || []).length > 0 && (
              <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
                <h4 className="text-[10px] uppercase tracking-wider text-primary font-serif mb-2">
                  Armas Equipadas ({(sheet.equippedWeapons || []).length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(sheet.equippedWeapons || []).map((w) => (
                    <button
                      key={w.name}
                      onClick={() => handleWeaponToggle(w)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs text-foreground font-serif cursor-pointer hover:bg-destructive/10 hover:border-destructive/30 transition-all group"
                    >
                      <Sword className="w-3 h-3 text-primary group-hover:text-destructive" />
                      {w.name}
                      <X className="w-3 h-3 text-muted-foreground group-hover:text-destructive" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Weapon categories */}
            {(["Simples Corpo-a-Corpo", "Simples a Distancia", "Marcial Corpo-a-Corpo", "Marcial a Distancia"] as const).map((category) => {
              const catWeapons = availableWeapons.filter(w => w.category === category)
              if (catWeapons.length === 0) return null

              const isMartial = category.startsWith("Marcial")

              return (
                <div key={category}>
                  <h4 className={`text-xs uppercase tracking-wider font-serif mb-2 ${isMartial ? "text-yellow-400" : "text-primary"}`}>
                    {category}
                    {isMartial && <span className="text-[9px] text-muted-foreground ml-2 normal-case">(Proficiente)</span>}
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    {catWeapons.map((weapon) => {
                      const isEquipped = (sheet.equippedWeapons || []).some(w => w.name === weapon.name)
                      return (
                        <button
                          key={weapon.name}
                          onClick={() => handleWeaponToggle(weapon)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                            isEquipped
                              ? "border-primary/50 bg-primary/10 ring-1 ring-primary/20"
                              : "border-border bg-card hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Sword className={`w-4 h-4 ${isEquipped ? "text-primary" : "text-muted-foreground/40"}`} />
                            <div>
                              <span className="text-sm font-serif text-foreground block">{weapon.name}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {weapon.price} | {weapon.weight} kg
                                {weapon.properties !== "-" && ` | ${weapon.properties}`}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-serif font-bold text-foreground block">
                              {weapon.damage}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}

        {/* Armor Tab */}
        {activeTab === "armadura" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            {availableArmors.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm font-serif">
                  {className || "Nenhuma classe selecionada"} nao possui proficiencia em armaduras.
                </p>
              </div>
            ) : (
              <>
                {/* Current AC display */}
                <div className="flex items-center justify-center gap-4 p-3 rounded-lg border border-border bg-card">
                  <div className="text-center">
                    <Shield className="w-5 h-5 text-primary mx-auto mb-1" />
                    <span className="text-2xl font-serif font-bold text-foreground">
                      {10 + Math.floor((sheet.attributes["Destreza"] - 10) / 2)}
                    </span>
                    <span className="block text-[9px] text-muted-foreground">CA Atual</span>
                  </div>
                  {sheet.equippedArmor && (
                    <div className="text-center px-3 border-l border-border">
                      <span className="text-xs text-primary font-serif block">{sheet.equippedArmor.name}</span>
                      <span className="text-[10px] text-muted-foreground">{sheet.equippedArmor.category} - {sheet.equippedArmor.weight} kg</span>
                    </div>
                  )}
                  {sheet.equippedShield && (
                    <div className="text-center px-3 border-l border-border">
                      <span className="text-xs text-primary font-serif block">Escudo</span>
                      <span className="text-[10px] text-muted-foreground">+2 CA - {sheet.equippedShield.weight} kg</span>
                    </div>
                  )}
                </div>

                {/* Armor categories */}
                {(["Leve", "Media", "Pesada"] as const).map((category) => {
                  const categoryArmors = armorOptions.filter(a => a.category === category)
                  if (categoryArmors.length === 0) return null

                  return (
                    <div key={category}>
                      <h4 className="text-xs uppercase tracking-wider text-primary font-serif mb-2">
                        Armadura {category}
                      </h4>
                      <div className="flex flex-col gap-1.5">
                        {categoryArmors.map((armor) => {
                          const isEquipped = sheet.equippedArmor?.name === armor.name
                          return (
                            <button
                              key={armor.name}
                              onClick={() => handleArmorSelect(armor)}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                                isEquipped
                                  ? "border-primary/50 bg-primary/10 ring-1 ring-primary/20"
                                  : "border-border bg-card hover:border-primary/30"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Shield className={`w-4 h-4 ${isEquipped ? "text-primary" : "text-muted-foreground/40"}`} />
                                <div>
                                  <span className="text-sm font-serif text-foreground block">{armor.name}</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {armor.price} | {armor.weight} kg
                                    {armor.strengthReq && ` | For ${armor.strengthReq}`}
                                    {armor.stealthDisadvantage && " | Desv. Furtividade"}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-serif font-bold text-foreground block">
                                  CA {armor.acBase}{armor.addDex ? (armor.maxDex !== null ? ` + Des (max ${armor.maxDex})` : " + Des") : ""}
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                {/* Shield */}
                {shieldAvailable && shieldOption && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-primary font-serif mb-2">
                      Escudo
                    </h4>
                    <button
                      onClick={() => handleArmorSelect(shieldOption)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        sheet.equippedShield
                          ? "border-primary/50 bg-primary/10 ring-1 ring-primary/20"
                          : "border-border bg-card hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Shield className={`w-4 h-4 ${sheet.equippedShield ? "text-primary" : "text-muted-foreground/40"}`} />
                        <div>
                          <span className="text-sm font-serif text-foreground block">Escudo</span>
                          <span className="text-[10px] text-muted-foreground">
                            {shieldOption.price} | {shieldOption.weight} kg
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-serif font-bold text-foreground">+2 CA</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* Tools Tab */}
        {activeTab === "ferramentas" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            {/* Selected tools summary */}
            {(sheet.selectedTools || []).length > 0 && (
              <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
                <h4 className="text-[10px] uppercase tracking-wider text-primary font-serif mb-2">
                  Ferramentas Selecionadas ({(sheet.selectedTools || []).length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(sheet.selectedTools || []).map((t) => (
                    <button
                      key={t.name}
                      onClick={() => handleToolToggle(t)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs text-foreground font-serif cursor-pointer hover:bg-destructive/10 hover:border-destructive/30 transition-all group"
                    >
                      <Wrench className="w-3 h-3 text-primary group-hover:text-destructive" />
                      {t.name}
                      <X className="w-3 h-3 text-muted-foreground group-hover:text-destructive" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(["Ferramentas de Artesao", "Instrumento Musical", "Kit", "Kit de Jogo"] as const).map((category) => {
              const catTools = tools.filter(t => t.category === category)
              if (catTools.length === 0) return null

              return (
                <div key={category}>
                  <h4 className="text-xs uppercase tracking-wider text-primary font-serif mb-2">
                    {category === "Ferramentas de Artesao" ? "Ferramentas de Artesao" :
                     category === "Instrumento Musical" ? "Instrumentos Musicais" :
                     category === "Kit" ? "Kits" : "Kits de Jogo"}
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    {catTools.map((tool) => {
                      const isSelected = (sheet.selectedTools || []).some(t => t.name === tool.name)
                      return (
                        <button
                          key={tool.name}
                          onClick={() => handleToolToggle(tool)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary/50 bg-primary/10 ring-1 ring-primary/20"
                              : "border-border bg-card hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Wrench className={`w-3.5 h-3.5 ${isSelected ? "text-primary" : "text-muted-foreground/40"}`} />
                            <span className="text-sm font-serif text-foreground">{tool.name}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {tool.price} | {tool.weight > 0 ? `${tool.weight} kg` : "-"}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}

        {/* Languages Tab */}
        {activeTab === "idiomas" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            <div className="text-center mb-2">
              <Languages className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-serif">
                Idiomas da raca ja estao incluidos. Escolha idiomas extras.
              </p>
            </div>

            {/* Race languages */}
            {raceLanguages.length > 0 && (
              <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
                <h4 className="text-[10px] uppercase tracking-wider text-primary font-serif mb-2">
                  Idiomas da Raca ({sheet.race?.name})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {raceLanguages.map((lang) => (
                    <span key={lang} className="px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs text-foreground font-serif">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Standard Languages */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-primary font-serif mb-2">
                Idiomas Padrao
              </h4>
              <div className="flex flex-col gap-1.5">
                {languages.filter(l => !l.exotic).map((lang) => {
                  const fromRace = raceLanguages.includes(lang.name)
                  const isSelected = (sheet.selectedLanguages || []).includes(lang.name)
                  return (
                    <button
                      key={lang.name}
                      onClick={() => !fromRace && handleLanguageToggle(lang.name)}
                      disabled={fromRace}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all ${
                        fromRace
                          ? "border-primary/30 bg-primary/5 opacity-60 cursor-not-allowed"
                          : isSelected
                          ? "border-primary/50 bg-primary/10 ring-1 ring-primary/20 cursor-pointer"
                          : "border-border bg-card hover:border-primary/30 cursor-pointer"
                      }`}
                    >
                      <div>
                        <span className="text-sm font-serif text-foreground block">{lang.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          Falado por {lang.speakers} | Alfabeto: {lang.script}
                        </span>
                      </div>
                      {fromRace && <span className="text-[9px] text-primary font-serif">RACA</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Exotic Languages */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-yellow-400 font-serif mb-2">
                Idiomas Exoticos
              </h4>
              <div className="flex flex-col gap-1.5">
                {languages.filter(l => l.exotic).map((lang) => {
                  const fromRace = raceLanguages.includes(lang.name)
                  const isSelected = (sheet.selectedLanguages || []).includes(lang.name)
                  return (
                    <button
                      key={lang.name}
                      onClick={() => !fromRace && handleLanguageToggle(lang.name)}
                      disabled={fromRace}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all ${
                        fromRace
                          ? "border-yellow-500/30 bg-yellow-500/5 opacity-60 cursor-not-allowed"
                          : isSelected
                          ? "border-yellow-500/50 bg-yellow-500/10 ring-1 ring-yellow-500/20 cursor-pointer"
                          : "border-border bg-card hover:border-yellow-500/30 cursor-pointer"
                      }`}
                    >
                      <div>
                        <span className="text-sm font-serif text-foreground block">{lang.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          Falado por {lang.speakers} | Alfabeto: {lang.script}
                        </span>
                      </div>
                      {fromRace && <span className="text-[9px] text-yellow-400 font-serif">RACA</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Money Tab */}
        {activeTab === "dinheiro" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
            <div className="text-center mb-2">
              <Coins className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground font-serif">
                Configure as moedas iniciais do seu personagem.
              </p>
            </div>

            {([
              { key: "PC" as const, label: "Pecas de Cobre", shortLabel: "PC", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
              { key: "PP" as const, label: "Pecas de Prata", shortLabel: "PP", color: "text-gray-300", bg: "bg-gray-400/10 border-gray-400/20" },
              { key: "PE" as const, label: "Pecas de Electro", shortLabel: "PE", color: "text-indigo-300", bg: "bg-indigo-400/10 border-indigo-400/20" },
              { key: "PO" as const, label: "Pecas de Ouro", shortLabel: "PO", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
              { key: "PL" as const, label: "Pecas de Platina", shortLabel: "PL", color: "text-blue-300", bg: "bg-blue-400/10 border-blue-400/20" },
            ]).map((coin) => (
              <div
                key={coin.key}
                className={`flex items-center justify-between px-4 py-3 rounded-lg border ${coin.bg}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-serif font-bold ${coin.color}`}>{coin.shortLabel}</span>
                  <span className="text-xs text-muted-foreground font-serif">{coin.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMoneyChange(coin.key, (sheet.money[coin.key] || 0) - 1)}
                    aria-label={`Diminuir ${coin.label}`}
                    title={`Diminuir ${coin.label}`}
                    className="w-7 h-7 rounded-md bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={sheet.money[coin.key] || 0}
                    onChange={(e) => handleMoneyChange(coin.key, parseInt(e.target.value) || 0)}
                    aria-label={coin.label}
                    className="w-16 text-center px-2 py-1.5 rounded-md bg-secondary/60 border border-border text-foreground text-sm font-serif focus:outline-none focus:border-primary/50"
                    min={0}
                  />
                  <button
                    onClick={() => handleMoneyChange(coin.key, (sheet.money[coin.key] || 0) + 1)}
                    aria-label={`Aumentar ${coin.label}`}
                    title={`Aumentar ${coin.label}`}
                    className="w-7 h-7 rounded-md bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            {/* Conversion info */}
            <div className="p-3 rounded-lg bg-secondary/30 border border-border">
              <h5 className="text-[10px] uppercase tracking-wider text-muted-foreground font-serif mb-2">
                Taxa de Cambio Padrao
              </h5>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] text-muted-foreground font-serif">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-1 pr-2 text-foreground">Moeda</th>
                      <th className="text-center py-1 px-1 text-orange-400">PC</th>
                      <th className="text-center py-1 px-1 text-gray-300">PP</th>
                      <th className="text-center py-1 px-1 text-indigo-300">PE</th>
                      <th className="text-center py-1 px-1 text-yellow-400">PO</th>
                      <th className="text-center py-1 px-1 text-blue-300">PL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50"><td className="py-1 pr-2 text-orange-400">Cobre (PC)</td><td className="text-center">1</td><td className="text-center">1/10</td><td className="text-center">1/50</td><td className="text-center">1/100</td><td className="text-center">1/1000</td></tr>
                    <tr className="border-b border-border/50"><td className="py-1 pr-2 text-gray-300">Prata (PP)</td><td className="text-center">10</td><td className="text-center">1</td><td className="text-center">1/5</td><td className="text-center">1/10</td><td className="text-center">1/100</td></tr>
                    <tr className="border-b border-border/50"><td className="py-1 pr-2 text-indigo-300">Electro (PE)</td><td className="text-center">50</td><td className="text-center">5</td><td className="text-center">1</td><td className="text-center">1/2</td><td className="text-center">1/20</td></tr>
                    <tr className="border-b border-border/50"><td className="py-1 pr-2 text-yellow-400">Ouro (PO)</td><td className="text-center">100</td><td className="text-center">10</td><td className="text-center">2</td><td className="text-center">1</td><td className="text-center">1/10</td></tr>
                    <tr><td className="py-1 pr-2 text-blue-300">Platina (PL)</td><td className="text-center">1000</td><td className="text-center">100</td><td className="text-center">20</td><td className="text-center">10</td><td className="text-center">1</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
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
          Proximo
        </motion.button>
      </div>
    </div>
  )
}
