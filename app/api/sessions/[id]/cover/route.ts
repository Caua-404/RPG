import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import { randomUUID } from "crypto"
import { requireApiSession } from "@/lib/api-session"
import { prisma } from "@/lib/prisma"
import { badRequest, forbidden, unauthorized, serverError } from "@/lib/security/responses"

export const runtime = "nodejs"

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSession()
    if (!session) return unauthorized()
    if (session.role !== "mestre") return forbidden()

    const { id } = await ctx.params
    const sessionId = Number(id)
    if (!Number.isFinite(sessionId)) return badRequest("Identificador inválido.")

    const s = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { masterUserId: true },
    })
    if (!s) return NextResponse.json({ error: "Sessão não encontrada." }, { status: 404 })
    if (s.masterUserId !== Number(session.sub)) return forbidden()

    const form = await req.formData()
    const file = form.get("file")
    if (!(file instanceof File)) return badRequest("Arquivo obrigatório.")

    const contentType = (file.type || "").toLowerCase()
    const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"])
    if (!allowedTypes.has(contentType)) return badRequest("Formato inválido. Use PNG, JPG ou WEBP.")

    const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg"
    const bytes = Buffer.from(await file.arrayBuffer())
    if (bytes.byteLength > 5 * 1024 * 1024) return badRequest("Imagem muito grande (max 5MB).")

    const dir = path.join(process.cwd(), "public", "uploads", "sessions", String(sessionId))
    await fs.mkdir(dir, { recursive: true })

    const filename = `${randomUUID()}.${ext}`
    const abs = path.join(dir, filename)
    await fs.writeFile(abs, bytes)

    const url = `/uploads/sessions/${sessionId}/${filename}`
    await prisma.session.update({ where: { id: sessionId }, data: { coverImageUrl: url } })

    return NextResponse.json({ ok: true, url }, { status: 200 })
  } catch {
    return serverError()
  }
}

