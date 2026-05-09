"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Spinner } from "@/components/ui/spinner"

const userSchema = z.object({
  user: z
    .string()
    .trim()
    .min(3, "Informe um User válido (mín. 3).")
    .max(40)
    .regex(/^[a-z0-9._-]+$/i, "Use apenas letras, números, ponto, hífen e underscore."),
})

const passwordSchema = z.object({
  password: z.string().min(1, "Informe sua senha."),
})

const createPasswordSchema = z.object({
  password: z
    .string()
    .min(12, "A senha precisa ter no mínimo 12 caracteres.")
    .regex(/[a-z]/, "Inclua pelo menos 1 letra minúscula.")
    .regex(/[A-Z]/, "Inclua pelo menos 1 letra maiúscula.")
    .regex(/[0-9]/, "Inclua pelo menos 1 número.")
    .regex(/[^A-Za-z0-9]/, "Inclua pelo menos 1 símbolo."),
  confirm: z.string(),
}).refine((v) => v.password === v.confirm, { message: "As senhas não conferem.", path: ["confirm"] })

type UserValues = z.infer<typeof userSchema>
type PasswordValues = z.infer<typeof passwordSchema>
type CreatePasswordValues = z.infer<typeof createPasswordSchema>

const characterSlides = [
  "/images/characters/char-01.jpg",
  "/images/characters/char-02.jpg",
  "/images/characters/char-03.jpg",
  "/images/characters/char-04.jpg",
  "/images/characters/char-05.jpg",
  "/images/characters/char-06.jpg",
  "/images/characters/char-07.jpg",
  "/images/characters/char-08.jpg",
  "/images/characters/char-09.jpg",
  "/images/characters/char-10.jpg",
  "/images/characters/char-11.jpg",
  "/images/characters/char-12.jpg",
]

export default function LoginPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [step, setStep] = useState<"user" | "password" | "create-password">("user")
  const [userLocked, setUserLocked] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  const userForm = useForm<UserValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { user: "" },
  })

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  })

  const createPasswordForm = useForm<CreatePasswordValues>({
    resolver: zodResolver(createPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  })

  useEffect(() => {
    let cancelled = false
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => {
        if (!cancelled && r.ok) router.replace("/controle")
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })
    return () => {
      cancelled = true
    }
  }, [router])

  const subtitle = useMemo(
    () => "Digite seu User para continuar.",
    [],
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % characterSlides.length)
    }, 4500)

    return () => window.clearInterval(timer)
  }, [])

  async function handleUser(values: UserValues) {
    setLoading(true)
    setServerError(null)
    try {
      const res = await fetch("/api/auth/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user: values.user }),
      })
      const data = (await res.json()) as { error?: string; exists?: boolean; hasPassword?: boolean }

      if (!res.ok) {
        setServerError("error" in data ? (data.error ?? "Erro ao validar user.") : "Erro ao validar user.")
        return
      }
      if (data.exists === false) {
        setServerError("User não encontrado no sistema.")
        return
      }
      const normalized = values.user.trim().toLowerCase()
      setUserLocked(normalized)
      if (data.exists === true && data.hasPassword) setStep("password")
      else setStep("create-password")
    } catch {
      setServerError("Falha de rede. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(values: PasswordValues) {
    if (!userLocked) return
    setLoading(true)
    setServerError(null)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user: userLocked, password: values.password }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setServerError(data.error ?? "Não foi possível entrar.")
        return
      }
      router.replace("/controle")
      router.refresh()
    } catch {
      setServerError("Falha de rede. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreatePassword(values: CreatePasswordValues) {
    if (!userLocked) return
    setLoading(true)
    setServerError(null)
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ user: userLocked, password: values.password }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setServerError(data.error ?? "Não foi possível cadastrar a senha.")
        return
      }
      setStep("password")
      passwordForm.reset({ password: "" })
    } catch {
      setServerError("Falha de rede. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl rounded-[2rem] border border-border/60 bg-card p-6 shadow-2xl">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
          <Card className="border-none bg-transparent shadow-none">
            <CardHeader className="px-2 pt-3 lg:px-6 lg:pt-6">
              <CardTitle className="font-serif tracking-wide">Alcateia RPG</CardTitle>
              <CardDescription>{subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="px-2 pb-3 lg:px-6 lg:pb-6">
              {checking ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner />
                  Verificando sessão...
                </div>
              ) : (
                <div className="grid gap-4">
                  {step === "user" ? (
                    <Form {...userForm}>
                      <form onSubmit={userForm.handleSubmit(handleUser)} className="grid gap-4">
                        <FormField
                          control={userForm.control}
                          name="user"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>User</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder=""
                                  autoComplete="username"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {serverError ? <div className="text-sm text-destructive">{serverError}</div> : null}

                        <Button type="submit" disabled={loading}>
                          {loading ? (
                            <>
                              <Spinner className="mr-2" /> Verificando...
                            </>
                          ) : (
                            "Continuar"
                          )}
                        </Button>
                      </form>
                    </Form>
                  ) : null}

                  {step === "password" ? (
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(handleLogin)} className="grid gap-4">
                        <div className="text-sm text-muted-foreground">
                          Entrando como <span className="font-medium text-foreground">{userLocked}</span>
                        </div>

                        <FormField
                          control={passwordForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <FormControl>
                                <Input type="password" autoComplete="current-password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {serverError ? <div className="text-sm text-destructive">{serverError}</div> : null}

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={loading}
                            onClick={() => {
                              setStep("user")
                              setUserLocked(null)
                              setServerError(null)
                              passwordForm.reset({ password: "" })
                            }}
                          >
                            Voltar
                          </Button>
                          <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? (
                              <>
                                <Spinner className="mr-2" /> Entrando...
                              </>
                            ) : (
                              "Entrar"
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : null}

                  {step === "create-password" ? (
                    <Form {...createPasswordForm}>
                      <form onSubmit={createPasswordForm.handleSubmit(handleCreatePassword)} className="grid gap-4">
                        <div className="text-sm text-muted-foreground">
                          Esse usuário ainda não tem senha. Crie uma senha forte para{" "}
                          <span className="font-medium text-foreground">{userLocked}</span>.
                        </div>

                        <FormField
                          control={createPasswordForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nova senha</FormLabel>
                              <FormControl>
                                <Input type="password" autoComplete="new-password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createPasswordForm.control}
                          name="confirm"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar senha</FormLabel>
                              <FormControl>
                                <Input type="password" autoComplete="new-password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {serverError ? <div className="text-sm text-destructive">{serverError}</div> : null}

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={loading}
                            onClick={() => {
                              setStep("user")
                              setUserLocked(null)
                              setServerError(null)
                              createPasswordForm.reset({ password: "", confirm: "" })
                            }}
                          >
                            Voltar
                          </Button>
                          <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? (
                              <>
                                <Spinner className="mr-2" /> Salvando...
                              </>
                            ) : (
                              "Cadastrar senha"
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          <section className="flex flex-col items-center justify-center gap-5 py-3">
            <div className="relative h-[300px] w-[300px] overflow-hidden rounded-full border-4 border-border/70 shadow-xl sm:h-[360px] sm:w-[360px] lg:h-[420px] lg:w-[420px]">
              {characterSlides.map((slide, index) => (
                <Image
                  key={slide}
                  src={slide}
                  alt={`Personagem ${index + 1}`}
                  fill
                  priority={index === 0}
                  className={`object-cover transition-opacity duration-700 ${
                    index === activeSlide ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-center gap-2">
              {characterSlides.map((slide, index) => (
                <span
                  key={`${slide}-dot`}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    index === activeSlide ? "bg-primary" : "bg-muted-foreground/40"
                  }`}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

