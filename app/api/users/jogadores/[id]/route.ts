import { NextResponse } from "next/server"
import { z } from "zod"
import { requireApiSession } from "@/lib/api-session"
import { prisma } from "@/lib/prisma"
import { badRequest, forbidden, unauthorized, serverError } from "@/lib/security/responses"

const updateRoleSchema = z.object({
  role: z.enum(["mestre", "jogador"]),
})

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSession()
    if (!session) return unauthorized()
    if (session.role !== "mestre") return forbidden()

    const { id } = await ctx.params
    const userId = Number(id)
    if (!Number.isFinite(userId)) return badRequest("ID inválido.")

    const parsed = updateRoleSchema.safeParse(await req.json())
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos.")

    if (Number(session.sub) === userId) {
      return NextResponse.json({ error: "Você não pode alterar seu próprio cargo." }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: parsed.data.role },
      select: { id: true },
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error("PATCH /api/users/jogadores/[id] failed:", err)
    return serverError()
  }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSession()
    if (!session) return unauthorized()
    if (session.role !== "mestre") return forbidden()

    const { id } = await ctx.params
    const userId = Number(id)
    if (!Number.isFinite(userId)) return badRequest("ID inválido.")

    if (Number(session.sub) === userId) {
      return NextResponse.json({ error: "Você não pode deletar seu próprio usuário." }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    })
    if (!existing) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 })
    if (existing.role !== "jogador") {
      return NextResponse.json({ error: "Por segurança, apenas jogadores podem ser deletados por aqui." }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: userId },
      select: { id: true },
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error("DELETE /api/users/jogadores/[id] failed:", err)
    return serverError()
  }
}

