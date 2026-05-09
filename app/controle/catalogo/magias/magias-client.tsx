"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"

type ApiSpell = {
  id: number
  slug: string
  name: string
  level: number
  school: string
  castingTime: string | null
  range: string | null
  duration: string | null
  components: string | null
  description: string | null
  concentration: boolean
  ritual: boolean
}

const createSchema = z.object({
  name: z.string().min(2, "Informe um nome (mín. 2).").max(120),
  level: z.coerce.number().int().min(0).max(9),
  school: z.string().min(2, "Informe uma escola (mín. 2).").max(60),
  castingTime: z.string().max(80).optional(),
  range: z.string().max(80).optional(),
  duration: z.string().max(80).optional(),
  components: z.string().max(80).optional(),
  description: z.string().max(20_000).optional(),
})

export function MagiasClient({ canCreate }: { canCreate: boolean }) {
  const [spells, setSpells] = useState<ApiSpell[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [level, setLevel] = useState("0")
  const [school, setSchool] = useState("")
  const [castingTime, setCastingTime] = useState("")
  const [range, setRange] = useState("")
  const [duration, setDuration] = useState("")
  const [components, setComponents] = useState("")
  const [description, setDescription] = useState("")

  async function load() {
    setLoading(true)
    setServerError(null)
    try {
      const res = await fetch("/api/catalog/spells", { cache: "no-store" })
      const data = (await res.json()) as { ok?: boolean; spells?: ApiSpell[]; error?: string }
      if (!res.ok) {
        setServerError(data.error ?? "Não foi possível carregar magias.")
        setSpells([])
        return
      }
      setSpells(data.spells ?? [])
    } catch {
      setServerError("Falha de rede ao carregar magias.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const parsed = useMemo(
    () => createSchema.safeParse({ name, level, school, castingTime, range, duration, components, description }),
    [name, level, school, castingTime, range, duration, components, description],
  )

  async function handleCreate() {
    if (!canCreate || submitting) return
    const parsedNow = createSchema.safeParse({ name, level, school, castingTime, range, duration, components, description })
    if (!parsedNow.success) {
      setServerError(parsedNow.error.issues[0]?.message ?? "Dados inválidos.")
      return
    }
    setSubmitting(true)
    setServerError(null)
    try {
      const res = await fetch("/api/catalog/spells", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: parsedNow.data.name,
          level: parsedNow.data.level,
          school: parsedNow.data.school,
          castingTime: parsedNow.data.castingTime || undefined,
          range: parsedNow.data.range || undefined,
          duration: parsedNow.data.duration || undefined,
          components: parsedNow.data.components || undefined,
          description: parsedNow.data.description || undefined,
        }),
      })
      const data = (await res.json()) as { ok?: boolean; id?: number; error?: string }
      if (!res.ok) {
        setServerError(data.error ?? "Não foi possível criar a magia.")
        return
      }
      setName("")
      setLevel("0")
      setSchool("")
      setCastingTime("")
      setRange("")
      setDuration("")
      setComponents("")
      setDescription("")
      await load()
    } catch {
      setServerError("Falha de rede ao criar magia.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <h1 className="text-xl font-semibold">Magias</h1>
        <p className="text-sm text-muted-foreground">
          {canCreate ? "Você pode criar e visualizar magias." : "Você pode apenas visualizar magias."}
        </p>
      </div>

      {canCreate ? (
        <Card className="border-border/60 bg-card/70 backdrop-blur">
          <CardHeader>
            <CardTitle>Criar magia</CardTitle>
            <CardDescription>Cadastro rápido (sem dano/salvaguarda por enquanto).</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-2 grid gap-1">
                <label className="text-sm font-medium">Nome</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Mísseis Mágicos" />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Nível</label>
                <Input value={level} onChange={(e) => setLevel(e.target.value)} type="number" min={0} max={9} />
              </div>
              <div className="md:col-span-3 grid gap-1">
                <label className="text-sm font-medium">Escola</label>
                <Input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Ex.: evocação" />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <div className="grid gap-1 md:col-span-2">
                <label className="text-sm font-medium">Tempo de conjuração</label>
                <Input value={castingTime} onChange={(e) => setCastingTime(e.target.value)} placeholder="Ex.: 1 ação" />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Alcance</label>
                <Input value={range} onChange={(e) => setRange(e.target.value)} placeholder="Ex.: 36m" />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Duração</label>
                <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ex.: Instantânea" />
              </div>
              <div className="grid gap-1 md:col-span-4">
                <label className="text-sm font-medium">Componentes</label>
                <Input value={components} onChange={(e) => setComponents(e.target.value)} placeholder="Ex.: V, S, M" />
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
          ) : spells.length ? (
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {spells.map((sp) => (
                <div key={sp.id} className="rounded-md border border-border/60 bg-background/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{sp.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{sp.slug}</div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      Nível {sp.level} • {sp.school}
                    </div>
                  </div>
                  {sp.description ? (
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-3">{sp.description}</div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Nenhuma magia cadastrada.</div>
          )}
          {serverError ? <div className="text-sm text-destructive">{serverError}</div> : null}
        </CardContent>
      </Card>
    </div>
  )
}

