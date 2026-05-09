import bcrypt from "bcryptjs"
import {
  findUserByUsername,
  incrementFailedLogin,
  resetFailedLogin,
  updateUserPassword,
} from "@/lib/repositories/user-repository"

export async function validateCredentials(username: string, password: string) {
  const user = await findUserByUsername(username)
  if (!user || !user.passwordHash) return null
  if (user.blockedAt) return { status: "blocked" as const }
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    await incrementFailedLogin(user.id)
    const updated = await findUserByUsername(username)
    if (updated?.blockedAt) return { status: "blocked" as const }
    return { status: "invalid" as const }
  }
  await resetFailedLogin(user.id)
  return { status: "success" as const, user }
}

export async function setInitialPassword(username: string, password: string) {
  const user = await findUserByUsername(username)
  if (!user || user.passwordHash) return false
  const hash = await bcrypt.hash(password, 10)
  await updateUserPassword(user.id, hash)
  return true
}

