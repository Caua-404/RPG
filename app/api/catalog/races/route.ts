import { NextResponse } from "next/server"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireApiSession } from "@/lib/api-session"
import { badRequest, forbidden, unauthorized, serverError, tooManyRequests } from "@/lib/security/responses"
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit"
import { slugify } from "@/lib/slug"

const createSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(5000).optional(),
  speed: z.number().int().min(0).max(120).optional(),
  size: z.string().max(40).optional(),
  ageDescription: z.string().max(2000).optional(),
  languages: z.array(z.string().min(1).max(60)).optional(),
  features: z.array(z.string().min(1).max(500)).optional(),
  bonuses: z
    .array(
      z.object({
        attribute: z.string().min(2).max(40),
        bonusValue: z.number().int().min(-10).max(10),
      }),
    )
    .optional(),
})

export async function GET() {
  const session = await requireApiSession()
  if (!session) return unauthorized()

  const races = await prisma.race.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      speed: true,
      size: true,
      ageDescription: true,
      languages: true,
      features: true,
      bonuses: { select: { attribute: true, bonusValue: true } },
      subraces: { select: { id: true, slug: true, name: true } },
    },
  })

  return NextResponse.json({ ok: true, races }, { status: 200 })
}

export async function POST(req: Request) {
  try {
    const session = await requireApiSession()
    if (!session) return unauthorized()
    if (session.role !== "mestre") return forbidden()

    const limiter = checkRateLimit({
      key: `catalog:create-race:${getClientIp(req)}`,
      limit: 30,
      windowMs: 60_000,
    })
    if (!limiter.allowed) return tooManyRequests()

    const parsed = createSchema.safeParse(await req.json())
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos.")

    const slug = slugify(parsed.data.name)
    if (!slug) return badRequest("Nome inválido para gerar slug.")

    const created = await prisma.race.create({
      data: {
        slug,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        speed: parsed.data.speed ?? 30,
        size: parsed.data.size ?? null,
        ageDescription: parsed.data.ageDescription ?? null,
        languages: parsed.data.languages ?? undefined,
        features: parsed.data.features ?? undefined,
        bonuses: parsed.data.bonuses?.length
          ? {
              createMany: {
                data: parsed.data.bonuses.map((b) => ({ attribute: b.attribute, bonusValue: b.bonusValue })),
              },
            }
          : undefined,
      },
      select: { id: true },
    })

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return badRequest("Já existe uma raça com esse nome/slug.")
    }
    return serverError()
  }
}

