import { jsPDF } from "jspdf"
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
  campaigns,
} from "@/lib/rpg-data"

async function loadImageAsBase64(src: string): Promise<string | null> {
  try {
    const img = new Image()
    img.crossOrigin = "anonymous"
    return new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          resolve(canvas.toDataURL("image/jpeg", 0.7))
        } else {
          resolve(null)
        }
      }
      img.onerror = () => resolve(null)
      img.src = src
    })
  } catch {
    return null
  }
}

export async function generateCharacterPDF(sheet: CharacterSheet) {
  const doc = new jsPDF("p", "mm", "a4")
  const pageWidth = 210
  const pageHeight = 297
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = 0

  // Colors
  const darkBg: [number, number, number] = [20, 8, 8]
  const darkCard: [number, number, number] = [32, 16, 16]
  const red: [number, number, number] = [180, 40, 40]
  const lightRed: [number, number, number] = [200, 60, 60]
  const lightText: [number, number, number] = [230, 220, 210]
  const mutedText: [number, number, number] = [150, 130, 120]
  const gold: [number, number, number] = [200, 170, 120]

  function drawBackground() {
    doc.setFillColor(...darkBg)
    doc.rect(0, 0, pageWidth, pageHeight, "F")
    // Top red line
    doc.setFillColor(...red)
    doc.rect(0, 0, pageWidth, 1.5, "F")
    // Bottom red line
    doc.setFillColor(...red)
    doc.rect(0, pageHeight - 1.5, pageWidth, 1.5, "F")
  }

  function drawSectionTitle(title: string, currentY: number): number {
    doc.setDrawColor(...red)
    doc.setLineWidth(0.3)
    doc.line(margin, currentY, margin + contentWidth, currentY)
    currentY += 5
    doc.setTextColor(...red)
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text(title.toUpperCase(), margin, currentY)
    currentY += 2
    doc.setDrawColor(...red)
    doc.setLineWidth(0.3)
    doc.line(margin, currentY, margin + contentWidth, currentY)
    return currentY + 4
  }

  function checkPageBreak(needed: number): void {
    if (y + needed > pageHeight - 20) {
      doc.addPage()
      drawBackground()
      y = 15
    }
  }

  // ===================== PAGE 1: COVER =====================
  drawBackground()

  // Decorative border
  doc.setDrawColor(80, 30, 30)
  doc.setLineWidth(0.5)
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16)
  doc.setDrawColor(...red)
  doc.setLineWidth(0.3)
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

  // Load character image (uploaded photo) or race image for cover
  let coverImg: string | null = null
  if (sheet.characterImage) {
    // characterImage is already a data URL from the file reader
    if (sheet.characterImage.startsWith("data:")) {
      coverImg = sheet.characterImage
    } else {
      coverImg = await loadImageAsBase64(sheet.characterImage)
    }
  } else if (sheet.race) {
    coverImg = await loadImageAsBase64(sheet.race.image)
  }

  if (coverImg) {
    const imgW = 60
    const imgH = 60
    const imgX = (pageWidth - imgW) / 2
    const imgY = 40

    // Dark background behind image
    doc.setFillColor(...darkCard)
    doc.roundedRect(imgX - 3, imgY - 3, imgW + 6, imgH + 6, 3, 3, "F")

    // Red border
    doc.setDrawColor(...red)
    doc.setLineWidth(1.5)
    doc.roundedRect(imgX - 3, imgY - 3, imgW + 6, imgH + 6, 3, 3, "S")

    try {
      doc.addImage(coverImg, "JPEG", imgX, imgY, imgW, imgH)
    } catch {
      // If image fails, just show the border
    }

    // Outer glow border
    doc.setDrawColor(80, 20, 20)
    doc.setLineWidth(0.5)
    doc.roundedRect(imgX - 6, imgY - 6, imgW + 12, imgH + 12, 4, 4, "S")
  }

  y = coverImg ? 110 : 80

  // Character name
  doc.setTextColor(...lightText)
  doc.setFontSize(32)
  doc.setFont("helvetica", "bold")
  const nameText = sheet.name || "Sem Nome"
  doc.text(nameText, pageWidth / 2, y, { align: "center" })
  y += 8

  // Decorative line under name
  doc.setDrawColor(...red)
  doc.setLineWidth(0.8)
  doc.line(pageWidth / 2 - 30, y, pageWidth / 2 + 30, y)
  y += 8

  // Subtitle
  doc.setTextColor(...gold)
  doc.setFontSize(14)
  doc.setFont("helvetica", "normal")
  doc.text(
    `${sheet.race?.name || "?"} | ${sheet.class?.name || "?"} | Nível ${sheet.level}`,
    pageWidth / 2,
    y,
    { align: "center" }
  )
  y += 7

  if (sheet.background) {
    doc.setTextColor(...mutedText)
    doc.setFontSize(11)
    doc.text(`Antecedente: ${sheet.background.name}`, pageWidth / 2, y, { align: "center" })
    y += 7
  }

  if (sheet.alignment) {
    doc.setTextColor(...mutedText)
    doc.setFontSize(10)
    doc.text(`Tendência: ${sheet.alignment}`, pageWidth / 2, y, { align: "center" })
    y += 7
  }

  // Campaign
  const campaign = campaigns.find((c) => c.id === sheet.campaignId)
  if (campaign) {
    doc.setTextColor(...red)
    doc.setFontSize(10)
    doc.text(`Campanha: ${campaign.name}`, pageWidth / 2, y, { align: "center" })
    y += 7
  }

  // Player name at bottom
  doc.setTextColor(...mutedText)
  doc.setFontSize(9)
  doc.text(`Jogador: ${sheet.playerName}`, pageWidth / 2, y + 10, { align: "center" })

  // Footer
  doc.setTextColor(60, 30, 30)
  doc.setFontSize(7)
  doc.text("Criador de Personagens D&D 5e", pageWidth / 2, pageHeight - 15, { align: "center" })

  // ===================== PAGE 2: STATS =====================
  doc.addPage()
  drawBackground()
  y = 15

  // Section: Core Stats
  y = drawSectionTitle("Estatísticas Principais", y)

  const hp = calculateHP(sheet)
  const ac = calculateAC(sheet)
  const prof = getProficiencyBonus(sheet.level)

  const statBoxW = (contentWidth - 8) / 3
  const acSub = sheet.equippedArmor ? sheet.equippedArmor.name : "10 + DES"
  const coreStats = [
    { label: "PONTOS DE VIDA", value: `${hp}`, sub: sheet.class ? `${sheet.class.hitDie} + CON` : "" },
    { label: "CLASSE DE ARMADURA", value: `${ac}`, sub: acSub },
    { label: "BÔNUS DE PROFICIÊNCIA", value: `+${prof}`, sub: `Nível ${sheet.level}` },
  ]

  coreStats.forEach((stat, i) => {
    const x = margin + i * (statBoxW + 4)
    doc.setFillColor(...darkCard)
    doc.roundedRect(x, y, statBoxW, 22, 2, 2, "F")

    doc.setTextColor(...lightText)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text(stat.value, x + statBoxW / 2, y + 10, { align: "center" })

    doc.setTextColor(...gold)
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.text(stat.label, x + statBoxW / 2, y + 16, { align: "center" })

    doc.setTextColor(...mutedText)
    doc.setFontSize(6)
    doc.setFont("helvetica", "normal")
    doc.text(stat.sub, x + statBoxW / 2, y + 20, { align: "center" })
  })

  y += 28

  // Section: Attributes
  y = drawSectionTitle("Atributos", y)

  const attrBoxW = (contentWidth - 10) / 3
  const attrBoxH = 22

  ATTRIBUTES.forEach((attr, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    const x = margin + col * (attrBoxW + 5)
    const boxY = y + row * (attrBoxH + 4)

    doc.setFillColor(...darkCard)
    doc.roundedRect(x, boxY, attrBoxW, attrBoxH, 2, 2, "F")

    // Label
    doc.setTextColor(...gold)
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.text(attr.toUpperCase(), x + 4, boxY + 6)

    const val = sheet.attributes[attr]
    const mod = getModifier(val)
    const raceBonus = sheet.race?.bonuses[attr] || 0

    // Value
    doc.setTextColor(...lightText)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text(`${val}`, x + attrBoxW / 2, boxY + 16, { align: "center" })

    // Modifier
    const modColor: [number, number, number] = mod >= 0 ? lightRed : [200, 60, 60]
    doc.setTextColor(...modColor)
    doc.setFontSize(9)
    doc.text(formatModifier(mod), x + attrBoxW - 6, boxY + 16, { align: "right" })

    // Race bonus
    if (raceBonus > 0) {
      doc.setTextColor(...mutedText)
      doc.setFontSize(6)
      doc.text(`(+${raceBonus} raça)`, x + 4, boxY + 19)
    }
  })

  y += 2 * (attrBoxH + 4) + 6

  // Section: Race details
  if (sheet.race) {
    y = drawSectionTitle(`Raça: ${sheet.race.name}`, y)
    checkPageBreak(40)

    // Load race image
    const raceImg = await loadImageAsBase64(sheet.race.image)
    if (raceImg) {
      try {
        doc.addImage(raceImg, "JPEG", margin, y, 30, 30)
      } catch { /* image load fail */ }
    }

    const rTextX = raceImg ? margin + 35 : margin + 6
    const rTextW = raceImg ? contentWidth - 40 : contentWidth - 12

    doc.setFillColor(...darkCard)
    const raceDescLines = doc.splitTextToSize(sheet.race.description, rTextW)
    const raceTraitsH = sheet.race.traits.length * 4 + 4
    const raceBoxH = Math.max(30, 8 + raceDescLines.length * 4 + raceTraitsH)
    doc.roundedRect(raceImg ? margin + 33 : margin, y, raceImg ? contentWidth - 33 : contentWidth, raceBoxH, 2, 2, "F")

    doc.setTextColor(...lightText)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(raceDescLines, rTextX + 3, y + 5)
    let raceY = y + 5 + raceDescLines.length * 4 + 2

    doc.setTextColor(...gold)
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.text("Tracos Raciais:", rTextX + 3, raceY)
    raceY += 4

    doc.setTextColor(...lightText)
    doc.setFont("helvetica", "normal")
    sheet.race.traits.forEach((trait) => {
      doc.text(`- ${trait}`, rTextX + 5, raceY)
      raceY += 4
    })

    y += raceBoxH + 4
  }

  // Section: Class details
  if (sheet.class) {
    checkPageBreak(40)
    y = drawSectionTitle(`Classe: ${sheet.class.name}`, y)

    // Load class image
    let classImg: string | null = null
    try {
      classImg = await loadImageAsBase64(sheet.class.image)
      if (classImg) {
        doc.addImage(classImg, "JPEG", margin, y, 30, 30)
      }
    } catch { /* image load fail */ }

    const textX = classImg ? margin + 35 : margin + 6
    const textW = classImg ? contentWidth - 40 : contentWidth - 12

    doc.setFillColor(...darkCard)
    doc.roundedRect(classImg ? margin + 33 : margin, y, classImg ? contentWidth - 33 : contentWidth, 30, 2, 2, "F")

    doc.setTextColor(...lightText)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    const classDescLines = doc.splitTextToSize(sheet.class.description, textW)
    doc.text(classDescLines, textX + 3, y + 5)

    doc.setTextColor(...gold)
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.text(`Dado de Vida: ${sheet.class.hitDie}`, textX + 3, y + 14)

    doc.setTextColor(...lightText)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.text(`Habilidades: ${sheet.class.abilities.join(", ")}`, textX + 3, y + 19)
    doc.text(`Proficiências: ${sheet.class.proficiencies.join(", ").substring(0, 60)}...`, textX + 3, y + 24)

    y += 36
  }

  // ===================== PAGE 3: PERSONALITY & EQUIPMENT =====================
  checkPageBreak(60)

  // Section: Background and Personality
  if (sheet.background) {
    y = drawSectionTitle(`Antecedente: ${sheet.background.name}`, y)

    doc.setFillColor(...darkCard)
    const bgDescLines = doc.splitTextToSize(sheet.background.description, contentWidth - 12)
    doc.roundedRect(margin, y, contentWidth, 8 + bgDescLines.length * 4, 2, 2, "F")
    doc.setTextColor(...lightText)
    doc.setFontSize(8)
    doc.text(bgDescLines, margin + 6, y + 5)
    y += 8 + bgDescLines.length * 4 + 4
  }

  if (sheet.personalityTrait || sheet.ideal || sheet.bond || sheet.flaw) {
    checkPageBreak(50)
    y = drawSectionTitle("Personalidade", y)

    const personality = [
      { label: "Traço de Personalidade", value: sheet.personalityTrait },
      { label: "Ideal", value: sheet.ideal },
      { label: "Vínculo", value: sheet.bond },
      { label: "Defeito", value: sheet.flaw },
    ].filter((p) => p.value)

    personality.forEach((p) => {
      const lines = doc.splitTextToSize(p.value, contentWidth - 16)
      const boxH = 10 + lines.length * 4
      checkPageBreak(boxH + 4)

      doc.setFillColor(...darkCard)
      doc.roundedRect(margin, y, contentWidth, boxH, 2, 2, "F")

      doc.setTextColor(...gold)
      doc.setFontSize(7)
      doc.setFont("helvetica", "bold")
      doc.text(p.label.toUpperCase(), margin + 6, y + 5)

      doc.setTextColor(...lightText)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text(lines, margin + 6, y + 10)

      y += boxH + 3
    })
  }

  // Section: Armor
  if (sheet.equippedArmor || sheet.equippedShield) {
    checkPageBreak(25)
    y = drawSectionTitle("Armadura", y)

    doc.setFillColor(...darkCard)
    const armorBoxH = 18
    doc.roundedRect(margin, y, contentWidth, armorBoxH, 2, 2, "F")

    let armorX = margin + 6
    if (sheet.equippedArmor) {
      doc.setTextColor(...gold)
      doc.setFontSize(7)
      doc.setFont("helvetica", "bold")
      doc.text("ARMADURA:", armorX, y + 6)
      doc.setTextColor(...lightText)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text(`${sheet.equippedArmor.name} (${sheet.equippedArmor.category})`, armorX + 25, y + 6)
      doc.setTextColor(...mutedText)
      doc.setFontSize(7)
      doc.text(`CA ${sheet.equippedArmor.acBase} | ${sheet.equippedArmor.weight} kg | ${sheet.equippedArmor.price}`, armorX, y + 12)
      if (sheet.equippedArmor.stealthDisadvantage) {
        doc.setTextColor(...red)
        doc.text("Desvantagem em Furtividade", armorX, y + 16)
      }
    }

    if (sheet.equippedShield) {
      const shieldX = sheet.equippedArmor ? armorX + 100 : armorX
      doc.setTextColor(...gold)
      doc.setFontSize(7)
      doc.setFont("helvetica", "bold")
      doc.text("ESCUDO:", shieldX, y + 6)
      doc.setTextColor(...lightText)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text(`+2 CA | ${sheet.equippedShield.weight} kg`, shieldX + 20, y + 6)
    }

    y += armorBoxH + 4
  }

  // Section: Weapons
  if (sheet.equippedWeapons && sheet.equippedWeapons.length > 0) {
    checkPageBreak(15 + sheet.equippedWeapons.length * 6)
    y = drawSectionTitle("Armas", y)

    doc.setFillColor(...darkCard)
    const wH = 6 + sheet.equippedWeapons.length * 6
    doc.roundedRect(margin, y, contentWidth, wH, 2, 2, "F")

    sheet.equippedWeapons.forEach((weapon, i) => {
      const wy = y + 5 + i * 6
      doc.setTextColor(...lightText)
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.text(weapon.name, margin + 6, wy)

      doc.setTextColor(...gold)
      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.text(weapon.damage, margin + 60, wy)

      doc.setTextColor(...mutedText)
      doc.setFontSize(6)
      doc.text(`${weapon.weight}kg | ${weapon.properties !== "-" ? weapon.properties : ""}`, margin + 90, wy)
    })

    y += wH + 4
  }

  // Section: Money
  if (sheet.money && (sheet.money.PC > 0 || sheet.money.PP > 0 || sheet.money.PE > 0 || sheet.money.PO > 0 || sheet.money.PL > 0)) {
    checkPageBreak(20)
    y = drawSectionTitle("Dinheiro", y)

    doc.setFillColor(...darkCard)
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, "F")

    const coinTypes = [
      { key: "PC", label: "Cobre", value: sheet.money.PC },
      { key: "PP", label: "Prata", value: sheet.money.PP },
      { key: "PE", label: "Electro", value: sheet.money.PE },
      { key: "PO", label: "Ouro", value: sheet.money.PO },
      { key: "PL", label: "Platina", value: sheet.money.PL },
    ].filter(c => c.value > 0)

    const coinSpacing = contentWidth / (coinTypes.length + 1)
    coinTypes.forEach((coin, i) => {
      const cx = margin + (i + 1) * coinSpacing
      doc.setTextColor(...gold)
      doc.setFontSize(7)
      doc.setFont("helvetica", "bold")
      doc.text(coin.key, cx - 5, y + 5)
      doc.setTextColor(...lightText)
      doc.setFontSize(10)
      doc.text(`${coin.value}`, cx - 5, y + 10)
    })

    y += 16
  }

  // Section: Carry Weight
  {
    checkPageBreak(18)
    y = drawSectionTitle("Carga", y)

    const strScore = sheet.attributes["Força"] || 10
    const currentWt = calculateEquipmentWeight(sheet)
    const capacity = getCarryCapacity(strScore)
    const category = getCarryCategory(currentWt, strScore)

    doc.setFillColor(...darkCard)
    doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "F")

    doc.setTextColor(...gold)
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.text("CATEGORIA:", margin + 6, y + 6)

    const catColor: [number, number, number] = category === "Leve" ? [100, 200, 100] :
      category === "Media" ? [200, 200, 100] :
      category === "Pesada" ? [200, 150, 50] : [200, 60, 60]
    doc.setTextColor(...catColor)
    doc.text(category, margin + 32, y + 6)

    doc.setTextColor(...lightText)
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.text(`${currentWt} / ${capacity.max} kg`, margin + 6, y + 11)
    doc.setTextColor(...mutedText)
    doc.text(`Leve: ${capacity.light}kg | Media: ${capacity.medium}kg | Max: ${capacity.max}kg`, margin + 50, y + 11)

    y += 18
  }

  // Section: Equipment
  if (sheet.equipment.length > 0) {
    checkPageBreak(20 + sheet.equipment.length * 5)
    y = drawSectionTitle("Equipamentos", y)

    doc.setFillColor(...darkCard)
    const eqH = 6 + sheet.equipment.length * 5
    doc.roundedRect(margin, y, contentWidth, eqH, 2, 2, "F")

    doc.setTextColor(...lightText)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    sheet.equipment.forEach((item, i) => {
      doc.setTextColor(...gold)
      doc.text("-", margin + 6, y + 5 + i * 5)
      doc.setTextColor(...lightText)
      doc.text(item, margin + 10, y + 5 + i * 5)
    })

    y += eqH + 4
  }

  // Section: Tools
  if (sheet.selectedTools && sheet.selectedTools.length > 0) {
    checkPageBreak(15 + sheet.selectedTools.length * 5)
    y = drawSectionTitle("Ferramentas", y)

    doc.setFillColor(...darkCard)
    const tH = 6 + sheet.selectedTools.length * 5
    doc.roundedRect(margin, y, contentWidth, tH, 2, 2, "F")

    sheet.selectedTools.forEach((tool, i) => {
      const ty = y + 5 + i * 5
      doc.setTextColor(...gold)
      doc.setFontSize(7)
      doc.text("-", margin + 6, ty)
      doc.setTextColor(...lightText)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text(tool.name, margin + 10, ty)
      doc.setTextColor(...mutedText)
      doc.setFontSize(6)
      doc.text(`${tool.price}${tool.weight > 0 ? ` | ${tool.weight}kg` : ""}`, margin + 90, ty)
    })

    y += tH + 4
  }

  // Section: Languages
  {
    const raceLanguages = sheet.race?.languages || []
    const extraLanguages = sheet.selectedLanguages || []
    const allLangs = [...raceLanguages, ...extraLanguages]

    if (allLangs.length > 0) {
      checkPageBreak(14)
      y = drawSectionTitle("Idiomas", y)

      doc.setFillColor(...darkCard)
      doc.roundedRect(margin, y, contentWidth, 10, 2, 2, "F")

      doc.setTextColor(...lightText)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text(allLangs.join(", "), margin + 6, y + 6)

      y += 14
    }
  }

  // Section: Appearance
  if (sheet.age || sheet.height || sheet.weight || sheet.appearance) {
    checkPageBreak(30)
    y = drawSectionTitle("Aparência e Detalhes", y)

    const details: string[] = []
    if (sheet.age) details.push(`Idade: ${sheet.age}`)
    if (sheet.height) details.push(`Altura: ${sheet.height}`)
    if (sheet.weight) details.push(`Peso: ${sheet.weight}`)

    if (details.length > 0) {
      doc.setFillColor(...darkCard)
      doc.roundedRect(margin, y, contentWidth, 10, 2, 2, "F")
      doc.setTextColor(...lightText)
      doc.setFontSize(8)
      doc.text(details.join("   |   "), margin + 6, y + 6)
      y += 14
    }

    if (sheet.appearance) {
      const appLines = doc.splitTextToSize(sheet.appearance, contentWidth - 12)
      const appH = 6 + appLines.length * 4
      checkPageBreak(appH)
      doc.setFillColor(...darkCard)
      doc.roundedRect(margin, y, contentWidth, appH, 2, 2, "F")
      doc.setTextColor(...lightText)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text(appLines, margin + 6, y + 5)
      y += appH + 4
    }
  }

  // Section: Relationships
  const hasRelationships =
    sheet.family.length > 0 ||
    sheet.friends.length > 0 ||
    sheet.mascot ||
    sheet.mortalEnemy ||
    sheet.city ||
    sheet.passion

  if (hasRelationships) {
    checkPageBreak(20)
    y = drawSectionTitle("Relacionamentos e Vida", y)

    // City
    if (sheet.city) {
      checkPageBreak(12)
      doc.setFillColor(...darkCard)
      doc.roundedRect(margin, y, contentWidth, 10, 2, 2, "F")
      doc.setTextColor(...gold)
      doc.setFontSize(7)
      doc.setFont("helvetica", "bold")
      doc.text("CIDADE:", margin + 6, y + 6)
      doc.setTextColor(...lightText)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text(sheet.city, margin + 28, y + 6)
      y += 14
    }

    // Passion
    if (sheet.passion) {
      checkPageBreak(12)
      doc.setFillColor(...darkCard)
      doc.roundedRect(margin, y, contentWidth, 10, 2, 2, "F")
      doc.setTextColor(...gold)
      doc.setFontSize(7)
      doc.setFont("helvetica", "bold")
      doc.text("PAIXAO:", margin + 6, y + 6)
      doc.setTextColor(...lightText)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text(sheet.passion, margin + 28, y + 6)
      y += 14
    }

    // Mascot
    if (sheet.mascot && sheet.mascot.name) {
      checkPageBreak(20)
      const mascotBoxH = sheet.mascot.image ? 18 : 10
      doc.setFillColor(...darkCard)
      doc.roundedRect(margin, y, contentWidth, mascotBoxH, 2, 2, "F")

      let mascotTextX = margin + 6
      if (sheet.mascot.image) {
        try {
          const mascotImg = sheet.mascot.image.startsWith("data:") ? sheet.mascot.image : await loadImageAsBase64(sheet.mascot.image)
          if (mascotImg) {
            doc.addImage(mascotImg, "JPEG", margin + 2, y + 1, 16, 16)
            mascotTextX = margin + 22
          }
        } catch { /* image fail */ }
      }

      doc.setTextColor(...gold)
      doc.setFontSize(7)
      doc.setFont("helvetica", "bold")
      doc.text("MASCOTE:", mascotTextX, y + 6)
      doc.setTextColor(...lightText)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text(
        `${sheet.mascot.name}${sheet.mascot.description ? ` - ${sheet.mascot.description}` : ""}`,
        mascotTextX + 22,
        y + 6
      )
      y += mascotBoxH + 4
    }

    // Mortal Enemy
    if (sheet.mortalEnemy && sheet.mortalEnemy.name) {
      checkPageBreak(20)
      const enemyBoxH = sheet.mortalEnemy.image ? 18 : 10
      doc.setFillColor(...darkCard)
      doc.roundedRect(margin, y, contentWidth, enemyBoxH, 2, 2, "F")

      let enemyTextX = margin + 6
      if (sheet.mortalEnemy.image) {
        try {
          const enemyImg = sheet.mortalEnemy.image.startsWith("data:") ? sheet.mortalEnemy.image : await loadImageAsBase64(sheet.mortalEnemy.image)
          if (enemyImg) {
            doc.addImage(enemyImg, "JPEG", margin + 2, y + 1, 16, 16)
            enemyTextX = margin + 22
          }
        } catch { /* image fail */ }
      }

      doc.setTextColor(...red)
      doc.setFontSize(7)
      doc.setFont("helvetica", "bold")
      doc.text("INIMIGO MORTAL:", enemyTextX, y + 6)
      doc.setTextColor(...lightText)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text(
        `${sheet.mortalEnemy.name}${sheet.mortalEnemy.description ? ` - ${sheet.mortalEnemy.description}` : ""}`,
        enemyTextX + 38,
        y + 6
      )
      y += enemyBoxH + 4
    }

    // Family
    if (sheet.family.length > 0) {
      checkPageBreak(10 + sheet.family.length * 8)
      doc.setTextColor(...gold)
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.text("Familia:", margin, y)
      y += 5

      for (const member of sheet.family) {
        checkPageBreak(14)
        const memberBoxH = member.image ? 14 : 8
        doc.setFillColor(...darkCard)
        doc.roundedRect(margin, y, contentWidth, memberBoxH, 2, 2, "F")

        let memTextX = margin + 4
        if (member.image) {
          try {
            const memImg = member.image.startsWith("data:") ? member.image : await loadImageAsBase64(member.image)
            if (memImg) {
              doc.addImage(memImg, "JPEG", margin + 2, y + 1, 12, 12)
              memTextX = margin + 18
            }
          } catch { /* image fail */ }
        }

        doc.setTextColor(...gold)
        doc.setFontSize(7)
        doc.setFont("helvetica", "bold")
        doc.text(member.relationship || "Familiar", memTextX, y + 5)

        if (member.isUnknown) {
          doc.setTextColor(...mutedText)
          doc.setFontSize(7)
          doc.setFont("helvetica", "italic")
          doc.text("Identidade desconhecida", memTextX + 26, y + 5)
        } else {
          doc.setTextColor(...lightText)
          doc.setFontSize(7)
          doc.setFont("helvetica", "normal")
          const info = [member.name, member.age ? `${member.age} anos` : "", member.description]
            .filter(Boolean)
            .join(" - ")
          doc.text(info, memTextX + 26, y + 5)
        }

        y += memberBoxH + 2
      }
      y += 4
    }

    // Friends
    if (sheet.friends.length > 0) {
      checkPageBreak(10 + sheet.friends.length * 8)
      doc.setTextColor(...gold)
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.text("Amigos:", margin, y)
      y += 5

      sheet.friends.forEach((friend) => {
        checkPageBreak(10)
        doc.setFillColor(...darkCard)
        doc.roundedRect(margin, y, contentWidth, 8, 2, 2, "F")
        doc.setTextColor(...lightText)
        doc.setFontSize(7)
        doc.setFont("helvetica", "normal")
        const info = [friend.name, friend.description].filter(Boolean).join(" - ")
        doc.text(info, margin + 4, y + 5)
        y += 10
      })
    }
  }

  // Save
  doc.save(`${sheet.name || "personagem"}-ficha.pdf`)
}
