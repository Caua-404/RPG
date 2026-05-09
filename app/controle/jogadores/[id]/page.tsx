import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "@/lib/server-session"
import { Button } from "@/components/ui/button"

function profileCompletion(user: {
  displayName: string | null
  avatarMimeType: string | null
  playerBio: string | null
  playerNotes: string | null
  passwordHash: string | null
}) {
  const checks = [
    Boolean(user.displayName),
    Boolean(user.avatarMimeType),
    Boolean(user.playerBio),
    Boolean(user.playerNotes),
    Boolean(user.passwordHash),
  ]
  const done = checks.filter(Boolean).length
  return Math.round((done / checks.length) * 100)
}

function formatLastSeen(lastSeenAt: Date | null) {
  if (!lastSeenAt) return "Nunca acessou"
  const diffMs = Date.now() - lastSeenAt.getTime()
  if (diffMs < 2 * 60 * 1000) return "Agora há pouco"
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 60) return `Há ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Há ${hours} h`
  const days = Math.floor(hours / 24)
  return `Há ${days} d`
}

export default async function JogadorDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session) redirect("/login")
  if (session.role !== "mestre") redirect("/controle")

  const { id } = await params
  const userId = Number(id)
  if (!Number.isFinite(userId)) notFound()

  let user: {
    id: number
    username: string
    name: string
    role: "mestre" | "jogador"
    displayName: string | null
    avatarMimeType: string | null
    playerBio: string | null
    playerNotes: string | null
    lastSeenAt: Date | null
    blockedAt: Date | null
    passwordHash: string | null
    createdAt: Date
  } | null = null

  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        displayName: true,
        avatarMimeType: true,
        playerBio: true,
        playerNotes: true,
        lastSeenAt: true,
        blockedAt: true,
        passwordHash: true,
        createdAt: true,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message.toLowerCase() : ""
    if (!message.includes("blockedat")) throw err
    const fallbackUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        displayName: true,
        avatarMimeType: true,
        playerBio: true,
        playerNotes: true,
        lastSeenAt: true,
        passwordHash: true,
        createdAt: true,
      },
    })
    user = fallbackUser ? { ...fallbackUser, blockedAt: null } : null
  }
  if (!user) notFound()

  const completion = profileCompletion(user)
  const online = !user.blockedAt && !!user.lastSeenAt && Date.now() - user.lastSeenAt.getTime() <= 2 * 60 * 1000

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Perfil do jogador</h1>
          <p className="text-sm text-muted-foreground">Visão detalhada no formato dashboard.</p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/controle/jogadores">Voltar para jogadores</Link>
        </Button>
      </div>

      <section className="rounded-2xl border border-border/60 bg-background/40 p-4 md:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr]">
          <article className="rounded-xl border border-border/60 bg-background/70 p-4">
            <div className="flex items-center gap-4">
              <img
                src={user.avatarMimeType ? `/api/users/avatar/${user.id}` : "/placeholder.svg"}
                alt={user.name}
                className="h-20 w-20 rounded-xl border border-border/60 object-cover"
              />
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold">{user.displayName || user.name}</div>
                <div className="truncate text-sm text-muted-foreground">@{user.username}</div>
                <div className="mt-1 inline-flex rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  {user.role === "mestre" ? "Mestre" : "Jogador"}
                </div>
              </div>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Perfil completo</span>
              <span>{completion}%</span>
            </div>
          </article>

          <article className="rounded-xl border border-border/60 bg-background/70 p-4">
            <div className="text-sm text-muted-foreground">Status</div>
            <div
              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs ${
                user.blockedAt ? "bg-red-500/15 text-red-400" : online ? "bg-emerald-500/15 text-emerald-400" : "bg-secondary text-muted-foreground"
              }`}
            >
              {user.blockedAt ? "Bloqueado" : online ? "Online" : "Offline"}
            </div>
            <div className="mt-4 text-xs text-muted-foreground">Visto por último</div>
            <div className="text-sm">{formatLastSeen(user.lastSeenAt)}</div>
          </article>

          <article className="rounded-xl border border-border/60 bg-background/70 p-4">
            <div className="text-sm text-muted-foreground">Indicadores</div>
            <div className="mt-3 grid gap-2 text-sm">
              <div className="flex items-center justify-between rounded-md border border-border/60 px-2 py-1">
                <span>Cadastro em</span>
                <span>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/60 px-2 py-1">
                <span>Bio</span>
                <span>{user.playerBio ? "Preenchida" : "Pendente"}</span>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/60 px-2 py-1">
                <span>Notas</span>
                <span>{user.playerNotes ? "Preenchidas" : "Pendentes"}</span>
              </div>
            </div>
          </article>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-border/60 bg-background/70 p-4">
            <h2 className="text-sm font-medium">Bio do jogador</h2>
            <p className="mt-2 text-sm text-muted-foreground">{user.playerBio || "Jogador ainda não cadastrou bio."}</p>
          </article>
          <article className="rounded-xl border border-border/60 bg-background/70 p-4">
            <h2 className="text-sm font-medium">Observações para mestres</h2>
            <p className="mt-2 text-sm text-muted-foreground">{user.playerNotes || "Sem observações no momento."}</p>
          </article>
        </div>
      </section>
    </div>
  )
}
