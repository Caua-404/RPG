"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"

type ApiItem = {
  id: number
  slug: string
  name: string
  type: string
  category: string | null
  rarity: string | null
  weight: number | null
  value: number | null
  description: string | null
  damage: string | null
  damageType: string | null
  armorClass: number | null
}

const createSchema = z.object({
  name: z.string().min(2, "Informe um nome (mín. 2).").max(120),
  type: z.string().min(2, "Informe um tipo (mín. 2).").max(60),
  category: z.string().max(60).optional(),
  rarity: z.string().max(60).optional(),
  weight: z.coerce.number().min(0).max(10_000).optional(),
  value: z.coerce.number().int().min(0).max(1_000_000).optional(),
  description: z.string().max(10_000).optional(),
})

export function ItensClient({ canCreate }: { canCreate: boolean }) {
  const [items, setItems] = useState<ApiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [category, setCategory] = useState("")
  const [rarity, setRarity] = useState("")
  const [weight, setWeight] = useState("")
  const [value, setValue] = useState("")
  const [description, setDescription] = useState("")

  async function load() {
    setLoading(true)
    setServerError(null)
    try {
      const res = await fetch("/api/catalog/items", { cache: "no-store" })
      const data = (await res.json()) as { ok?: boolean; items?: ApiItem[]; error?: string }
      if (!res.ok) {
        setServerError(data.error ?? "Não foi possível carregar itens.")
        setItems([])
        return
      }
      setItems(data.items ?? [])
    } catch {
      setServerError("Falha de rede ao carregar itens.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const parsed = useMemo(
    () => createSchema.safeParse({ name, type, category, rarity, weight, value, description }),
    [name, type, category, rarity, weight, value, description],
  )

  async function handleCreate() {
    if (!canCreate || submitting) return
    const parsedNow = createSchema.safeParse({ name, type, category, rarity, weight, value, description })
    if (!parsedNow.success) {
      setServerError(parsedNow.error.issues[0]?.message ?? "Dados inválidos.")
      return
    }
    setSubmitting(true)
    setServerError(null)
    try {
      const res = await fetch("/api/catalog/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: parsedNow.data.name,
          type: parsedNow.data.type,
          category: parsedNow.data.category || undefined,
          rarity: parsedNow.data.rarity || undefined,
          weight: typeof parsedNow.data.weight === "number" && Number.isFinite(parsedNow.data.weight) ? parsedNow.data.weight : undefined,
          value: typeof parsedNow.data.value === "number" && Number.isFinite(parsedNow.data.value) ? parsedNow.data.value : undefined,
          description: parsedNow.data.description || undefined,
        }),
      })
      const data = (await res.json()) as { ok?: boolean; id?: number; error?: string }
      if (!res.ok) {
        setServerError(data.error ?? "Não foi possível criar o item.")
        return
      }
      setName("")
      setType("")
      setCategory("")
      setRarity("")
      setWeight("")
      setValue("")
      setDescription("")
      await load()
    } catch {
      setServerError("Falha de rede ao criar item.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <h1 className="text-xl font-semibold">Itens</h1>
        <p className="text-sm text-muted-foreground">
          {canCreate ? "Você pode criar e visualizar itens." : "Você pode apenas visualizar itens."}
        </p>
      </div>

      {canCreate ? (
        <Card className="border-border/60 bg-card/70 backdrop-blur">
          <CardHeader>
            <CardTitle>Criar item</CardTitle>
            <CardDescription>Cadastro rápido (campos extras podem ser adicionados depois).</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Nome</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Espada Longa" />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Tipo</label>
                <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="Ex.: weapon" />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Categoria</label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex.: marcial" />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Raridade</label>
                <Input value={rarity} onChange={(e) => setRarity(e.target.value)} placeholder="Ex.: comum" />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Peso</label>
                <Input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" min={0} />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Valor</label>
                <Input value={value} onChange={(e) => setValue(e.target.value)} type="number" min={0} />
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
          ) : items.length ? (
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {items.map((it) => (
                <div key={it.id} className="rounded-md border border-border/60 bg-background/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{it.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{it.slug}</div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">{it.type}</div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {it.category ? `Cat: ${it.category}` : "Sem categoria"}
                    {it.rarity ? ` • Rar: ${it.rarity}` : ""}
                    {typeof it.weight === "number" ? ` • ${it.weight} kg` : ""}
                  </div>
                  {it.description ? (
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-3">{it.description}</div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Nenhum item cadastrado.</div>
          )}
          {serverError ? <div className="text-sm text-destructive">{serverError}</div> : null}
        </CardContent>
      </Card>
    </div>
  )
}

