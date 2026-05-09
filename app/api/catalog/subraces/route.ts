import { NextResponse } from "next/server"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireApiSession } from "@/lib/api-session"
import { badRequest, forbidden, unauthorized, serverError, tooManyRequests } from "@/lib/security/responses"
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit"
import { slugify } from "@/lib/slug"

const createSchema = z.object({
  raceId: z.number().int().positive(),
  name: z.string().min(2).max(80),
  description: z.string().max(5000).optional(),
  features: z.array(z.string().min(1).max(500)).optional(),
})

export async function GET() {
  const session = await requireApiSession()
  if (!session) return unauthorized()

  const subraces = await prisma.subrace.findMany({
    orderBy: [{ race: { name: "asc" } }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      features: true,
      race: { select: { id: true, name: true, slug: true } },
    },
  })

  return NextResponse.json({ ok: true, subraces }, { status: 200 })
}

export async function POST(req: Request) {
  try {
    const session = await requireApiSession()
    if (!session) return unauthorized()
    if (session.role !== "mestre") return forbidden()

    const limiter = checkRateLimit({
      key: `catalog:create-subrace:${getClientIp(req)}`,
      limit: 60,
      windowMs: 60_000,
    })
    if (!limiter.allowed) return tooManyRequests()

    const parsed = createSchema.safeParse(await req.json())
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos.")

    const race = await prisma.race.findUnique({ where: { id: parsed.data.raceId }, select: { id: true, slug: true } })
    if (!race) return badRequest("Raça não encontrada.")

    const base = `${race.slug}-${parsed.data.name}`
    const slug = slugify(base)
    if (!slug) return badRequest("Nome inválido para gerar slug.")

    const created = await prisma.subrace.create({
      data: {
        raceId: parsed.data.raceId,
        slug,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        features: parsed.data.features ?? undefined,
      },
      select: { id: true },
    })

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return badRequest("Já existe uma sub-raça com esse nome/slug para essa raça.")
    }
    return serverError()
  }
}

