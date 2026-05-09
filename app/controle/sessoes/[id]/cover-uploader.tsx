"use client"

import { useCallback, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export function CoverUploader({
  sessionId,
  currentUrl,
}: {
  sessionId: number
  currentUrl: string | null
}) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(currentUrl)

  const preview = useMemo(() => url ?? "", [url])

  const upload = useCallback(
    async (file: File) => {
      setUploading(true)
      setError(null)
      try {
        const fd = new FormData()
        fd.set("file", file)
        const res = await fetch(`/api/sessions/${sessionId}/cover`, { method: "POST", body: fd })
        const data = (await res.json()) as { ok?: boolean; url?: string; error?: string }
        if (!res.ok || !data.url) {
          setError(data.error ?? "Não foi possível enviar a imagem.")
          return
        }
        setUrl(data.url)
      } catch {
        setError("Falha de rede ao enviar.")
      } finally {
        setUploading(false)
      }
    },
    [sessionId],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files?.[0]
      if (file) void upload(file)
    },
    [upload],
  )

  return (
    <div className="grid gap-2">
      <div
        className={cn(
          "rounded-md border border-border/60 bg-background/40",
          "p-3",
          dragOver ? "ring-2 ring-ring/50" : "",
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-1">
            <div className="text-sm font-medium">Capa</div>
            <div className="text-sm text-muted-foreground">
              Arraste uma imagem aqui ou selecione um arquivo (max 5MB).
            </div>
          </div>
          <label>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void upload(f)
              }}
              disabled={uploading}
            />
            <Button type="button" variant="secondary" disabled={uploading} asChild>
              <span>{uploading ? "Enviando..." : "Escolher arquivo"}</span>
            </Button>
          </label>
        </div>

        {uploading ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner /> Enviando imagem...
          </div>
        ) : null}

        {error ? <div className="mt-2 text-sm text-destructive">{error}</div> : null}

        {preview ? (
          <div className="mt-3 overflow-hidden rounded-md border border-border/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Capa" className="h-40 w-full object-cover" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

