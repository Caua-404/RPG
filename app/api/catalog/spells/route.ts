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
  level: z.number().int().min(0).max(9),
  school: z.string().min(2).max(60),
  castingTime: z.string().max(80).optional(),
  range: z.string().max(80).optional(),
  duration: z.string().max(80).optional(),
  components: z.string().max(80).optional(),
  description: z.string().max(20_000).optional(),
  damage: z.string().max(40).optional(),
  damageType: z.string().max(40).optional(),
  concentration: z.boolean().optional(),
  ritual: z.boolean().optional(),
  savingThrow: z.string().max(60).optional(),
})

export async function GET() {
  const session = await requireApiSession()
  if (!session) return unauthorized()

  const spells = await prisma.spell.findMany({
    orderBy: [{ level: "asc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      level: true,
      school: true,
      castingTime: true,
      range: true,
      duration: true,
      components: true,
      description: true,
      damage: true,
      damageType: true,
      concentration: true,
      ritual: true,
      savingThrow: true,
    },
  })

  return NextResponse.json({ ok: true, spells }, { status: 200 })
}

export async function POST(req: Request) {
  try {
    const session = await requireApiSession()
    if (!session) return unauthorized()
    if (session.role !== "mestre") return forbidden()

    const limiter = checkRateLimit({
      key: `catalog:create-spell:${getClientIp(req)}`,
      limit: 120,
      windowMs: 60_000,
    })
    if (!limiter.allowed) return tooManyRequests()

    const parsed = createSchema.safeParse(await req.json())
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos.")

    const slug = slugify(parsed.data.name)
    if (!slug) return badRequest("Nome inválido para gerar slug.")

    const created = await prisma.spell.create({
      data: {
        slug,
        name: parsed.data.name,
        level: parsed.data.level,
        school: parsed.data.school,
        castingTime: parsed.data.castingTime ?? null,
        range: parsed.data.range ?? null,
        duration: parsed.data.duration ?? null,
        components: parsed.data.components ?? null,
        description: parsed.data.description ?? null,
        damage: parsed.data.damage ?? null,
        damageType: parsed.data.damageType ?? null,
        concentration: parsed.data.concentration ?? false,
        ritual: parsed.data.ritual ?? false,
        savingThrow: parsed.data.savingThrow ?? null,
      },
      select: { id: true },
    })

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return badRequest("Já existe uma magia com esse nome/slug.")
    }
    return serverError()
  }
}

