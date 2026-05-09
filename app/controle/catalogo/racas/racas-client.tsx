"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"

type ApiRace = {
  id: number
  slug: string
  name: string
  description: string | null
  speed: number
  size: string | null
  ageDescription: string | null
  languages: unknown
  features: unknown
  bonuses: Array<{ attribute: string; bonusValue: number }>
  subraces: Array<{ id: number; slug: string; name: string }>
}

const createSchema = z.object({
  name: z.string().min(2, "Informe um nome (mín. 2).").max(80),
  description: z.string().max(5000).optional(),
  speed: z.coerce.number().int().min(0).max(120).optional(),
  size: z.string().max(40).optional(),
})

export function RacasClient({ canCreate }: { canCreate: boolean }) {
  const [races, setRaces] = useState<ApiRace[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [speed, setSpeed] = useState<string>("30")
  const [size, setSize] = useState("")

  async function load() {
    setLoading(true)
    setServerError(null)
    try {
      const res = await fetch("/api/catalog/races", { cache: "no-store" })
      const data = (await res.json()) as { ok?: boolean; races?: ApiRace[]; error?: string }
      if (!res.ok) {
        setServerError(data.error ?? "Não foi possível carregar raças.")
        setRaces([])
        return
      }
      setRaces(data.races ?? [])
    } catch {
      setServerError("Falha de rede ao carregar raças.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const parsed = useMemo(() => createSchema.safeParse({ name, description, speed, size }), [name, description, speed, size])

  async function handleCreate() {
    if (!canCreate || submitting) return
    const parsedNow = createSchema.safeParse({ name, description, speed, size })
    if (!parsedNow.success) {
      setServerError(parsedNow.error.issues[0]?.message ?? "Dados inválidos.")
      return
    }
    setSubmitting(true)
    setServerError(null)
    try {
      const res = await fetch("/api/catalog/races", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: parsedNow.data.name,
          description: parsedNow.data.description || undefined,
          speed: parsedNow.data.speed ?? undefined,
          size: parsedNow.data.size || undefined,
        }),
      })
      const data = (await res.json()) as { ok?: boolean; id?: number; error?: string }
      if (!res.ok) {
        setServerError(data.error ?? "Não foi possível criar a raça.")
        return
      }
      setName("")
      setDescription("")
      setSpeed("30")
      setSize("")
      await load()
    } catch {
      setServerError("Falha de rede ao criar raça.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <h1 className="text-xl font-semibold">Raças</h1>
        <p className="text-sm text-muted-foreground">
          {canCreate ? "Você pode criar e visualizar raças." : "Você pode apenas visualizar raças."}
        </p>
      </div>

      {canCreate ? (
        <Card className="border-border/60 bg-card/70 backdrop-blur">
          <CardHeader>
            <CardTitle>Criar raça</CardTitle>
            <CardDescription>Nome, descrição e atributos principais. (Bônus/idiomas/traços podem ser adicionados depois.)</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Nome</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Aasimar" />
              </div>
              <div>
                <label className="text-sm font-medium">Velocidade</label>
                <Input value={speed} onChange={(e) => setSpeed(e.target.value)} type="number" min={0} max={120} />
              </div>
              <div>
                <label className="text-sm font-medium">Tamanho</label>
                <Input value={size} onChange={(e) => setSize(e.target.value)} placeholder="Ex.: Médio" />
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
          ) : races.length ? (
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {races.map((r) => (
                <div key={r.id} className="rounded-md border border-border/60 bg-background/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{r.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{r.slug}</div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      Vel {r.speed}{r.size ? ` • ${r.size}` : ""}
                    </div>
                  </div>
                  {r.description ? (
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-3">{r.description}</div>
                  ) : null}
                  {r.subraces?.length ? (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Sub-raças: {r.subraces.map((s) => s.name).join(", ")}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Nenhuma raça cadastrada.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

