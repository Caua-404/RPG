import { NextResponse } from "next/server"
import { setPasswordSchema } from "@/lib/validation/auth"
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit"
import { badRequest, tooManyRequests, serverError } from "@/lib/security/responses"
import { setInitialPassword } from "@/lib/services/auth-service"

export async function POST(req: Request) {
  try {
    const limiter = checkRateLimit({
      key: `set-password:${getClientIp(req)}`,
      limit: 8,
      windowMs: 60_000,
    })
    if (!limiter.allowed) return tooManyRequests()

    const parsed = setPasswordSchema.safeParse(await req.json())
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Dados inválidos.")
    }

    const ok = await setInitialPassword(parsed.data.user, parsed.data.password)
    if (!ok) return NextResponse.json({ error: "Não foi possível cadastrar senha." }, { status: 400 })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch {
    return serverError()
  }
}

