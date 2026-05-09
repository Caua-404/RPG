import { NextResponse } from "next/server"
import { requireApiSession } from "@/lib/api-session"
import { prisma } from "@/lib/prisma"
import { badRequest, forbidden, unauthorized, serverError } from "@/lib/security/responses"
import { unblockUserById } from "@/lib/repositories/user-repository"

export async function POST(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSession()
    if (!session) return unauthorized()
    if (session.role !== "mestre") return forbidden()

    const { id } = await ctx.params
    const userId = Number(id)
    if (!Number.isFinite(userId)) return badRequest("ID inválido.")

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    })
    if (!existing) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 })
    if (existing.role !== "jogador") {
      return NextResponse.json({ error: "Apenas jogadores podem ser desbloqueados nesta tela." }, { status: 400 })
    }

    await unblockUserById(userId)
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch {
    return serverError()
  }
}
