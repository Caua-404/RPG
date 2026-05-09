import { requireApiSession } from "@/lib/api-session"
import { prisma } from "@/lib/prisma"

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireApiSession()
  if (!session) return new Response("Não autorizado.", { status: 401 })

  const { id } = await ctx.params
  const targetId = Number(id)
  if (!Number.isFinite(targetId)) return new Response("ID inválido.", { status: 400 })

  const myId = Number(session.sub)
  if (session.role !== "mestre" && myId !== targetId) {
    return new Response("Acesso negado.", { status: 403 })
  }

  const user = await prisma.user.findUnique({
    where: { id: targetId },
    select: { avatarData: true, avatarMimeType: true },
  })
  if (!user?.avatarData || !user.avatarMimeType) {
    return new Response("Sem foto.", { status: 404 })
  }

  return new Response(Buffer.from(user.avatarData), {
    status: 200,
    headers: {
      "Content-Type": user.avatarMimeType,
      "Cache-Control": "private, no-store, max-age=0",
      Pragma: "no-cache",
    },
  })
}

