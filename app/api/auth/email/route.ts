import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { userLookupSchema } from "@/lib/validation/auth"
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit"
import { badRequest, tooManyRequests, serverError } from "@/lib/security/responses"

export async function POST(req: Request) {
  try {
    const limiter = checkRateLimit({
      key: `user-check:${getClientIp(req)}`,
      limit: 20,
      windowMs: 60_000,
    })
    if (!limiter.allowed) return tooManyRequests()

    const parsed = userLookupSchema.safeParse(await req.json())
    if (!parsed.success) return badRequest("User é obrigatório.")

    const user = await prisma.user.findUnique({
      where: { username: parsed.data.user },
      select: { id: true, username: true, name: true, role: true, passwordHash: true },
    })

    return NextResponse.json(
      {
        // Resposta opaca para reduzir enumeração de usuário.
        exists: !!user,
        hasPassword: !!user?.passwordHash,
      },
      { status: 200 },
    )
  } catch (err) {
    console.error("POST /api/auth/email failed:", err)
    return serverError()
  }
}

