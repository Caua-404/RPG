import Link from "next/link"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "@/lib/server-session"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Countdown } from "./countdown"
import { CoverUploader } from "./cover-uploader"

function styleLabel(s: string) {
  switch (s) {
    case "acao":
      return "Ação"
    case "terror":
      return "Terror"
    case "comedia":
      return "Comédia"
    case "drama":
      return "Drama"
    case "fantasia":
      return "Fantasia"
    case "misterio":
      return "Mistério"
    default:
      return "Outro"
  }
}

export default async function SessaoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const me = await getServerSession()
  if (!me) redirect("/login")

  const { id } = await params
  const sessionId = Number(id)
  if (!Number.isFinite(sessionId)) redirect("/controle")

  const s = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      masterUserId: true,
      title: true,
      description: true,
      style: true,
      startAt: true,
      initialLevel: true,
      worldRestrictions: true,
      coverImageUrl: true,
    },
  })
  if (!s) redirect("/controle")

  const uid = Number(me.sub)
  if (me.role === "mestre") {
    if (s.masterUserId !== uid) redirect("/controle")
  } else {
    const access = await prisma.sessionAccess.findUnique({
      where: { sessionId_userId: { sessionId, userId: uid } },
      select: { sessionId: true },
    })
    if (!access) redirect("/controle")
  }

  const startAtIso = new Date(s.startAt).toISOString()
  const locked = Date.now() < new Date(s.startAt).getTime()

  return (
    <div className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{s.title}</h1>
            <Badge variant="secondary">{styleLabel(s.style)}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Início: {new Date(s.startAt).toLocaleString("pt-BR")} • Nível inicial: {s.initialLevel}
          </p>
        </div>

        <Button asChild variant="secondary">
          <Link href="/controle">Voltar</Link>
        </Button>
      </div>

      {me.role !== "mestre" && locked ? (
        <Card className="border-border/60 bg-card/70 backdrop-blur">
          <CardHeader>
            <CardTitle>Sessão bloqueada</CardTitle>
            <CardDescription>
              Você pode ler as informações, mas só poderá criar fichas quando o mestre desbloquear (na data/hora).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Countdown startAtIso={startAtIso} />
          </CardContent>
        </Card>
      ) : null}

      {me.role === "mestre" ? (
        <CoverUploader sessionId={s.id} currentUrl={s.coverImageUrl} />
      ) : s.coverImageUrl ? (
        <div className="overflow-hidden rounded-md border border-border/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.coverImageUrl} alt="Capa" className="h-40 w-full object-cover" />
        </div>
      ) : null}

      <Card className="border-border/60 bg-card/70 backdrop-blur">
        <CardHeader>
          <CardTitle>Informações</CardTitle>
          <CardDescription>Definidas pelo mestre.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {s.description ? <div className="whitespace-pre-wrap text-sm">{s.description}</div> : null}

          {s.worldRestrictions ? (
            <div className="rounded-md border border-border/60 bg-background/40 p-3">
              <div className="text-sm font-medium">O que não existe no mundo</div>
              <div className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{s.worldRestrictions}</div>
            </div>
          ) : null}

          {me.role !== "mestre" && locked ? (
            <div className="text-sm text-muted-foreground">
              Criação de ficha: <span className="font-medium text-foreground">bloqueada</span>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Criação de ficha: <span className="font-medium text-foreground">liberada</span> (próximo passo)
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

