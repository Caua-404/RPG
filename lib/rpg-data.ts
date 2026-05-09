export interface Race {
  name: string
  description: string
  bonuses: Record<string, number>
  traits: string[]
  speed: string
  size: string
  languages: string[]
  image: string
}

export interface CharacterClass {
  name: string
  description: string
  hitDie: string
  primaryAbility: string
  savingThrows: string[]
  proficiencies: string[]
  abilities: string[]
  equipmentOptions: EquipmentOption[]
  image: string
}

export interface EquipmentOption {
  label: string
  choices: string[]
}

export type ArmorCategory = "Leve" | "Media" | "Pesada" | "Escudo"

export interface Armor {
  name: string
  category: ArmorCategory
  price: string
  acBase: number
  addDex: boolean
  maxDex: number | null // null = sem limite
  strengthReq: number | null
  stealthDisadvantage: boolean
  weight: number // em kg
  isShield: boolean
}

export interface Money {
  PC: number // Pecas de Cobre
  PP: number // Pecas de Prata
  PE: number // Pecas de Electro
  PO: number // Pecas de Ouro
  PL: number // Pecas de Platina
}

export const armors: Armor[] = [
  // Armadura Leve
  { name: "Acolchoada", category: "Leve", price: "5 po", acBase: 11, addDex: true, maxDex: null, strengthReq: null, stealthDisadvantage: true, weight: 4, isShield: false },
  { name: "Couro", category: "Leve", price: "10 po", acBase: 11, addDex: true, maxDex: null, strengthReq: null, stealthDisadvantage: false, weight: 5, isShield: false },
  { name: "Couro Batido", category: "Leve", price: "45 po", acBase: 12, addDex: true, maxDex: null, strengthReq: null, stealthDisadvantage: false, weight: 6.5, isShield: false },
  // Armadura Media
  { name: "Gibao de Peles", category: "Media", price: "10 po", acBase: 12, addDex: true, maxDex: 2, strengthReq: null, stealthDisadvantage: false, weight: 6, isShield: false },
  { name: "Camisao de Malha", category: "Media", price: "30 po", acBase: 13, addDex: true, maxDex: 2, strengthReq: null, stealthDisadvantage: false, weight: 10, isShield: false },
  { name: "Brunea", category: "Media", price: "50 po", acBase: 14, addDex: true, maxDex: 2, strengthReq: null, stealthDisadvantage: true, weight: 22.5, isShield: false },
  { name: "Peitoral", category: "Media", price: "400 po", acBase: 14, addDex: true, maxDex: 2, strengthReq: null, stealthDisadvantage: false, weight: 10, isShield: false },
  { name: "Meia-Armadura", category: "Media", price: "750 po", acBase: 15, addDex: true, maxDex: 2, strengthReq: null, stealthDisadvantage: true, weight: 20, isShield: false },
  // Armadura Pesada
  { name: "Cota de Aneis", category: "Pesada", price: "30 po", acBase: 14, addDex: false, maxDex: null, strengthReq: null, stealthDisadvantage: true, weight: 20, isShield: false },
  { name: "Cota de Malha", category: "Pesada", price: "75 po", acBase: 16, addDex: false, maxDex: null, strengthReq: 13, stealthDisadvantage: true, weight: 27.5, isShield: false },
  { name: "Cota de Talas", category: "Pesada", price: "200 po", acBase: 17, addDex: false, maxDex: null, strengthReq: 15, stealthDisadvantage: true, weight: 30, isShield: false },
  { name: "Placas", category: "Pesada", price: "1.500 po", acBase: 18, addDex: false, maxDex: null, strengthReq: 15, stealthDisadvantage: true, weight: 32.5, isShield: false },
  // Escudo
  { name: "Escudo", category: "Escudo", price: "10 po", acBase: 2, addDex: false, maxDex: null, strengthReq: null, stealthDisadvantage: false, weight: 3, isShield: true },
]

// Proficiencias de armadura por classe
export const classArmorProficiencies: Record<string, ArmorCategory[]> = {
  "Barbaro": ["Leve", "Media", "Escudo"],
  "Bardo": ["Leve"],
  "Bruxo": ["Leve"],
  "Clerigo": ["Leve", "Media", "Escudo"],
  "Druida": ["Leve", "Media", "Escudo"],
  "Feiticeiro": [],
  "Guerreiro": ["Leve", "Media", "Pesada", "Escudo"],
  "Ladino": ["Leve"],
  "Mago": [],
  "Monge": [],
  "Paladino": ["Leve", "Media", "Pesada", "Escudo"],
  "Patrulheiro": ["Leve", "Media", "Escudo"],
}

export function getAvailableArmors(className: string): Armor[] {
  const profs = classArmorProficiencies[className] || []
  return armors.filter(a => profs.includes(a.category))
}

// Sistema de carga - D&D 5e: Forca x 15 = capacidade maxima em libras
// Convertendo para kg (1 lb = 0.45 kg aprox)
// Leve: ate 5x Forca kg, Media: ate 10x Forca kg, Pesada: acima de 10x Forca kg
export type CarryCategory = "Leve" | "Media" | "Pesada" | "Imobilizado"

export function getCarryCapacity(strengthScore: number): { light: number; medium: number; max: number } {
  // D&D 5e usa libras, convertendo para kg com proporcao adequada
  // Forca x 15 lbs max = Forca x 6.8 kg aprox
  // Simplificando: Forca x 7.5 kg = carga maxima
  const max = Math.round(strengthScore * 7.5)
  const light = Math.round(max * 0.33)
  const medium = Math.round(max * 0.66)
  return { light, medium, max }
}

export function getCarryCategory(currentWeight: number, strengthScore: number): CarryCategory {
  const { light, medium, max } = getCarryCapacity(strengthScore)
  if (currentWeight > max) return "Imobilizado"
  if (currentWeight > medium) return "Pesada"
  if (currentWeight > light) return "Media"
  return "Leve"
}

export type WeaponCategory = "Simples Corpo-a-Corpo" | "Simples a Distancia" | "Marcial Corpo-a-Corpo" | "Marcial a Distancia"

export interface Weapon {
  name: string
  category: WeaponCategory
  price: string
  damage: string
  weight: number // kg
  properties: string
}

export const weapons: Weapon[] = [
  // Armas Simples Corpo-a-Corpo
  { name: "Adaga", category: "Simples Corpo-a-Corpo", price: "2 po", damage: "1d4 perfurante", weight: 0.5, properties: "Acuidade, leve, arremesso (6/18)" },
  { name: "Azagaia", category: "Simples Corpo-a-Corpo", price: "5 pp", damage: "1d6 perfurante", weight: 1, properties: "Arremesso (9/36)" },
  { name: "Bordao", category: "Simples Corpo-a-Corpo", price: "2 pp", damage: "1d6 concussao", weight: 2, properties: "Versatil (1d8)" },
  { name: "Clava Grande", category: "Simples Corpo-a-Corpo", price: "2 pp", damage: "1d8 concussao", weight: 5, properties: "Pesada, duas maos" },
  { name: "Foice Curta", category: "Simples Corpo-a-Corpo", price: "1 po", damage: "1d4 cortante", weight: 1, properties: "Leve" },
  { name: "Lanca", category: "Simples Corpo-a-Corpo", price: "1 po", damage: "1d6 perfurante", weight: 1.5, properties: "Arremesso (6/18), versatil (1d8)" },
  { name: "Maca", category: "Simples Corpo-a-Corpo", price: "5 po", damage: "1d6 concussao", weight: 2, properties: "-" },
  { name: "Machadinha", category: "Simples Corpo-a-Corpo", price: "5 po", damage: "1d6 cortante", weight: 1, properties: "Leve, arremesso (6/18)" },
  { name: "Martelo Leve", category: "Simples Corpo-a-Corpo", price: "2 po", damage: "1d4 concussao", weight: 1, properties: "Leve, arremesso (6/18)" },
  { name: "Porrete", category: "Simples Corpo-a-Corpo", price: "1 pp", damage: "1d4 concussao", weight: 1, properties: "Leve" },
  // Armas Simples a Distancia
  { name: "Arco Curto", category: "Simples a Distancia", price: "25 po", damage: "1d6 perfurante", weight: 1, properties: "Municao (24/96), duas maos" },
  { name: "Beste Leve", category: "Simples a Distancia", price: "25 po", damage: "1d8 perfurante", weight: 2.5, properties: "Municao (24/96), recarga, duas maos" },
  { name: "Dardo", category: "Simples a Distancia", price: "5 pc", damage: "1d4 perfurante", weight: 0.1, properties: "Acuidade, arremesso (6/18)" },
  { name: "Funda", category: "Simples a Distancia", price: "1 pp", damage: "1d4 concussao", weight: 0, properties: "Municao (9/36)" },
  // Armas Marciais Corpo-a-Corpo
  { name: "Alabarda", category: "Marcial Corpo-a-Corpo", price: "20 po", damage: "1d10 cortante", weight: 3, properties: "Pesada, alcance, duas maos" },
  { name: "Cimitarra", category: "Marcial Corpo-a-Corpo", price: "25 po", damage: "1d6 cortante", weight: 1.5, properties: "Acuidade, leve" },
  { name: "Chicote", category: "Marcial Corpo-a-Corpo", price: "2 po", damage: "1d4 cortante", weight: 1.5, properties: "Acuidade, alcance" },
  { name: "Espada Curta", category: "Marcial Corpo-a-Corpo", price: "10 po", damage: "1d6 perfurante", weight: 1, properties: "Acuidade, leve" },
  { name: "Espada Grande", category: "Marcial Corpo-a-Corpo", price: "50 po", damage: "2d6 cortante", weight: 3, properties: "Pesada, duas maos" },
  { name: "Espada Longa", category: "Marcial Corpo-a-Corpo", price: "15 po", damage: "1d8 cortante", weight: 1.5, properties: "Versatil (1d10)" },
  { name: "Glaive", category: "Marcial Corpo-a-Corpo", price: "20 po", damage: "1d10 cortante", weight: 3, properties: "Pesada, alcance, duas maos" },
  { name: "Lanca de Montaria", category: "Marcial Corpo-a-Corpo", price: "10 po", damage: "1d12 perfurante", weight: 3, properties: "Alcance, especial" },
  { name: "Maca Estrela", category: "Marcial Corpo-a-Corpo", price: "15 po", damage: "1d8 perfurante", weight: 2, properties: "-" },
  { name: "Machado Grande", category: "Marcial Corpo-a-Corpo", price: "30 po", damage: "1d12 cortante", weight: 3.5, properties: "Pesada, duas maos" },
  { name: "Machado de Batalha", category: "Marcial Corpo-a-Corpo", price: "10 po", damage: "1d8 cortante", weight: 2, properties: "Versatil (1d10)" },
  { name: "Malho", category: "Marcial Corpo-a-Corpo", price: "10 po", damage: "2d6 concussao", weight: 5, properties: "Pesada, duas maos" },
  { name: "Mangual", category: "Marcial Corpo-a-Corpo", price: "10 po", damage: "1d8 perfurante", weight: 1, properties: "-" },
  { name: "Martelo de Guerra", category: "Marcial Corpo-a-Corpo", price: "15 po", damage: "1d8 concussao", weight: 1, properties: "Versatil (1d10)" },
  { name: "Picareta de Guerra", category: "Marcial Corpo-a-Corpo", price: "5 po", damage: "1d8 perfurante", weight: 1, properties: "-" },
  { name: "Rapieira", category: "Marcial Corpo-a-Corpo", price: "25 po", damage: "1d8 perfurante", weight: 1, properties: "Acuidade" },
  { name: "Tridente", category: "Marcial Corpo-a-Corpo", price: "5 po", damage: "1d6 perfurante", weight: 2, properties: "Arremesso (6/18), versatil (1d8)" },
  // Armas Marciais a Distancia
  { name: "Arco Longo", category: "Marcial a Distancia", price: "50 po", damage: "1d8 perfurante", weight: 1, properties: "Municao (45/180), pesada, duas maos" },
  { name: "Besta de Mao", category: "Marcial a Distancia", price: "75 po", damage: "1d6 perfurante", weight: 1.5, properties: "Municao (9/36), leve, recarga" },
  { name: "Besta Pesada", category: "Marcial a Distancia", price: "50 po", damage: "1d10 perfurante", weight: 4.5, properties: "Municao (30/120), pesada, recarga, duas maos" },
  { name: "Rede", category: "Marcial a Distancia", price: "1 po", damage: "-", weight: 1.5, properties: "Especial, arremesso (1.5/4.5)" },
  { name: "Zarabatana", category: "Marcial a Distancia", price: "10 po", damage: "1 perfurante", weight: 0.5, properties: "Municao (7.5/30), recarga" },
]

// Proficiencia de armas por classe
export const classWeaponProficiencies: Record<string, { simple: boolean; martial: boolean; specific: string[] }> = {
  "Barbaro": { simple: true, martial: true, specific: [] },
  "Bardo": { simple: true, martial: false, specific: ["Besta de Mao", "Espada Longa", "Rapieira", "Espada Curta"] },
  "Bruxo": { simple: true, martial: false, specific: [] },
  "Clerigo": { simple: true, martial: false, specific: [] },
  "Druida": { simple: false, martial: false, specific: ["Adaga", "Dardo", "Azagaia", "Maca", "Bordao", "Cimitarra", "Foice Curta", "Funda", "Lanca"] },
  "Feiticeiro": { simple: false, martial: false, specific: ["Adaga", "Dardo", "Funda", "Bordao", "Beste Leve"] },
  "Guerreiro": { simple: true, martial: true, specific: [] },
  "Ladino": { simple: true, martial: false, specific: ["Besta de Mao", "Espada Longa", "Rapieira", "Espada Curta"] },
  "Mago": { simple: false, martial: false, specific: ["Adaga", "Dardo", "Funda", "Bordao", "Beste Leve"] },
  "Monge": { simple: true, martial: false, specific: ["Espada Curta"] },
  "Paladino": { simple: true, martial: true, specific: [] },
  "Patrulheiro": { simple: true, martial: true, specific: [] },
}

export function getAvailableWeapons(className: string): Weapon[] {
  const profs = classWeaponProficiencies[className]
  if (!profs) return weapons.filter(w => w.category.startsWith("Simples"))
  
  return weapons.filter(w => {
    if (profs.martial && w.category.startsWith("Marcial")) return true
    if (profs.simple && w.category.startsWith("Simples")) return true
    if (profs.specific.includes(w.name)) return true
    return false
  })
}

// === FERRAMENTAS ===
export type ToolCategory = "Ferramentas de Artesao" | "Instrumento Musical" | "Kit" | "Kit de Jogo"

export interface Tool {
  name: string
  category: ToolCategory
  price: string
  weight: number // kg
}

export const tools: Tool[] = [
  // Ferramentas de Artesao
  { name: "Ferramentas de carpinteiro", category: "Ferramentas de Artesao", price: "8 po", weight: 3 },
  { name: "Ferramentas de cartografo", category: "Ferramentas de Artesao", price: "15 po", weight: 3 },
  { name: "Ferramentas de costureiro", category: "Ferramentas de Artesao", price: "1 po", weight: 2.5 },
  { name: "Ferramentas de coureiro", category: "Ferramentas de Artesao", price: "5 po", weight: 2.5 },
  { name: "Ferramentas de entalhador", category: "Ferramentas de Artesao", price: "1 po", weight: 2.5 },
  { name: "Ferramentas de ferreiro", category: "Ferramentas de Artesao", price: "20 po", weight: 4 },
  { name: "Ferramentas de funileiro", category: "Ferramentas de Artesao", price: "50 po", weight: 5 },
  { name: "Ferramentas de joalheiro", category: "Ferramentas de Artesao", price: "25 po", weight: 1 },
  { name: "Ferramentas de oleiro", category: "Ferramentas de Artesao", price: "10 po", weight: 1.5 },
  { name: "Ferramentas de pedreiro", category: "Ferramentas de Artesao", price: "10 po", weight: 4 },
  { name: "Ferramentas de pintor", category: "Ferramentas de Artesao", price: "10 po", weight: 2.5 },
  { name: "Ferramentas de sapateiro", category: "Ferramentas de Artesao", price: "5 po", weight: 2.5 },
  { name: "Ferramentas de vidreiro", category: "Ferramentas de Artesao", price: "30 po", weight: 2.5 },
  { name: "Suprimentos de alquimista", category: "Ferramentas de Artesao", price: "50 po", weight: 4 },
  { name: "Suprimentos de cervejeiro", category: "Ferramentas de Artesao", price: "20 po", weight: 4.5 },
  { name: "Suprimentos de caligrafia", category: "Ferramentas de Artesao", price: "10 po", weight: 2.5 },
  { name: "Utensilios de cozinheiro", category: "Ferramentas de Artesao", price: "1 po", weight: 4 },
  { name: "Ferramentas de navegacao", category: "Ferramentas de Artesao", price: "25 po", weight: 1 },
  { name: "Ferramentas de ladrao", category: "Ferramentas de Artesao", price: "25 po", weight: 0.5 },
  // Instrumentos Musicais
  { name: "Alaude", category: "Instrumento Musical", price: "35 po", weight: 1 },
  { name: "Flauta", category: "Instrumento Musical", price: "2 po", weight: 0.5 },
  { name: "Flauta de pa", category: "Instrumento Musical", price: "12 po", weight: 1 },
  { name: "Gaita de foles", category: "Instrumento Musical", price: "30 po", weight: 3 },
  { name: "Lira", category: "Instrumento Musical", price: "30 po", weight: 1 },
  { name: "Oboe", category: "Instrumento Musical", price: "2 po", weight: 0.5 },
  { name: "Tambor", category: "Instrumento Musical", price: "6 po", weight: 1.5 },
  { name: "Trombeta", category: "Instrumento Musical", price: "3 po", weight: 1 },
  { name: "Violino", category: "Instrumento Musical", price: "30 po", weight: 3 },
  { name: "Xilofone", category: "Instrumento Musical", price: "25 po", weight: 5 },
  // Kits
  { name: "Kit de disfarce", category: "Kit", price: "25 po", weight: 1.5 },
  { name: "Kit de falsificacao", category: "Kit", price: "15 po", weight: 2.5 },
  { name: "Kit de herbalismo", category: "Kit", price: "5 po", weight: 1.5 },
  { name: "Kit de venenos", category: "Kit", price: "50 po", weight: 1 },
  // Kits de Jogo
  { name: "Baralho de cartas", category: "Kit de Jogo", price: "5 pp", weight: 0 },
  { name: "Conjunto de dados", category: "Kit de Jogo", price: "1 pp", weight: 0 },
  { name: "Jogo dos tres dragoes", category: "Kit de Jogo", price: "5 po", weight: 0 },
  { name: "Xadrez do dragao", category: "Kit de Jogo", price: "1 po", weight: 0.25 },
]

// === IDIOMAS ===
export interface Language {
  name: string
  speakers: string
  script: string
  exotic: boolean
}

export const languages: Language[] = [
  // Idiomas Padrao
  { name: "Anao", speakers: "Anoes", script: "Anao", exotic: false },
  { name: "Comum", speakers: "Humanos", script: "Comum", exotic: false },
  { name: "Elfico", speakers: "Elfos", script: "Elfico", exotic: false },
  { name: "Gigante", speakers: "Ogros, gigantes", script: "Anao", exotic: false },
  { name: "Gnomico", speakers: "Gnomos", script: "Anao", exotic: false },
  { name: "Goblin", speakers: "Goblinoides", script: "Anao", exotic: false },
  { name: "Halfling", speakers: "Halflings", script: "Comum", exotic: false },
  { name: "Orc", speakers: "Orcs", script: "Anao", exotic: false },
  // Idiomas Exoticos
  { name: "Abissal", speakers: "Demonios", script: "Infernal", exotic: true },
  { name: "Celestial", speakers: "Celestiais", script: "Celestial", exotic: true },
  { name: "Dialeto Subterraneo", speakers: "Devoradores de mente, observadores", script: "-", exotic: true },
  { name: "Draconico", speakers: "Dragoes, draconatos", script: "Draconico", exotic: true },
  { name: "Infernal", speakers: "Diabos", script: "Infernal", exotic: true },
  { name: "Primordial", speakers: "Elementais", script: "Anao", exotic: true },
  { name: "Silvestre", speakers: "Criaturas feericas", script: "Elfico", exotic: true },
  { name: "Subcomum", speakers: "Comerciantes do Subterraneo", script: "Elfico", exotic: true },
]

export function calculateEquipmentWeight(sheet: CharacterSheet): number {
  let total = 0
  // Peso da armadura equipada
  if (sheet.equippedArmor) {
    total += sheet.equippedArmor.weight
  }
  if (sheet.equippedShield) {
    total += sheet.equippedShield.weight
  }
  // Peso das armas equipadas
  if (sheet.equippedWeapons) {
    sheet.equippedWeapons.forEach(w => { total += w.weight })
  }
  // Peso das ferramentas
  if (sheet.selectedTools) {
    sheet.selectedTools.forEach(t => { total += t.weight })
  }
  // Peso estimado de itens (media 0.5kg por item simples)
  total += sheet.equipment.length * 0.5
  return Math.round(total * 10) / 10
}

export interface Background {
  name: string
  description: string
  skillProficiencies: string[]
  toolProficiencies: string[]
  languages: number
  feature: string
  traits: string[]
  ideals: string[]
  bonds: string[]
  flaws: string[]
  image: string
}

export interface Campaign {
  id: string
  name: string
  description: string
  image: string
}

export const campaigns: Campaign[] = [
  {
    id: "alcateia",
    name: "Alcateia",
    description: "Uma campanha sombria onde lobos e homens lutam pelo controle das terras selvagens.",
    image: "/images/alcateia.png",
  },
  {
    id: "luz-e-trevas",
    name: "Luz e Trevas",
    description: "O equilíbrio entre o bem e o mal foi rompido. Escolha seu lado.",
    image: "/images/luz-e-trevas.png",
  },
  {
    id: "sede-de-sangue",
    name: "Sede de Sangue",
    description: "Vampiros dominam as cidades. A resistência precisa de heróis.",
    image: "/images/sede-de-sangue.png",
  },
  {
    id: "nova-campanha",
    name: "Nova Campanha",
    description: "Crie seu personagem para uma campanha personalizada. O Mestre decidirá o cenário.",
    image: "/images/nova-campanha.jpg",
  },
]

export const races: Race[] = [
  {
    name: "Humano",
    description: "Versáteis e ambiciosos, os humanos são a raça mais diversa e adaptável dos mundos de D&D. Eles se destacam em todas as áreas, compensando a falta de especialização com determinação e engenhosidade.",
    bonuses: { Força: 1, Destreza: 1, Constituição: 1, Inteligência: 1, Sabedoria: 1, Carisma: 1 },
    traits: ["+1 em todos os valores de habilidade", "Idioma extra à sua escolha"],
    speed: "9 metros",
    size: "Médio",
    languages: ["Comum", "Um idioma extra à sua escolha"],
    image: "/images/races/humano.jpg",
  },
  {
    name: "Elfo",
    description: "Elfos são um povo mágico de graça sobrenatural, vivendo no mundo sem pertencer inteiramente a ele. Eles vivem em lugares de beleza etérea e podem viver mais de 700 anos.",
    bonuses: { Destreza: 2 },
    traits: ["+2 Destreza", "Visão no Escuro (18m)", "Sentidos Aguçados (proficiência em Percepção)", "Ancestral Feérico (vantagem contra encantamento)", "Transe (4h em vez de 8h de sono)"],
    speed: "9 metros",
    size: "Médio",
    languages: ["Comum", "Élfico"],
    image: "/images/races/elfo.jpg",
  },
  {
    name: "Anão",
    description: "Audazes e resistentes, os anões são conhecidos como hábeis guerreiros, mineradores e trabalhadores em pedra e metal. Podem viver mais de 400 anos e possuem um forte senso de justiça.",
    bonuses: { Constituição: 2 },
    traits: ["+2 Constituição", "Visão no Escuro (18m)", "Resiliência Anã (vantagem contra veneno)", "Treinamento Anão em Combate", "Proficiência com Ferramentas de artesão", "Especialização em Rochas"],
    speed: "7,5 metros",
    size: "Médio",
    languages: ["Comum", "Anão"],
    image: "/images/races/anao.jpg",
  },
  {
    name: "Halfling",
    description: "Halflings são um povo pacífico e amável que prefere a tranquilidade de seus lares. Mesmo assim, possuem uma coragem notável e uma sorte sobrenatural.",
    bonuses: { Destreza: 2 },
    traits: ["+2 Destreza", "Sortudo (rolar novamente resultado 1 no d20)", "Bravura (vantagem contra amedrontado)", "Agilidade Halfling (mover-se por criaturas maiores)"],
    speed: "7,5 metros",
    size: "Pequeno",
    languages: ["Comum", "Halfling"],
    image: "/images/races/halfling.jpg",
  },
  {
    name: "Draconato",
    description: "Descendentes de dragões, os draconatos carregam orgulho ancestral e o poder elemental de seus antepassados. Caminham por um mundo que os recebe com medo e incompreensão.",
    bonuses: { Força: 2, Carisma: 1 },
    traits: ["+2 Força", "+1 Carisma", "Ancestralidade Dracônica (tipo de dano e resistência)", "Sopro Dracônico (ataque de área elemental)"],
    speed: "9 metros",
    size: "Médio",
    languages: ["Comum", "Dracônico"],
    image: "/images/races/draconato.jpg",
  },
  {
    name: "Gnomo",
    description: "Curiosos e inventivos, os gnomos possuem uma mente brilhante e espírito alegre. Sua energia e entusiasmo pela vida se manifesta em cada sorriso e invenção.",
    bonuses: { Inteligência: 2 },
    traits: ["+2 Inteligência", "Visão no Escuro (18m)", "Esperteza Gnômica (vantagem em testes de Int, Sab e Car contra magia)"],
    speed: "7,5 metros",
    size: "Pequeno",
    languages: ["Comum", "Gnômico"],
    image: "/images/races/gnomo.jpg",
  },
  {
    name: "Meio-Elfo",
    description: "Vagando entre dois mundos, meio-elfos combinam a curiosidade e ambição humanas com os sentidos refinados e o amor à natureza dos elfos.",
    bonuses: { Carisma: 2 },
    traits: ["+2 Carisma", "+1 em dois valores de habilidade à escolha", "Visão no Escuro (18m)", "Ancestral Feérico", "Versatilidade em Perícia (2 perícias à escolha)"],
    speed: "9 metros",
    size: "Médio",
    languages: ["Comum", "Élfico", "Um idioma extra à sua escolha"],
    image: "/images/races/meio-elfo.jpg",
  },
  {
    name: "Meio-Orc",
    description: "Fortes e implacáveis, meio-orcs canalizam emoções poderosas e uma fúria que fervilha dentro deles. Sua força e resistência os tornam guerreiros formidáveis.",
    bonuses: { Força: 2, Constituição: 1 },
    traits: ["+2 Força", "+1 Constituição", "Visão no Escuro (18m)", "Ameaçador (proficiência em Intimidação)", "Resistência Implacável (1 PV ao cair a 0)", "Ataques Selvagens (dado de dano extra em crítico corpo-a-corpo)"],
    speed: "9 metros",
    size: "Médio",
    languages: ["Comum", "Orc"],
    image: "/images/races/meio-orc.jpg",
  },
  {
    name: "Tiefling",
    description: "Marcados por uma linhagem infernal, tieflings enfrentam preconceito e desconfiança. Mas seu legado demoníaco também lhes concede poderes sombrios e uma determinação inabalável.",
    bonuses: { Carisma: 2, Inteligência: 1 },
    traits: ["+2 Carisma", "+1 Inteligência", "Visão no Escuro (18m)", "Resistência Infernal (resistência a dano de fogo)", "Legado Infernal (truque taumaturgia; escuridão e chamas infernais em níveis superiores)"],
    speed: "9 metros",
    size: "Médio",
    languages: ["Comum", "Infernal"],
    image: "/images/races/tiefling.jpg",
  },
]

export const classes: CharacterClass[] = [
  {
    name: "Bárbaro",
    description: "Um guerreiro primitivo que canaliza fúria selvagem em combate devastador. Sua raiva descontrolada o torna mais forte e resistente.",
    hitDie: "d12",
    primaryAbility: "Força",
    savingThrows: ["Força", "Constituição"],
    proficiencies: ["Armaduras leves e médias", "Escudos", "Armas simples e marciais"],
    abilities: ["Fúria (dano extra e resistência)", "Defesa sem Armadura (CA = 10 + Des + Con)"],
    image: "/images/classes/barbaro.jpg",
    equipmentOptions: [
      { label: "Arma principal", choices: ["Machado grande", "Qualquer arma marcial corpo-a-corpo"] },
      { label: "Arma secundária", choices: ["Dois machados de mão", "Qualquer arma simples"] },
      { label: "Kit", choices: ["Pacote de explorador"] },
    ],
  },
  {
    name: "Bardo",
    description: "Um mestre de canções, palavras e magia que tece encantamentos através da música. Sua versatilidade o torna útil em qualquer situação.",
    hitDie: "d8",
    primaryAbility: "Carisma",
    savingThrows: ["Destreza", "Carisma"],
    proficiencies: ["Armaduras leves", "Armas simples, bestas de mão, espadas longas, rapieiras, espadas curtas", "Três instrumentos musicais à escolha"],
    abilities: ["Conjuração (Carisma)", "Inspiração Bárdica (dado de bônus para aliados)"],
    image: "/images/classes/bardo.jpg",
    equipmentOptions: [
      { label: "Arma", choices: ["Rapieira", "Espada longa", "Qualquer arma simples"] },
      { label: "Kit", choices: ["Pacote de diplomata", "Pacote de artista"] },
      { label: "Instrumento", choices: ["Alaúde", "Flauta", "Lira", "Tambor"] },
    ],
  },
  {
    name: "Bruxo",
    description: "Um conjurador que obteve poderes através de um pacto com uma entidade extraplanar misteriosa e poderosa.",
    hitDie: "d8",
    primaryAbility: "Carisma",
    savingThrows: ["Sabedoria", "Carisma"],
    proficiencies: ["Armaduras leves", "Armas simples"],
    abilities: ["Patrono Extraplanar", "Magia de Pacto (espaços de magia recuperados em descanso curto)"],
    image: "/images/classes/bruxo.jpg",
    equipmentOptions: [
      { label: "Arma", choices: ["Besta leve e 20 virotes", "Qualquer arma simples"] },
      { label: "Foco", choices: ["Bolsa de componentes", "Foco arcano"] },
      { label: "Kit", choices: ["Pacote de estudioso", "Pacote de explorador"] },
    ],
  },
  {
    name: "Clérigo",
    description: "Um campeão divino que canaliza o poder sagrado dos deuses para curar aliados e destruir inimigos.",
    hitDie: "d8",
    primaryAbility: "Sabedoria",
    savingThrows: ["Sabedoria", "Carisma"],
    proficiencies: ["Armaduras leves e médias", "Escudos", "Todas as armas simples"],
    abilities: ["Conjuração (Sabedoria)", "Domínio Divino (especialização de poder divino)"],
    image: "/images/classes/clerigo.jpg",
    equipmentOptions: [
      { label: "Arma", choices: ["Maça", "Martelo de guerra (se proficiente)"] },
      { label: "Armadura", choices: ["Brunea", "Armadura de couro", "Cota de malha (se proficiente)"] },
      { label: "Kit", choices: ["Pacote de sacerdote", "Pacote de explorador"] },
    ],
  },
  {
    name: "Druida",
    description: "Um sacerdote da Velha Fé que utiliza as forças da natureza e pode assumir formas animais para proteger o equilíbrio do mundo.",
    hitDie: "d8",
    primaryAbility: "Sabedoria",
    savingThrows: ["Inteligência", "Sabedoria"],
    proficiencies: ["Armaduras leves e médias (não metálicas)", "Escudos (não metálicos)", "Clavas, adagas, dardos, azagaias, maças, bordões, cimitarras, foices, fundas, lanças"],
    abilities: ["Druidismo (linguagem secreta)", "Conjuração (Sabedoria)", "Forma Selvagem (nível 2)"],
    image: "/images/classes/druida.jpg",
    equipmentOptions: [
      { label: "Arma", choices: ["Escudo de madeira", "Qualquer arma simples"] },
      { label: "Arma secundária", choices: ["Cimitarra", "Qualquer arma simples corpo-a-corpo"] },
      { label: "Foco", choices: ["Foco druídico", "Pacote de explorador"] },
    ],
  },
  {
    name: "Feiticeiro",
    description: "Um conjurador que possui magia inata fluindo em suas veias, talvez herdada de uma linhagem dracônica ou de uma magia selvagem.",
    hitDie: "d6",
    primaryAbility: "Carisma",
    savingThrows: ["Constituição", "Carisma"],
    proficiencies: ["Adagas, dardos, fundas, bordões, bestas leves"],
    abilities: ["Conjuração (Carisma)", "Origem de Feitiçaria (fonte do poder inato)"],
    image: "/images/classes/feiticeiro.jpg",
    equipmentOptions: [
      { label: "Arma", choices: ["Besta leve e 20 virotes", "Qualquer arma simples"] },
      { label: "Foco", choices: ["Bolsa de componentes", "Foco arcano"] },
      { label: "Kit", choices: ["Pacote de explorador", "Pacote de estudioso"] },
    ],
  },
  {
    name: "Guerreiro",
    description: "Um mestre do combate marcial, treinado com todas as armas e armaduras. Sua versatilidade e resistência o tornam a espinha dorsal de qualquer grupo.",
    hitDie: "d10",
    primaryAbility: "Força ou Destreza",
    savingThrows: ["Força", "Constituição"],
    proficiencies: ["Todas as armaduras", "Escudos", "Armas simples e marciais"],
    abilities: ["Estilo de Luta", "Retomar Fôlego (recuperar PV como ação bônus)", "Surto de Ação (nível 2)"],
    image: "/images/classes/guerreiro.jpg",
    equipmentOptions: [
      { label: "Armadura", choices: ["Cota de malha", "Armadura de couro, arco longo e 20 flechas"] },
      { label: "Arma principal", choices: ["Uma arma marcial e um escudo", "Duas armas marciais"] },
      { label: "Arma secundária", choices: ["Besta leve e 20 virotes", "Dois machados de mão"] },
    ],
  },
  {
    name: "Ladino",
    description: "Um especialista furtivo que domina perícias e usa astúcia, agilidade e o ataque furtivo letal para superar qualquer desafio.",
    hitDie: "d8",
    primaryAbility: "Destreza",
    savingThrows: ["Destreza", "Inteligência"],
    proficiencies: ["Armaduras leves", "Armas simples, bestas de mão, espadas longas, rapieiras, espadas curtas", "Ferramentas de ladrão"],
    abilities: ["Especialização (dobro do bônus em 2 perícias)", "Ataque Furtivo (dano extra)", "Gíria de Ladrões"],
    image: "/images/classes/ladino.jpg",
    equipmentOptions: [
      { label: "Arma", choices: ["Rapieira", "Espada curta"] },
      { label: "Arma à distância", choices: ["Arco curto e aljava com 20 flechas", "Espada curta extra"] },
      { label: "Kit", choices: ["Pacote de assaltante", "Pacote de explorador", "Pacote de aventureiro"] },
    ],
  },
  {
    name: "Mago",
    description: "Um estudioso dedicado da magia arcana que registra feitiços em seu grimório. Seus conhecimentos arcanos são vastos e seus poderes, terríveis.",
    hitDie: "d6",
    primaryAbility: "Inteligência",
    savingThrows: ["Inteligência", "Sabedoria"],
    proficiencies: ["Adagas, dardos, fundas, bordões, bestas leves"],
    abilities: ["Conjuração (Inteligência)", "Recuperação Arcana (recuperar espaços de magia em descanso curto)", "Tradição Arcana (nível 2)"],
    image: "/images/classes/mago.jpg",
    equipmentOptions: [
      { label: "Arma", choices: ["Bordão", "Adaga"] },
      { label: "Foco", choices: ["Bolsa de componentes", "Foco arcano"] },
      { label: "Kit", choices: ["Pacote de estudioso", "Pacote de explorador"] },
    ],
  },
  {
    name: "Monge",
    description: "Um mestre das artes marciais que canaliza a energia espiritual chamada ki para realizar proezas extraordinárias em combate.",
    hitDie: "d8",
    primaryAbility: "Destreza e Sabedoria",
    savingThrows: ["Força", "Destreza"],
    proficiencies: ["Armas simples", "Espadas curtas", "Uma ferramenta de artesão ou instrumento musical à escolha"],
    abilities: ["Defesa sem Armadura (CA = 10 + Des + Sab)", "Artes Marciais (dado de dano especial e ataque desarmado bônus)", "Ki (nível 2)"],
    image: "/images/classes/monge.jpg",
    equipmentOptions: [
      { label: "Arma", choices: ["Espada curta", "Qualquer arma simples"] },
      { label: "Kit", choices: ["Pacote de explorador", "Pacote de aventureiro"] },
      { label: "Extra", choices: ["10 dardos"] },
    ],
  },
  {
    name: "Paladino",
    description: "Um guerreiro sagrado vinculado a um juramento divino, combinando proezas marciais com magia sagrada para proteger os inocentes.",
    hitDie: "d10",
    primaryAbility: "Força e Carisma",
    savingThrows: ["Sabedoria", "Carisma"],
    proficiencies: ["Todas as armaduras", "Escudos", "Armas simples e marciais"],
    abilities: ["Sentido Divino (detectar celestiais, corruptores e mortos-vivos)", "Imposição de Mãos (cura por toque)", "Estilo de Luta e Conjuração (nível 2)"],
    image: "/images/classes/paladino.jpg",
    equipmentOptions: [
      { label: "Arma principal", choices: ["Uma arma marcial e um escudo", "Duas armas marciais"] },
      { label: "Arma secundária", choices: ["Cinco azagaias", "Qualquer arma simples corpo-a-corpo"] },
      { label: "Kit", choices: ["Pacote de sacerdote", "Pacote de explorador"] },
    ],
  },
  {
    name: "Patrulheiro",
    description: "Um caçador e rastreador que domina os terrenos selvagens, combinando habilidades marciais com magia da natureza.",
    hitDie: "d10",
    primaryAbility: "Destreza e Sabedoria",
    savingThrows: ["Força", "Destreza"],
    proficiencies: ["Armaduras leves e médias", "Escudos", "Armas simples e marciais"],
    abilities: ["Inimigo Favorito (bônus contra tipo de criatura)", "Explorador Natural (vantagem em terreno favorito)", "Estilo de Luta e Conjuração (nível 2)"],
    image: "/images/classes/patrulheiro.jpg",
    equipmentOptions: [
      { label: "Armadura", choices: ["Brunea", "Armadura de couro"] },
      { label: "Armas", choices: ["Duas espadas curtas", "Duas armas simples corpo-a-corpo"] },
      { label: "Kit", choices: ["Pacote de explorador", "Pacote de aventureiro"] },
    ],
  },
]

export const backgrounds: Background[] = [
  {
    name: "Acólito",
    description: "Você viveu a serviço de um templo de algum deus específico ou de um panteão de deuses. Você age como um intermediário entre o reino divino e o reino dos mortais.",
    skillProficiencies: ["Intuição", "Religião"],
    toolProficiencies: [],
    languages: 2,
    feature: "Abrigo dos Fiéis",
    traits: [
      "Eu idolatro um herói particular da minha fé e constantemente me refiro a seus feitos e exemplos",
      "Eu consigo encontrar semelhanças mesmo entre os inimigos mais violentos, com empatia e sempre trabalhando pela paz",
      "Eu vejo presságios em cada evento e ação. Os deuses estão falando conosco",
      "Nada pode abalar minha atitude otimista",
    ],
    ideals: [
      "Tradição: As tradições ancestrais de adoração e sacrifício devem ser preservadas e perpetradas (Leal)",
      "Caridade: Eu sempre tento ajudar aqueles em necessidade, não importando o custo pessoal (Bom)",
      "Mudança: Nós devemos ajudar a conduzir as mudanças que os deuses estão constantemente trabalhando para o mundo (Caótico)",
      "Fé: Eu acredito que minha divindade guia minhas ações. Se eu trabalhar duro, coisas boas acontecerão (Leal)",
    ],
    bonds: [
      "Eu morreria para recuperar uma relíquia ancestral de minha fé, perdida há muito tempo",
      "Eu ainda terei minha vingança contra o templo corrupto que me acusou de heresia",
      "Eu devo minha vida ao sacerdote que me acolheu quando meus pais morreram",
      "Tudo o que faço, faço pelo povo",
    ],
    flaws: [
      "Eu julgo os outros severamente, e a mim mesmo mais ainda",
      "Eu deposito muita confiança naqueles que detêm o poder na hierarquia de meu templo",
      "Minha devoção muitas vezes me cega perante aqueles que professam a fé do meu deus",
      "Meu pensamento é inflexível",
    ],
    image: "/images/backgrounds/acolito.jpg",
  },
  {
    name: "Criminoso",
    description: "Você é um criminoso experiente com um histórico de contravenções. Você está mais perto do submundo do assassinato, roubo e violência que prevalece no ventre da sociedade.",
    skillProficiencies: ["Enganação", "Furtividade"],
    toolProficiencies: ["Um tipo de kit de jogo", "Ferramentas de ladrão"],
    languages: 0,
    feature: "Contato Criminal",
    traits: [
      "Eu sempre tenho um plano para quando as coisas dão errado",
      "Eu estou sempre calmo, não importa a situação. Eu nunca levanto minha voz ou deixo minhas emoções me controlarem",
      "A primeira coisa que faço ao chegar a um novo local é decorar a localização de coisas valiosas",
      "Eu prefiro fazer um novo amigo a um novo inimigo",
    ],
    ideals: [
      "Honra: Eu não roubo de irmãos de profissão (Leal)",
      "Liberdade: Correntes foram feitas para serem partidas, assim como aqueles que as forjaram (Caótico)",
      "Caridade: Eu roubo dos ricos para dar aos que realmente precisam (Bom)",
      "Lealdade: Eu sou leal aos meus amigos, não a qualquer ideal (Neutro)",
    ],
    bonds: [
      "Eu estou tentando quitar uma dívida que tenho com um generoso benfeitor",
      "Meus ganhos, honestos ou não, são para sustentar minha família",
      "Algo importante foi roubado de mim, e eu vou recuperá-lo",
      "Alguém que amo morreu por causa de um erro que cometi. Isso nunca acontecerá novamente",
    ],
    flaws: [
      "Quando vejo algo valioso, não consigo pensar em mais nada além de roubá-lo",
      "Quando confrontado com uma escolha entre dinheiro e amigo, eu bem que escolho o dinheiro",
      "Se há um plano, eu vou esquecê-lo. Se eu não esquecê-lo, vou ignorá-lo",
      "Eu tenho um tique que revela se estou mentindo",
    ],
    image: "/images/backgrounds/criminoso.jpg",
  },
  {
    name: "Herói do Povo",
    description: "Você veio de uma parcela humilde da sociedade, mas está destinado a muito mais. O povo de sua vila já o reconhece como campeão, e seu destino o conduz a batalhas contra tiranos e monstros.",
    skillProficiencies: ["Adestrar Animais", "Sobrevivência"],
    toolProficiencies: ["Um tipo de ferramenta de artesão", "Veículos (terrestre)"],
    languages: 0,
    feature: "Hospitalidade Rústica",
    traits: [
      "Eu julgo as pessoas por suas ações, não por suas palavras",
      "Se alguém está em apuros, eu estou sempre pronto para ajudar",
      "Quando eu fixo minha mente em algo, eu sigo esse caminho, não importa o que fique no caminho",
      "Eu possuo um forte senso de justiça e sempre tento encontrar a solução mais justa",
    ],
    ideals: [
      "Respeito: As pessoas merecem ser tratadas com dignidade (Bom)",
      "Justiça: Ninguém está acima da lei (Leal)",
      "Liberdade: Tiranos não podem ser tolerados (Caótico)",
      "Sinceridade: Não há vantagem alguma em tentar ser algo que eu não sou (Neutro)",
    ],
    bonds: [
      "Eu tenho uma família que precisa de proteção acima de tudo",
      "Devo proteger minha vila natal dos que a ameaçam",
      "Um dia arrebatarei as terras da minha família de quem as tomou",
      "Desejo proteger a natureza de uma força destruidora que a ameaça",
    ],
    flaws: [
      "Sou teimoso demais para meu próprio bem",
      "Confio demais nas pessoas",
      "Eu tenho um fraco por vícios da cidade grande",
      "Secretamente acredito que as coisas seriam melhores se eu fosse um tirano governando a terra",
    ],
    image: "/images/backgrounds/heroi-do-povo.jpg",
  },
  {
    name: "Nobre",
    description: "Você entende de riqueza, poder e privilégios. Você carrega um título de nobreza, sua família possui terras, coleta impostos e exerce uma influência política significativa.",
    skillProficiencies: ["História", "Persuasão"],
    toolProficiencies: ["Um tipo de kit de jogos"],
    languages: 1,
    feature: "Posição Privilegiada",
    traits: [
      "Minha bajulação eloquente faz com que todos com quem eu converse se sintam a pessoa mais importante do mundo",
      "As pessoas comuns me amam por minha bondade e generosidade",
      "Ninguém pode duvidar, olhando para o meu porte real, que estou acima das massas plebeias",
      "Eu tenho grande cuidado de sempre estar no meu melhor e seguir as últimas modas",
    ],
    ideals: [
      "Respeito: Todas as pessoas, independentemente da posição, merecem ser tratados com dignidade (Bom)",
      "Responsabilidade: É o meu dever respeitar a autoridade daqueles acima de mim (Leal)",
      "Independência: Devo provar que posso me cuidar sem os mimos da minha família (Caótico)",
      "Obrigação Nobre: É o meu dever proteger e cuidar das pessoas abaixo de mim (Bom)",
    ],
    bonds: [
      "Eu vou encarar qualquer desafio para ganhar a aprovação da minha família",
      "A aliança da minha casa com outra família nobre deve ser mantida a todo custo",
      "Nada é mais importante do que os outros membros da minha família",
      "Minha lealdade ao meu soberano é inabalável",
    ],
    flaws: [
      "Eu secretamente acredito que todos estão abaixo de mim",
      "Eu escondo um segredo verdadeiramente escandaloso que poderia arruinar minha família para sempre",
      "Muitas vezes eu ouço insultos e ameaças veladas em cada palavra dirigida a mim, e me irrito muito rápido",
      "Eu tenho um desejo insaciável por prazeres carnais",
    ],
    image: "/images/backgrounds/nobre.jpg",
  },
  {
    name: "Sábio",
    description: "Você ficou anos aprendendo sobre o conhecimento do multiverso. Decorou manuscritos, estudou pergaminhos e escutou os grandes especialistas nos temas que o interessam.",
    skillProficiencies: ["Arcanismo", "História"],
    toolProficiencies: [],
    languages: 2,
    feature: "Pesquisador",
    traits: [
      "Eu uso palavras polissilábicas para endossar minha impressão de grande erudição",
      "Eu já li todos os livros das grandes bibliotecas, ou gosto de me vangloriar e dizer que li",
      "Nada para mim é melhor que um bom mistério",
      "Eu voluntariamente escuto cada lado, e seus argumentos, antes de tomar uma decisão final",
    ],
    ideals: [
      "Conhecimento: O caminho para o poder e o autoaperfeiçoamento é através do conhecimento (Neutro)",
      "Beleza: O que é belo nos mostra o que está além disso perto do que é verdadeiro (Bom)",
      "Lógica: Emoções não devem nublar seu pensamento lógico (Leal)",
      "Autoaperfeiçoamento: O objetivo de uma vida de estudos é a melhoria de si mesmo (Qualquer)",
    ],
    bonds: [
      "É meu dever proteger meus estudantes",
      "Eu guardo um texto ancestral que contém terríveis segredos que não podem cair em mãos erradas",
      "Eu trabalho para preservar uma biblioteca, universidade, arquivo de escribas ou monastério",
      "Eu venho procurando a minha vida inteira pela resposta de certa questão",
    ],
    flaws: [
      "Eu me distraio facilmente com a promessa de informação",
      "Muitas pessoas gritam e correm quando veem um corruptor. Eu paro e tomo notas de sua anatomia",
      "Desvendar um mistério ancestral pode muito bem valer o preço de uma civilização",
      "Eu falo sem antes pensar em minhas palavras, invariavelmente insultando outros",
    ],
    image: "/images/backgrounds/sabio.jpg",
  },
  {
    name: "Soldado",
    description: "A guerra esteve na sua vida desde que você se recorda. Você foi treinado desde jovem, estudou o uso das armas e armaduras, e aprendeu técnicas básicas de sobrevivência no campo de batalha.",
    skillProficiencies: ["Atletismo", "Intimidação"],
    toolProficiencies: ["Um tipo de kit de jogo", "Veículos (terrestre)"],
    languages: 0,
    feature: "Patente Militar",
    traits: [
      "Eu sou sempre polido e respeitoso",
      "Eu sou assombrado pelas memórias da guerra. Não consigo tirar aquelas imagens da minha cabeça",
      "Eu perdi muitos amigos, e sou muito lento para fazer novos",
      "Eu tenho muitas histórias de inspiração e cautela da minha experiência militar",
    ],
    ideals: [
      "Bem Maior: Nosso destino é dar nossas vidas em defesa de terceiros (Bom)",
      "Responsabilidade: Eu faço o que tenho que fazer e obedeço apenas a autoridade (Leal)",
      "Independência: Quando pessoas seguem ordens cegas, elas apoiam um tipo de tirania (Caótico)",
      "Aspiração: Minha cidade, nação ou meu povo são tudo o que importa para mim (Qualquer)",
    ],
    bonds: [
      "Eu ainda daria a minha vida pelas pessoas com quem servi",
      "Alguém salvou minha vida no campo de batalha. Desde aquele dia eu nunca deixo nenhum amigo para trás",
      "Minha honra é minha vida",
      "Eu nunca esquecerei a derrota esmagadora que minha companhia sofreu",
    ],
    flaws: [
      "O inimigo monstruoso que enfrentamos em batalha ainda me faz tremer de medo",
      "Eu tenho pouco respeito por quem não provou ser um guerreiro de valor",
      "Cometi um erro terrível em batalha que custou muitas vidas, e eu faria qualquer coisa para manter isso em segredo",
      "Meu ódio pelos meus inimigos é cego e irracional",
    ],
    image: "/images/backgrounds/soldado.jpg",
  },
]

export const ATTRIBUTES = ["Força", "Destreza", "Constituição", "Inteligência", "Sabedoria", "Carisma"] as const
export type Attribute = (typeof ATTRIBUTES)[number]

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]

export const ALIGNMENTS = [
  "Leal e Bom",
  "Neutro e Bom",
  "Caótico e Bom",
  "Leal e Neutro",
  "Neutro",
  "Caótico e Neutro",
  "Leal e Mau",
  "Neutro e Mau",
  "Caótico e Mau",
]

export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

export function roll4d6DropLowest(): number {
  const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1)
  rolls.sort((a, b) => a - b)
  return rolls[1] + rolls[2] + rolls[3]
}

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

export interface FamilyMember {
  relationship: string
  name: string
  age: string
  description: string
  image: string
  isUnknown: boolean
}

export interface RelationshipEntry {
  name: string
  description: string
  image: string
}

export interface CharacterSheet {
  name: string
  playerName: string
  race: Race | null
  class: CharacterClass | null
  background: Background | null
  level: number
  attributes: Record<Attribute, number>
  alignment: string
  age: string
  height: string
  weight: string
  appearance: string
  personalityTrait: string
  ideal: string
  bond: string
  flaw: string
  equipment: string[]
  equippedArmor: Armor | null
  equippedShield: Armor | null
  equippedWeapons: Weapon[]
  selectedTools: Tool[]
  selectedLanguages: string[]
  money: Money
  campaignId: string
  characterImage: string
  family: FamilyMember[]
  friends: RelationshipEntry[]
  mascot: RelationshipEntry | null
  mortalEnemy: RelationshipEntry | null
  city: string
  passion: string
}

export const FAMILY_RELATIONSHIPS = [
  "Pai",
  "Mae",
  "Irmao",
  "Irma",
  "Avo",
  "Avoh",
  "Tio",
  "Tia",
  "Primo",
  "Prima",
  "Filho",
  "Filha",
  "Conjuge",
] as const

export function createEmptySheet(playerName: string): CharacterSheet {
  return {
    name: "",
    playerName,
    race: null,
    class: null,
    background: null,
    level: 1,
    attributes: {
      "Força": 10,
      "Destreza": 10,
      "Constituição": 10,
      "Inteligência": 10,
      "Sabedoria": 10,
      "Carisma": 10,
    },
    alignment: "",
    age: "",
    height: "",
    weight: "",
    appearance: "",
    personalityTrait: "",
    ideal: "",
    bond: "",
    flaw: "",
    equipment: [],
    equippedArmor: null,
    equippedShield: null,
    equippedWeapons: [],
    selectedTools: [],
    selectedLanguages: [],
    money: { PC: 0, PP: 0, PE: 0, PO: 0, PL: 0 },
    campaignId: "",
    characterImage: "",
    family: [],
    friends: [],
    mascot: null,
    mortalEnemy: null,
    city: "",
    passion: "",
  }
}

export function calculateHP(sheet: CharacterSheet): number {
  if (!sheet.class) return 10
  const hitDieMax = parseInt(sheet.class.hitDie.replace("d", ""))
  const conMod = getModifier(sheet.attributes["Constituição"])
  return hitDieMax + conMod
}

export function calculateAC(sheet: CharacterSheet): number {
  const dexMod = getModifier(sheet.attributes["Destreza"])
  const conMod = getModifier(sheet.attributes["Constituição"])
  const wisMod = getModifier(sheet.attributes["Sabedoria"])
  
  // Barbaro sem armadura: 10 + Des + Con
  if (sheet.class?.name === "Barbaro" && !sheet.equippedArmor) {
    return 10 + dexMod + conMod + (sheet.equippedShield ? 2 : 0)
  }
  
  // Monge sem armadura: 10 + Des + Sab
  if (sheet.class?.name === "Monge" && !sheet.equippedArmor) {
    return 10 + dexMod + wisMod + (sheet.equippedShield ? 2 : 0)
  }
  
  // Com armadura equipada
  if (sheet.equippedArmor) {
    let ac = sheet.equippedArmor.acBase
    if (sheet.equippedArmor.addDex) {
      if (sheet.equippedArmor.maxDex !== null) {
        ac += Math.min(dexMod, sheet.equippedArmor.maxDex)
      } else {
        ac += dexMod
      }
    }
    // Bonus do escudo
    if (sheet.equippedShield) {
      ac += sheet.equippedShield.acBase
    }
    return ac
  }
  
  // Sem armadura padrao: 10 + Des
  return 10 + dexMod + (sheet.equippedShield ? 2 : 0)
}

export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1
}
