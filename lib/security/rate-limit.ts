type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export function checkRateLimit(input: { key: string; limit: number; windowMs: number }) {
  const now = Date.now()
  const current = buckets.get(input.key)

  if (!current || now > current.resetAt) {
    const resetAt = now + input.windowMs
    buckets.set(input.key, { count: 1, resetAt })
    return { allowed: true, remaining: input.limit - 1, resetAt }
  }

  if (current.count >= input.limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt }
  }

  current.count += 1
  return { allowed: true, remaining: input.limit - current.count, resetAt: current.resetAt }
}

export function getClientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
}

