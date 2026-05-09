import { prisma } from "@/lib/prisma"

export async function findUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
      displayName: true,
      avatarData: true,
      avatarMimeType: true,
      playerBio: true,
      playerNotes: true,
      lastSeenAt: true,
      failedLoginAttempts: true,
      blockedAt: true,
    },
  })
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
    select: { id: true },
  })
}

export async function incrementFailedLogin(userId: number) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: { increment: 1 } },
    select: { failedLoginAttempts: true },
  })

  if (updated.failedLoginAttempts >= 2) {
    await prisma.user.update({
      where: { id: userId },
      data: { blockedAt: new Date() },
      select: { id: true },
    })
  }
}

export async function resetFailedLogin(userId: number) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      blockedAt: null,
    },
    select: { id: true },
  })
}

export async function unblockUserById(userId: number) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      blockedAt: null,
    },
    select: { id: true },
  })
}

