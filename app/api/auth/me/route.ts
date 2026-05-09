import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getSessionCookieName, verifySession } from "@/lib/auth"
import { unauthorized } from "@/lib/security/responses"

export async function GET() {
  const token = (await cookies()).get(getSessionCookieName())?.value
  if (!token) return unauthorized()

  try {
    const session = await verifySession(token)
    return NextResponse.json({
      ok: true,
      user: { id: session.sub, username: session.username, name: session.name, role: session.role },
    })
  } catch {
    return unauthorized()
  }
}

