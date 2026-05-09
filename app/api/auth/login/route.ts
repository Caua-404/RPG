import { NextResponse } from "next/server"
import { getSessionCookieName, getSessionMaxAgeSeconds, signSession } from "@/lib/auth"
import { loginSchema } from "@/lib/validation/auth"
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit"
import { badRequest, tooManyRequests, serverError } from "@/lib/security/responses"
import { validateCredentials } from "@/lib/services/auth-service"

export async function POST(req: Request) {
  try {
    const limiter = checkRateLimit({
      key: `login:${getClientIp(req)}`,
      limit: 10,
      windowMs: 60_000,
    })
    if (!limiter.allowed) return tooManyRequests()

    const parsed = loginSchema.safeParse(await req.json())
    if (!parsed.success) {
      return badRequest("User e senha são obrigatórios.")
    }

    const authResult = await validateCredentials(parsed.data.user, parsed.data.password)
    if (authResult?.status === "blocked") {
      return NextResponse.json(
        { error: "Usuário bloqueado por tentativas inválidas. Solicite desbloqueio a um mestre." },
        { status: 423 },
      )
    }
    if (!authResult || authResult.status !== "success") {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 })
    }
    const { user } = authResult

    const token = await signSession({
      sub: String(user.id),
      username: user.username,
      name: user.name,
      role: user.role,
    })

    const res = NextResponse.json({
      ok: true,
      user: { id: user.id, username: user.username, name: user.name, role: user.role },
    })
    res.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: getSessionMaxAgeSeconds(),
    })
    return res
  } catch {
    return serverError()
  }
}

