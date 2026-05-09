import { NextResponse } from "next/server"
import { requireApiSession } from "@/lib/api-session"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { badRequest, forbidden, unauthorized, serverError } from "@/lib/security/responses"

const createSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "User inválido (mín. 3).")
    .max(40)
    .regex(/^[a-z0-9._-]+$/i, "Use apenas letras, números, ponto, hífen e underscore.")
    .transform((s) => s.toLowerCase()),
  name: z.string().trim().min(2, "Nome inválido (mín. 2).").max(190),
  role: z.enum(["mestre", "jogador"]),
})

export async function GET() {
  try {
    const session = await requireApiSession()
    if (!session) return unauthorized()
    if (session.role !== "mestre") return forbidden()

    let usersRaw: Array<{
      id: number
      username: string
      name: string
      role: "mestre" | "jogador"
      displayName: string | null
      avatarMimeType: string | null
      playerBio: string | null
      playerNotes: string | null
      passwordHash: string | null
      lastSeenAt: Date | null
      blockedAt: Date | null
    }>

    try {
      usersRaw = await prisma.user.findMany({
        where: { role: { in: ["mestre", "jogador"] } },
        orderBy: { name: "asc" },
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          displayName: true,
          avatarMimeType: true,
          playerBio: true,
          playerNotes: true,
          passwordHash: true,
          lastSeenAt: true,
          blockedAt: true,
        },
      })
    } catch (err) {
      // Compat fallback: if DB is behind and blockedAt does not exist yet, keep list page functional.
      const message = err instanceof Error ? err.message : ""
      if (!message.toLowerCase().includes("blockedat")) throw err
      const fallbackUsers = await prisma.user.findMany({
        where: { role: { in: ["mestre", "jogador"] } },
        orderBy: { name: "asc" },
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          displayName: true,
          avatarMimeType: true,
          playerBio: true,
          playerNotes: true,
          passwordHash: true,
          lastSeenAt: true,
        },
      })
      usersRaw = fallbackUsers.map((user) => ({ ...user, blockedAt: null }))
    }
    const userIds = usersRaw.map((user) => user.id)
    const userCharacters =
      userIds.length > 0
        ? await prisma.character.findMany({
            where: { userId: { in: userIds } },
            select: {
              userId: true,
              class: {
                select: { name: true },
              },
            },
          })
        : []

    const classTotals = new Map<string, number>()
    const primaryClassByUser = new Map<number, string | null>()
    const classCountByUser = new Map<number, number>()

    for (const character of userCharacters) {
      const className = character.class?.name?.trim() || "Sem classe"
      classTotals.set(className, (classTotals.get(className) ?? 0) + 1)
      classCountByUser.set(character.userId, (classCountByUser.get(character.userId) ?? 0) + 1)

      const current = primaryClassByUser.get(character.userId)
      if (!current) {
        primaryClassByUser.set(character.userId, className)
      }
    }

    const topClasses = Array.from(classTotals.entries())
      .map(([name, picks]) => ({ name, picks }))
      .sort((a, b) => b.picks - a.picks)
      .slice(0, 3)

    const users = usersRaw.map((user) => {
      const completed = [
        Boolean(user.displayName),
        Boolean(user.avatarMimeType),
        Boolean(user.playerBio),
        Boolean(user.playerNotes),
        Boolean(user.passwordHash),
      ].filter(Boolean).length

      return {
        ...user,
        profileCompletion: Math.round((completed / 5) * 100),
        primaryClass: primaryClassByUser.get(user.id) ?? "Sem classe",
        characterCount: classCountByUser.get(user.id) ?? 0,
      }
    })

    return NextResponse.json({ ok: true, users, topClasses }, { status: 200 })
  } catch (err) {
    console.error("GET /api/users/jogadores failed:", err)
    return serverError()
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireApiSession()
    if (!session) return unauthorized()
    if (session.role !== "mestre") return forbidden()

    const parsed = createSchema.safeParse(await req.json())
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos.")

    try {
      await prisma.user.create({
        data: {
          username: parsed.data.username,
          name: parsed.data.name,
          role: parsed.data.role,
          passwordHash: null,
          displayName: null,
          avatarData: null,
          avatarMimeType: null,
          playerBio: null,
          playerNotes: null,
        },
        select: { id: true },
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : ""
      if (message.toLowerCase().includes("unique constraint") || message.toLowerCase().includes("duplicate")) {
        return NextResponse.json({ error: "Já existe um usuário com esse user." }, { status: 409 })
      }
      throw err
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return serverError()
  }
}

