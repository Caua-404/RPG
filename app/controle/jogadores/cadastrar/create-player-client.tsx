"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Spinner } from "@/components/ui/spinner"

const schema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "User minimo de 3 caracteres.")
    .max(40)
    .regex(/^[a-z0-9._-]+$/i, "Use letras, numeros, ponto, hifen e underscore."),
  name: z.string().trim().min(2, "Informe um nome (min. 2).").max(190),
  role: z.enum(["mestre", "jogador"], { required_error: "Selecione o perfil." }),
})

type FormValues = z.infer<typeof schema>

export function CreatePlayerClient() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", name: "", role: "jogador" },
  })

  async function onSubmit(values: FormValues) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/users/jogadores", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok) {
        setError(data.error ?? "Nao foi possivel cadastrar.")
        return
      }
      router.push("/controle/jogadores")
      router.refresh()
    } catch {
      setError("Falha de rede.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardHeader>
        <CardTitle>Cadastrar usuario</CardTitle>
        <CardDescription>
          Informe apenas user, nome e perfil. Foto, bio e observacoes serao preenchidas pelo proprio usuario.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <FormControl>
                      <Input placeholder="caua.moura" autoCapitalize="none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex.: Joao" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil</FormLabel>
                  <FormControl>
                    <select
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      aria-label="Perfil"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="jogador">Jogador</option>
                      <option value="mestre">Mestre</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error ? <div className="text-sm text-destructive">{error}</div> : null}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => router.push("/controle/jogadores")} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Spinner className="mr-2" /> Salvando...
                  </>
                ) : (
                  "Cadastrar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
