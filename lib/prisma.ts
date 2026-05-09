import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

export const prisma = globalThis.__prisma ?? new PrismaClient()

// Helpful in serverless environments (Vercel) to diagnose DB connection errors.
if (process.env.NODE_ENV !== "production") {
  prisma.$on("error" as any, (e: any) => console.error("Prisma error:", e))
}

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma
}

