"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ApiRace = { id: number; name: string }
type ApiSubrace = {
  id: number
  slug: string
  name: string
  description: string | null
  race: { id: number; name: string; slug: string }
}

const createSchema = z.object({
  raceId: z.string().min(1, "Selecione uma raça."),
  name: z.string().min(2, "Informe um nome (mín. 2).").max(80),
  description: z.string().max(5000).optional(),
})

export function SubracasClient({ canCreate }: { canCreate: boolean }) {
  const [races, setRaces] = useState<ApiRace[]>([])
  const [subraces, setSubraces] = useState<ApiSubrace[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const [raceId, setRaceId] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  async function load() {
    setLoading(true)
    setServerError(null)
    try {
      const [racesRes, subRes] = await Promise.all([
        fetch("/api/catalog/races", { cache: "no-store" }),
        fetch("/api/catalog/subraces", { cache: "no-store" }),
      ])
      const racesJson = (await racesRes.json()) as { ok?: boolean; races?: any[]; error?: string }
      const subJson = (await subRes.json()) as { ok?: boolean; subraces?: ApiSubrace[]; error?: string }

      if (!racesRes.ok) throw new Error(racesJson.error ?? "Falha ao carregar raças.")
      if (!subRes.ok) throw new Error(subJson.error ?? "Falha ao carregar sub-raças.")

      setRaces((racesJson.races ?? []).map((r) => ({ id: Number(r.id), name: String(r.name) })))
      setSubraces(subJson.subraces ?? [])
    } catch (e: any) {
      setServerError(typeof e?.message === "string" ? e.message : "Falha ao carregar catálogo.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const parsed = useMemo(() => createSchema.safeParse({ raceId, name, description }), [raceId, name, description])

  async function handleCreate() {
    if (!canCreate || submitting) return
    const parsedNow = createSchema.safeParse({ raceId, name, description })
    if (!parsedNow.success) {
      setServerError(parsedNow.error.issues[0]?.message ?? "Dados inválidos.")
      return
    }

    setSubmitting(true)
    setServerError(null)
    try {
      const res = await fetch("/api/catalog/subraces", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          raceId: Number(parsedNow.data.raceId),
          name: parsedNow.data.name,
          description: parsedNow.data.description || undefined,
        }),
      })
      const data = (await res.json()) as { ok?: boolean; id?: number; error?: string }
      if (!res.ok) {
        setServerError(data.error ?? "Não foi possível criar a sub-raça.")
        return
      }
      setRaceId("")
      setName("")
      setDescription("")
      await load()
    } catch {
      setServerError("Falha de rede ao criar sub-raça.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <h1 className="text-xl font-semibold">Sub-raças</h1>
        <p className="text-sm text-muted-foreground">
          {canCreate ? "Você pode criar e visualizar sub-raças." : "Você pode apenas visualizar sub-raças."}
        </p>
      </div>

      {canCreate ? (
        <Card className="border-border/60 bg-card/70 backdrop-blur">
          <CardHeader>
            <CardTitle>Criar sub-raça</CardTitle>
            <CardDescription>Escolha a raça e informe o nome.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Raça</label>
                <Select value={raceId} onValueChange={setRaceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {races.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Nome</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Alto Elfo" />
              </div>
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-24" />
            </div>

            {serverError ? <div className="text-sm text-destructive">{serverError}</div> : null}

            <div className="flex justify-end">
              <Button onClick={handleCreate} disabled={!parsed.success || submitting}>
                {submitting ? (
                  <>
                    <Spinner className="mr-2" /> Salvando...
                  </>
                ) : (
                  "Criar"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/60 bg-card/70 backdrop-blur">
        <CardHeader>
          <CardTitle>Lista</CardTitle>
          <CardDescription>Conteúdo vindo do banco de dados.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner /> Carregando...
            </div>
          ) : subraces.length ? (
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {subraces.map((s) => (
                <div key={s.id} className="rounded-md border border-border/60 bg-background/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{s.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{s.slug}</div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">{s.race.name}</div>
                  </div>
                  {s.description ? (
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-3">{s.description}</div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Nenhuma sub-raça cadastrada.</div>
          )}
          {serverError ? <div className="text-sm text-destructive">{serverError}</div> : null}
        </CardContent>
      </Card>
    </div>
  )
}

