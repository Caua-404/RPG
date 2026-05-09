"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

type Player = {
  id: number
  username: string
  name: string
  role: "mestre" | "jogador"
  displayName?: string | null
  avatarMimeType?: string | null
  playerBio?: string | null
  playerNotes?: string | null
  profileCompletion?: number
  primaryClass?: string
  characterCount?: number
  lastSeenAt?: string | null
  blockedAt?: string | null
}

export function PlayersClient() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unlockingId, setUnlockingId] = useState<number | null>(null)
  const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [myId, setMyId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<"lista" | "blocos">("lista")
  const [topClasses, setTopClasses] = useState<Array<{ name: string; picks: number }>>([])
  const [, setClockTick] = useState(0)

  function isOnline(lastSeenAt?: string | null) {
    if (!lastSeenAt) return false
    const ts = new Date(lastSeenAt).getTime()
    if (!Number.isFinite(ts)) return false
    return Date.now() - ts <= 2 * 60 * 1000
  }

  function formatLastSeen(lastSeenAt?: string | null) {
    if (!lastSeenAt) return "Nunca acessou"
    const ts = new Date(lastSeenAt).getTime()
    if (!Number.isFinite(ts)) return "Data inválida"
    const diffMs = Date.now() - ts
    if (diffMs < 2 * 60 * 1000) return "Agora há pouco"
    const minutes = Math.floor(diffMs / 60_000)
    if (minutes < 60) return `Há ${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Há ${hours} h`
    const days = Math.floor(hours / 24)
    return `Há ${days} d`
  }

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/users/jogadores", { cache: "no-store" })
      const data = (await res.json()) as { ok?: boolean; users?: any[]; topClasses?: Array<{ name: string; picks: number }>; error?: string }
      if (!res.ok || !data.users) {
        setError(data.error ?? "Não foi possível carregar jogadores.")
        return
      }
      setTopClasses(Array.isArray(data.topClasses) ? data.topClasses : [])
      setPlayers(
        data.users.map((u) => ({
          id: Number(u.id),
          username: String(u.username),
          name: String(u.name),
          role: u.role === "mestre" ? "mestre" : "jogador",
          displayName: u.displayName ? String(u.displayName) : null,
          avatarMimeType: u.avatarMimeType ? String(u.avatarMimeType) : null,
          playerBio: u.playerBio ? String(u.playerBio) : null,
          playerNotes: u.playerNotes ? String(u.playerNotes) : null,
          profileCompletion: Number.isFinite(Number(u.profileCompletion)) ? Number(u.profileCompletion) : 0,
          primaryClass: u.primaryClass ? String(u.primaryClass) : "Sem classe",
          characterCount: Number.isFinite(Number(u.characterCount)) ? Number(u.characterCount) : 0,
          lastSeenAt: u.lastSeenAt ? String(u.lastSeenAt) : null,
          blockedAt: u.blockedAt ? String(u.blockedAt) : null,
        })),
      )
    } catch {
      setError("Falha de rede.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: any) => {
        const id = Number(data?.user?.id)
        if (Number.isFinite(id)) setMyId(id)
      })
      .catch(() => null)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setClockTick((v) => v + 1), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  async function handleUnlock(userId: number) {
    setUnlockingId(userId)
    setError(null)
    try {
      const res = await fetch(`/api/users/jogadores/${userId}/unlock`, {
        method: "POST",
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok) {
        setError(data.error ?? "Não foi possível desbloquear.")
        return
      }
      await load()
    } catch {
      setError("Falha de rede ao desbloquear.")
    } finally {
      setUnlockingId(null)
    }
  }

  async function handleRoleChange(userId: number, role: "mestre" | "jogador") {
    setUpdatingRoleId(userId)
    setError(null)
    try {
      const res = await fetch(`/api/users/jogadores/${userId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok) {
        setError(data.error ?? "Não foi possível alterar cargo.")
        return
      }
      await load()
    } catch {
      setError("Falha de rede ao alterar cargo.")
    } finally {
      setUpdatingRoleId(null)
    }
  }

  async function handleDelete(userId: number) {
    if (!window.confirm("Tem certeza que deseja deletar este jogador? Essa ação não pode ser desfeita.")) return
    setDeletingId(userId)
    setError(null)
    try {
      const res = await fetch(`/api/users/jogadores/${userId}`, { method: "DELETE" })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok) {
        setError(data.error ?? "Não foi possível deletar.")
        return
      }
      await load()
    } catch {
      setError("Falha de rede ao deletar.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card className="overflow-hidden border-border/60 bg-card/70 backdrop-blur">
      <CardContent className="p-4 md:p-6">
        <CardHeader className="mb-4 space-y-1 p-0">
          <CardTitle>Usuários cadastrados</CardTitle>
          <CardDescription>Visualização em lista para acompanhamento rápido de status e dados do jogador.</CardDescription>
        </CardHeader>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 text-sm ${
              viewMode === "lista" ? "bg-primary text-primary-foreground" : "border border-border bg-background/40"
            }`}
            onClick={() => setViewMode("lista")}
          >
            Lista
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 text-sm ${
              viewMode === "blocos" ? "bg-primary text-primary-foreground" : "border border-border bg-background/40"
            }`}
            onClick={() => setViewMode("blocos")}
          >
            Blocos
          </button>
        </div>

        {error ? <div className="mb-3 text-sm text-destructive">{error}</div> : null}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner /> Carregando...
          </div>
        ) : viewMode === "blocos" ? (
          players.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {players.map((player) => (
              <Link href={`/controle/jogadores/${player.id}`} key={player.id} className="rounded-xl border border-border/60 bg-background/40 p-4 transition-colors hover:bg-background/70">
                <div className="mb-3 flex items-center gap-3">
                  <img
                    src={player.avatarMimeType ? `/api/users/avatar/${player.id}` : "/placeholder.svg"}
                    alt={player.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <div className="truncate font-medium">{player.displayName || player.name}</div>
                    <div className="truncate text-sm text-muted-foreground">{player.primaryClass || "Sem classe"}</div>
                  </div>
                </div>
                <div className="mb-3 grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-border/60 bg-background/60 px-2 py-1 text-xs">
                    <div className="text-muted-foreground">Status</div>
                    <div className={!player.blockedAt && isOnline(player.lastSeenAt) ? "text-emerald-400" : "text-muted-foreground"}>
                      {player.blockedAt ? "Bloqueado" : !player.blockedAt && isOnline(player.lastSeenAt) ? "Online" : "Offline"}
                    </div>
                  </div>
                  <div className="rounded-md border border-border/60 bg-background/60 px-2 py-1 text-xs">
                    <div className="text-muted-foreground">Conclusão</div>
                    <div>{player.profileCompletion ?? 0}%</div>
                  </div>
                </div>
                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${player.profileCompletion ?? 0}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Perfil concluído</span>
                  <span>{player.profileCompletion ?? 0}%</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {(topClasses.length ? topClasses : [{ name: "Sem classe", picks: 0 }]).slice(0, 3).map((topClass) => (
                    <div key={`${player.id}-${topClass.name}`} className="rounded-md border border-border/60 bg-background/60 px-2 py-1 text-center">
                      <div className="truncate text-[10px] text-muted-foreground">{topClass.name}</div>
                      <div className="text-xs font-medium">{topClass.picks}x</div>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
          ) : (
            <div className="text-sm text-muted-foreground">Nenhum jogador cadastrado ainda.</div>
          )
        ) : players.length ? (
          <div className="overflow-x-auto rounded-lg border border-border/60 bg-background/30">
              <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-background/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Jogador</th>
                  <th className="px-4 py-3 text-left font-medium">User</th>
                  <th className="px-4 py-3 text-left font-medium">Perfil</th>
                    <th className="px-4 py-3 text-left font-medium">Visto por último</th>
                  <th className="px-4 py-3 text-left font-medium">Conclusão do perfil</th>
                  <th className="px-4 py-3 text-left font-medium">Bio</th>
                  <th className="px-4 py-3 text-left font-medium">Notas</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, index) => (
                  <tr key={p.id} className={index % 2 === 0 ? "bg-background/10" : "bg-transparent"}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.avatarMimeType ? `/api/users/avatar/${p.id}` : "/placeholder.svg"}
                          alt={p.name}
                          className="h-9 w-9 rounded-full border border-border/60 object-cover"
                        />
                        <Link href={`/controle/jogadores/${p.id}`} className="font-medium hover:underline">
                          {p.displayName || p.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">@{p.username}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs text-foreground">
                        {p.role === "mestre" ? "Mestre" : "Jogador"}
                      </span>
                    </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatLastSeen(p.lastSeenAt)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {p.profileCompletion ?? 0}%
                      </td>
                    <td className="max-w-[260px] truncate px-4 py-3 text-muted-foreground">{p.playerBio || "Sem bio"}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">{p.playerNotes || "Sem notas"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs ${
                            p.blockedAt
                              ? "bg-red-500/15 text-red-400"
                              : isOnline(p.lastSeenAt)
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-secondary text-muted-foreground"
                        }`}
                      >
                          {p.blockedAt ? "Bloqueado" : isOnline(p.lastSeenAt) ? "Online" : "Offline"}
                      </span>
                    </td>
                      <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={p.role}
                          onChange={(e) => void handleRoleChange(p.id, e.target.value === "mestre" ? "mestre" : "jogador")}
                          disabled={updatingRoleId === p.id || myId === p.id}
                          aria-label="Alterar cargo"
                          className="h-8 rounded-md border border-border bg-background px-2 text-xs disabled:opacity-60"
                        >
                          <option value="jogador">Jogador</option>
                          <option value="mestre">Mestre</option>
                        </select>

                        {p.role === "jogador" && p.blockedAt ? (
                          <button
                            type="button"
                            className="inline-flex h-8 items-center rounded-md border border-border px-2 text-xs hover:bg-accent disabled:opacity-60"
                            onClick={() => void handleUnlock(p.id)}
                            disabled={unlockingId === p.id}
                          >
                            {unlockingId === p.id ? "Liberando..." : "Liberar"}
                          </button>
                        ) : null}

                        {p.role === "jogador" ? (
                          <button
                            type="button"
                            className="inline-flex h-8 items-center rounded-md border border-border px-2 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-60"
                            onClick={() => void handleDelete(p.id)}
                            disabled={deletingId === p.id || myId === p.id}
                          >
                            {deletingId === p.id ? "Deletando..." : "Deletar"}
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Nenhum jogador cadastrado ainda.</div>
        )}
      </CardContent>
    </Card>
  )
}

