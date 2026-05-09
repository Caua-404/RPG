"use client"

import { ChangeEvent, PointerEvent, useEffect, useRef, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Spinner } from "@/components/ui/spinner"

const schema = z.object({
  displayName: z.string().trim().min(2, "Informe como devemos chamar você (mín. 2).").max(190),
  playerBio: z.string().max(2000).optional().or(z.literal("")),
  playerNotes: z.string().max(2000).optional().or(z.literal("")),
})

type FormValues = z.infer<typeof schema>
const CROP_PREVIEW_SIZE = 220
const CROP_OUTPUT_SIZE = 512

export function ProfileClient() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [avatarSource, setAvatarSource] = useState<string | null>(null)
  const [avatarMimeType, setAvatarMimeType] = useState<string>("")
  const [imageNatural, setImageNatural] = useState<{ width: number; height: number } | null>(null)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [avatarVersion, setAvatarVersion] = useState(Date.now())
  const [userId, setUserId] = useState<number | null>(null)
  const dragRef = useRef<{ active: boolean; x: number; y: number }>({ active: false, x: 0, y: 0 })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: "", playerBio: "", playerNotes: "" },
  })

  function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "")
      reader.onerror = () => reject(new Error("Nao foi possivel ler a imagem."))
      reader.readAsDataURL(file)
    })
  }

  function loadImage(source: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error("Nao foi possivel carregar a imagem."))
      img.src = source
    })
  }

  function getRenderMetrics(viewportSize: number, zoomValue: number, dims: { width: number; height: number } | null) {
    if (!dims) return { renderedWidth: viewportSize, renderedHeight: viewportSize }
    const baseScale = Math.max(viewportSize / dims.width, viewportSize / dims.height)
    const finalScale = baseScale * zoomValue
    return {
      renderedWidth: dims.width * finalScale,
      renderedHeight: dims.height * finalScale,
    }
  }

  function clampPan(nextX: number, nextY: number, viewportSize: number, zoomValue: number) {
    const metrics = getRenderMetrics(viewportSize, zoomValue, imageNatural)
    const maxX = Math.max(0, (metrics.renderedWidth - viewportSize) / 2)
    const maxY = Math.max(0, (metrics.renderedHeight - viewportSize) / 2)
    return {
      x: Math.min(maxX, Math.max(-maxX, nextX)),
      y: Math.min(maxY, Math.max(-maxY, nextY)),
    }
  }

  async function buildCroppedAvatarBase64() {
    if (!avatarSource || !imageNatural) return ""
    const image = await loadImage(avatarSource)
    const viewport = CROP_OUTPUT_SIZE
    const canvas = document.createElement("canvas")
    canvas.width = viewport
    canvas.height = viewport
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Nao foi possivel preparar o recorte.")

    const metrics = getRenderMetrics(viewport, zoom, imageNatural)
    const factor = viewport / CROP_PREVIEW_SIZE
    const safePan = clampPan(panX, panY, CROP_PREVIEW_SIZE, zoom)
    const drawX = (viewport - metrics.renderedWidth) / 2 + safePan.x * factor
    const drawY = (viewport - metrics.renderedHeight) / 2 + safePan.y * factor

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(image, drawX, drawY, metrics.renderedWidth, metrics.renderedHeight)
    const mime = avatarMimeType || "image/png"
    return canvas.toDataURL(mime, 0.92).split(",")[1] || ""
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setAvatarSource(null)
      setAvatarMimeType("")
      return
    }
    const source = await readFileAsDataUrl(file)
    const image = await loadImage(source)
    setAvatarSource(source)
    setAvatarMimeType(file.type || "image/png")
    setImageNatural({ width: image.naturalWidth, height: image.naturalHeight })
    setPanX(0)
    setPanY(0)
    setZoom(1)
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (!avatarSource) return
    dragRef.current = { active: true, x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active || !avatarSource) return
    const dx = event.clientX - dragRef.current.x
    const dy = event.clientY - dragRef.current.y
    dragRef.current = { ...dragRef.current, x: event.clientX, y: event.clientY }
    const next = clampPan(panX + dx, panY + dy, CROP_PREVIEW_SIZE, zoom)
    setPanX(next.x)
    setPanY(next.y)
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  useEffect(() => {
    let cancelled = false
    fetch("/api/profile", { cache: "no-store" })
      .then(async (r) => {
        const data = (await r.json()) as {
          ok?: boolean
          profile?: { displayName?: string | null; hasAvatar?: boolean; playerBio?: string | null; playerNotes?: string | null }
          error?: string
        }
        const meRes = await fetch("/api/auth/me", { cache: "no-store" })
        if (meRes.ok) {
          const me = (await meRes.json()) as { user?: { id?: string } }
          const id = Number(me.user?.id)
          if (Number.isFinite(id)) setUserId(id)
        }
        if (!cancelled && r.ok) {
          form.reset({
            displayName: data.profile?.displayName ?? "",
            playerBio: data.profile?.playerBio ?? "",
            playerNotes: data.profile?.playerNotes ?? "",
          })
          if (data.profile?.hasAvatar) setAvatarVersion(Date.now())
        } else if (!cancelled) {
          setError(data.error ?? "Não foi possível carregar o perfil.")
        }
      })
      .catch(() => {
        if (!cancelled) setError("Falha de rede.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [form])

  async function onSubmit(values: FormValues) {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const avatarBase64 = avatarSource ? await buildCroppedAvatarBase64() : ""
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          avatarBase64,
          avatarMimeType: avatarSource ? avatarMimeType : "",
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok) {
        setError(data.error ?? "Não foi possível salvar.")
        return
      }
      setSaved(true)
      setAvatarSource(null)
      setAvatarMimeType("")
      setAvatarVersion(Date.now())
    } catch {
      setError("Falha de rede.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-border/60 bg-card/70 backdrop-blur">
      <CardHeader>
        <CardTitle>Seu perfil de jogador</CardTitle>
        <CardDescription>
          Informações de jogador. Campos de perfil ficam visíveis para mestres.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner /> Carregando...
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <div className="flex items-center gap-4 rounded-lg border border-border/60 bg-background/40 p-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border">
                  {avatarSource ? (
                    <img
                      src={avatarSource}
                      alt="Pre-visualizacao do recorte"
                      className="h-full w-full object-cover"
                      style={{
                        transform: `translate(${panX * (80 / CROP_PREVIEW_SIZE)}px, ${panY * (80 / CROP_PREVIEW_SIZE)}px) scale(${zoom})`,
                      }}
                    />
                  ) : (
                    <img
                      src={userId ? `/api/users/avatar/${userId}?v=${avatarVersion}` : "/placeholder.svg"}
                      alt="Avatar atual"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="grid flex-1 gap-3">
                  <FormLabel>Foto de perfil</FormLabel>
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => void handleAvatarChange(e)}
                  />
                  {avatarSource ? (
                    <div className="grid gap-3 rounded-md border border-border/60 bg-background/60 p-3">
                      <div className="text-xs text-muted-foreground">
                        Arraste a foto para enquadrar na area fixa do avatar.
                      </div>
                      <div
                        className="relative mx-auto h-[220px] w-[220px] touch-none overflow-hidden rounded-full border border-border bg-muted/30"
                        onPointerDown={startDrag}
                        onPointerMove={moveDrag}
                        onPointerUp={endDrag}
                        onPointerLeave={endDrag}
                      >
                        <img
                          src={avatarSource}
                          alt="Editor de recorte"
                          className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                          draggable={false}
                          style={{
                            width: imageNatural ? `${imageNatural.width}px` : undefined,
                            height: imageNatural ? `${imageNatural.height}px` : undefined,
                            transform: imageNatural
                              ? `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${
                                  Math.max(CROP_PREVIEW_SIZE / imageNatural.width, CROP_PREVIEW_SIZE / imageNatural.height) * zoom
                                })`
                              : undefined,
                          }}
                        />
                      </div>
                      <div className="grid gap-2">
                        <FormLabel className="text-xs">Zoom</FormLabel>
                        <input
                          type="range"
                          min={1}
                          max={3}
                          step={0.05}
                          value={zoom}
                          onChange={(e) => {
                            const nextZoom = Number(e.target.value)
                            const next = clampPan(panX, panY, CROP_PREVIEW_SIZE, nextZoom)
                            setZoom(nextZoom)
                            setPanX(next.x)
                            setPanY(next.y)
                          }}
                          aria-label="Zoom da foto"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome de exibição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex.: Cauã" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="playerBio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio do jogador</FormLabel>
                    <FormControl>
                      <Input placeholder="Sobre você no jogo..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="playerNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Informações visíveis para mestres</FormLabel>
                    <FormControl>
                      <Input placeholder="Preferências, disponibilidade, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error ? <div className="text-sm text-destructive">{error}</div> : null}
              {saved ? <div className="text-sm text-muted-foreground">Salvo.</div> : null}

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Spinner className="mr-2" /> Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}

