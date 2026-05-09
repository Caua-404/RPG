import { NextResponse } from "next/server"
import { requireApiSession } from "@/lib/api-session"
import { prisma } from "@/lib/prisma"
import { badRequest, forbidden, unauthorized } from "@/lib/security/responses"

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApiSession()
  if (!session) return unauthorized()

  const { id } = await ctx.params
  const sessionId = Number(id)
  if (!Number.isFinite(sessionId)) return badRequest("Identificador inválido.")

  const s = await prisma.session.findUnique({
    where: { id: sessionId },
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
  if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const uid = Number(session.sub)
  if (session.role === "mestre") {
    if (s.masterUserId !== uid) return forbidden()
  } else {
    const access = await prisma.sessionAccess.findUnique({
      where: { sessionId_userId: { sessionId, userId: uid } },
      select: { sessionId: true },
    })
    if (!access) return forbidden()
  }

  return NextResponse.json({ ok: true, session: s }, { status: 200 })
}

