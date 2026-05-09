"use client"

import { useEffect, useMemo, useState } from "react"

function formatMs(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(total / (24 * 3600))
  const hours = Math.floor((total % (24 * 3600)) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return { days, hours, minutes, seconds }
}

export function Countdown({ startAtIso }: { startAtIso: string }) {
  const target = useMemo(() => new Date(startAtIso).getTime(), [startAtIso])
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const diff = target - now
  const f = formatMs(diff)

  if (diff <= 0) return <div className="text-sm text-muted-foreground">Sessão desbloqueada.</div>

  return (
    <div className="grid gap-1">
      <div className="text-sm text-muted-foreground">Desbloqueia em</div>
      <div className="font-mono text-2xl">
        {String(f.days).padStart(2, "0")}d {String(f.hours).padStart(2, "0")}:
        {String(f.minutes).padStart(2, "0")}:{String(f.seconds).padStart(2, "0")}
      </div>
    </div>
  )
}

