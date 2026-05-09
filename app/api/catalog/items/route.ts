import { NextResponse } from "next/server"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireApiSession } from "@/lib/api-session"
import { badRequest, forbidden, unauthorized, serverError, tooManyRequests } from "@/lib/security/responses"
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit"
import { slugify } from "@/lib/slug"

const createSchema = z.object({
  name: z.string().min(2).max(120),
  type: z.string().min(2).max(60),
  category: z.string().max(60).optional(),
  rarity: z.string().max(60).optional(),
  weight: z.number().min(0).max(10_000).optional(),
  value: z.number().int().min(0).max(1_000_000).optional(),
  description: z.string().max(10_000).optional(),
  damage: z.string().max(40).optional(),
  damageType: z.string().max(40).optional(),
  armorClass: z.number().int().min(0).max(50).optional(),
  dexterityModifier: z.string().max(40).optional(),
  stealthDisadvantage: z.boolean().optional(),
  properties: z.string().max(500).optional(),
})

export async function GET() {
  const session = await requireApiSession()
  if (!session) return unauthorized()

  const items = await prisma.item.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      type: true,
      category: true,
      rarity: true,
      weight: true,
      value: true,
      description: true,
      damage: true,
      damageType: true,
      armorClass: true,
      dexterityModifier: true,
      stealthDisadvantage: true,
      properties: true,
    },
  })

  return NextResponse.json({ ok: true, items }, { status: 200 })
}

export async function POST(req: Request) {
  try {
    const session = await requireApiSession()
    if (!session) return unauthorized()
    if (session.role !== "mestre") return forbidden()

    const limiter = checkRateLimit({
      key: `catalog:create-item:${getClientIp(req)}`,
      limit: 120,
      windowMs: 60_000,
    })
    if (!limiter.allowed) return tooManyRequests()

    const parsed = createSchema.safeParse(await req.json())
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos.")

    const slug = slugify(parsed.data.name)
    if (!slug) return badRequest("Nome inválido para gerar slug.")

    const created = await prisma.item.create({
      data: {
        slug,
        name: parsed.data.name,
        type: parsed.data.type,
        category: parsed.data.category ?? null,
        rarity: parsed.data.rarity ?? null,
        weight: parsed.data.weight ?? null,
        value: parsed.data.value ?? null,
        description: parsed.data.description ?? null,
        damage: parsed.data.damage ?? null,
        damageType: parsed.data.damageType ?? null,
        armorClass: parsed.data.armorClass ?? null,
        dexterityModifier: parsed.data.dexterityModifier ?? null,
        stealthDisadvantage: parsed.data.stealthDisadvantage ?? null,
        properties: parsed.data.properties ?? null,
      },
      select: { id: true },
    })

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return badRequest("Já existe um item com esse nome/slug.")
    }
    return serverError()
  }
}

