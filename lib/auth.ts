import { SignJWT, jwtVerify } from "jose"

const COOKIE_NAME = "rpg_session"

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env: ${name}`)
  return value
}

function parseExpiresInToSeconds(raw: string): number {
  const s = raw.trim()
  const m = /^(\d+)\s*([smhd])?$/.exec(s)
  if (!m) return 60 * 60 * 24 * 7
  const n = Number(m[1])
  const unit = m[2] ?? "s"
  switch (unit) {
    case "s":
      return n
    case "m":
      return n * 60
    case "h":
      return n * 60 * 60
    case "d":
      return n * 60 * 60 * 24
    default:
      return 60 * 60 * 24 * 7
  }
}

function getSecretKey() {
  return new TextEncoder().encode(requireEnv("JWT_SECRET"))
}

function getIssuer() {
  return process.env.JWT_ISSUER ?? "alcateia-rpg"
}

export type SessionPayload = {
  sub: string
  username: string
  name: string
  role: "mestre" | "jogador"
}

export async function signSession(payload: SessionPayload) {
  const now = Math.floor(Date.now() / 1000)
  const expSeconds = parseExpiresInToSeconds(process.env.JWT_EXPIRES_IN ?? "7d")
  return await new SignJWT({ username: payload.username, name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + expSeconds)
    .setIssuer(getIssuer())
    .setSubject(payload.sub)
    .sign(getSecretKey())
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"], issuer: getIssuer() })
  const sub = payload.sub
  const username = payload.username
  const name = payload.name
  const role = payload.role

  if (typeof sub !== "string") throw new Error("Invalid token subject")
  if (typeof username !== "string") throw new Error("Invalid token username")
  if (typeof name !== "string") throw new Error("Invalid token name")
  if (role !== "mestre" && role !== "jogador") throw new Error("Invalid token role")

  return { sub, username, name, role }
}

export function getSessionCookieName() {
  return COOKIE_NAME
}

export function getSessionMaxAgeSeconds() {
  return parseExpiresInToSeconds(process.env.JWT_EXPIRES_IN ?? "7d")
}

