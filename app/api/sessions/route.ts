import { NextResponse } from "next/server"
import { z } from "zod"
import { requireApiSession } from "@/lib/api-session"
import { prisma } from "@/lib/prisma"
import { badRequest, forbidden, unauthorized, serverError, tooManyRequests } from "@/lib/security/responses"
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit"

const createSchema = z.object({
  title: z.string().min(3, "Informe um título (mín. 3).").max(190),
  description: z.string().max(5000).optional(),
  style: z.enum(["acao", "terror", "comedia", "drama", "fantasia", "misterio", "outro"]),
  startAt: z.string().min(1),
  initialLevel: z.number().int().min(1).max(20),
  worldRestrictions: z.string().max(10000).optional(),
  allowedUserIds: z.array(z.number().int().positive()).default([]),
})

export async function GET() {
  const session = await requireApiSession()
  if (!session) return unauthorized()

  if (session.role === "mestre") {
    const sessions = await prisma.session.findMany({
      where: { masterUserId: Number(session.sub) },
      orderBy: { startAt: "asc" },
      select: {
        id: true,
        masterUserId: true,
        title: true,
        description: true,
        style: true,
        startAt: true,
        initialLevel: true,
        worldRestrictions: true,
        coverImageUrl: true,
      },
    })
    return NextResponse.json({ ok: true, sessions }, { status: 200 })
  }

  const access = await prisma.sessionAccess.findMany({
    where: { userId: Number(session.sub) },
    orderBy: { session: { startAt: "asc" } },
    select: {
      session: {
        select: {
          id: true,
          masterUserId: true,
          title: true,
          description: true,
          style: true,
          startAt: true,
          initialLevel: true,
          worldRestrictions: true,
          coverImageUrl: true,
        },
      },
    },
  })

  return NextResponse.json({ ok: true, sessions: access.map((a) => a.session) }, { status: 200 })
}

export async function POST(req: Request) {
  try {
    const session = await requireApiSession()
    if (!session) return unauthorized()
    if (session.role !== "mestre") return forbidden()

    const limiter = checkRateLimit({
      key: `create-session:${getClientIp(req)}`,
      limit: 15,
      windowMs: 60_000,
    })
    if (!limiter.allowed) return tooManyRequests()

    const parsed = createSchema.safeParse(await req.json())
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos.")

    const startAt = new Date(parsed.data.startAt)
    if (Number.isNaN(startAt.getTime())) return badRequest("Data de início inválida.")

    const created = await prisma.session.create({
      data: {
        masterUserId: Number(session.sub),
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        style: parsed.data.style,
        startAt,
        initialLevel: parsed.data.initialLevel,
        worldRestrictions: parsed.data.worldRestrictions ?? null,
      },
      select: { id: true },
    })
    const sessionId = created.id
    const uniqueAllowed = Array.from(new Set(parsed.data.allowedUserIds)).filter((n) => Number.isFinite(n))

    if (uniqueAllowed.length) {
      await prisma.sessionAccess.createMany({
        data: uniqueAllowed.map((uid) => ({ sessionId, userId: uid })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json({ ok: true, id: sessionId }, { status: 201 })
  } catch {
    return serverError()
  }
}

