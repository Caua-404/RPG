"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"

const schema = z.object({
  title: z.string().min(3, "Informe um título (mín. 3).").max(190),
  description: z.string().max(5000).optional(),
  style: z.enum(["acao", "terror", "comedia", "drama", "fantasia", "misterio", "outro"]),
  startAt: z.string().min(1, "Informe a data/hora de início."),
  initialLevel: z.coerce.number().int().min(1).max(20),
  worldRestrictions: z.string().max(10000).optional(),
  allowedUserIds: z.array(z.number()).default([]),
})

type FormValues = z.infer<typeof schema>

type Player = { id: number; name: string; username: string }

export default function NovaSessaoPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [loadingPlayers, setLoadingPlayers] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      style: "outro",
      startAt: "",
      initialLevel: 1,
      worldRestrictions: "",
      allowedUserIds: [],
    },
  })

  useEffect(() => {
    let cancelled = false
    fetch("/api/users/jogadores", { cache: "no-store" })
      .then(async (r) => {
        const data = (await r.json()) as { ok?: boolean; users?: any[]; error?: string }
        if (!cancelled && r.ok && data.users) {
          setPlayers(
            data.users.map((u) => ({ id: Number(u.id), name: String(u.name), username: String(u.username) })),
          )
        }
        if (!cancelled && !r.ok) setServerError(data.error ?? "Não foi possível carregar jogadores.")
      })
      .catch(() => {
        if (!cancelled) setServerError("Não foi possível carregar jogadores.")
      })
      .finally(() => {
        if (!cancelled) setLoadingPlayers(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const styles = useMemo(
    () => [
      { id: "acao", label: "Ação" },
      { id: "terror", label: "Terror" },
      { id: "comedia", label: "Comédia" },
      { id: "drama", label: "Drama" },
      { id: "fantasia", label: "Fantasia" },
      { id: "misterio", label: "Mistério" },
      { id: "outro", label: "Outro" },
    ] as const,
    [],
  )

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    setServerError(null)
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = (await res.json()) as { ok?: boolean; id?: number; error?: string }
      if (!res.ok || !data.id) {
        setServerError(data.error ?? "Não foi possível criar a sessão.")
        return
      }
      router.replace(`/controle/sessoes/${data.id}`)
      router.refresh()
    } catch {
      setServerError("Falha de rede. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-xl font-semibold">Criar sessão</h1>
        <p className="text-sm text-muted-foreground">
          O mestre define as regras e escolhe quais jogadores terão acesso.
        </p>
      </div>

      <Card className="border-border/60 bg-card/70 backdrop-blur">
        <CardHeader>
          <CardTitle>Informações</CardTitle>
          <CardDescription>Essas informações ficam visíveis aos jogadores.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da campanha</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex.: O Fim Começa Agora" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Contexto, objetivos, tom..." className="min-h-24" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estilo</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {styles.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de início</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="initialLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nível inicial</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={20} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="worldRestrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>O que não existe no mundo</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex.: sem magias, sem animais, sem tecnologia..."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-md border border-border/60 bg-background/40 p-3">
                <div className="text-sm font-medium">Acesso de jogadores</div>
                <div className="text-sm text-muted-foreground">
                  Apenas jogadores selecionados verão essa sessão.
                </div>

                {loadingPlayers ? (
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner /> Carregando jogadores...
                  </div>
                ) : (
                  <div className="mt-3 grid gap-2">
                    {players.length ? (
                      players.map((p) => {
                        const checked = form.watch("allowedUserIds").includes(p.id)
                        return (
                          <label key={p.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                const current = form.getValues("allowedUserIds")
                                const next = v
                                  ? Array.from(new Set([...current, p.id]))
                                  : current.filter((id) => id !== p.id)
                                form.setValue("allowedUserIds", next, { shouldDirty: true })
                              }}
                            />
                            <span className="text-foreground">{p.name}</span>
                            <span className="text-muted-foreground">(@{p.username})</span>
                          </label>
                        )
                      })
                    ) : (
                      <div className="text-sm text-muted-foreground">Nenhum jogador encontrado.</div>
                    )}
                  </div>
                )}
              </div>

              {serverError ? <div className="text-sm text-destructive">{serverError}</div> : null}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => router.back()} disabled={submitting}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Spinner className="mr-2" /> Criando...
                    </>
                  ) : (
                    "Criar sessão"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

