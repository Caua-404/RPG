import { cookies } from "next/headers"
import { getSessionCookieName, verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getServerSession() {
  const token = (await cookies()).get(getSessionCookieName())?.value
  if (!token) return null
  try {
    const session = await verifySession(token)
    const userId = Number(session.sub)
    if (Number.isFinite(userId)) {
      await prisma.user.update({ where: { id: userId }, data: { lastSeenAt: new Date() } }).catch(() => null)
    }
    return session
  } catch {
    return null
  }
}

