import { NextResponse } from "next/server"
import { z } from "zod"
import { requireApiSession } from "@/lib/api-session"
import { prisma } from "@/lib/prisma"
import { badRequest, unauthorized, serverError } from "@/lib/security/responses"

const updateSchema = z.object({
  displayName: z.string().trim().min(2, "Informe como devemos chamar você (mín. 2).").max(190),
  avatarBase64: z.string().optional().or(z.literal("")),
  avatarMimeType: z.string().optional().or(z.literal("")),
  playerBio: z.string().max(2000).optional().or(z.literal("")),
  playerNotes: z.string().max(2000).optional().or(z.literal("")),
})

export async function GET() {
  try {
    const session = await requireApiSession()
    if (!session) return unauthorized()

    const user = await prisma.user.findUnique({
      where: { id: Number(session.sub) },
      select: { displayName: true, avatarMimeType: true, playerBio: true, playerNotes: true, username: true },
    })
    return NextResponse.json(
      {
        ok: true,
        profile: {
          username: user?.username ?? null,
          displayName: user?.displayName ?? null,
          hasAvatar: !!user?.avatarMimeType,
          playerBio: user?.playerBio ?? null,
          playerNotes: user?.playerNotes ?? null,
        },
      },
      { status: 200 },
    )
  } catch {
    return serverError()
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireApiSession()
    if (!session) return unauthorized()

    const parsed = updateSchema.safeParse(await req.json())
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos.")

    await prisma.user.update({
      where: { id: Number(session.sub) },
      data: {
        displayName: parsed.data.displayName,
        avatarData:
          parsed.data.avatarBase64 && parsed.data.avatarMimeType
            ? Buffer.from(parsed.data.avatarBase64, "base64")
            : undefined,
        avatarMimeType:
          parsed.data.avatarBase64 && parsed.data.avatarMimeType ? parsed.data.avatarMimeType : undefined,
        playerBio: parsed.data.playerBio || null,
        playerNotes: parsed.data.playerNotes || null,
      },
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch {
    return serverError()
  }
}

