import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/server-session"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function ControleHomePage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  let sessions: Array<{
    id: number
    title: string
    style: string
    startAt: Date
    coverImageUrl: string | null
  }> = []
  if (session.role === "mestre") {
    sessions = await prisma.session.findMany({
      where: { masterUserId: Number(session.sub) },
      orderBy: { startAt: "asc" },
      select: { id: true, title: true, style: true, startAt: true, coverImageUrl: true },
    })
  } else {
    const access = await prisma.sessionAccess.findMany({
      where: { userId: Number(session.sub) },
      orderBy: { session: { startAt: "asc" } },
      select: { session: { select: { id: true, title: true, style: true, startAt: true, coverImageUrl: true } } },
    })
    sessions = access.map((a) => a.session)
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-xl font-semibold">Sessões</h1>
          <p className="text-sm text-muted-foreground">
            {session.role === "mestre"
              ? "Crie e gerencie sessões e permissões."
              : "Sessões liberadas para você pelo mestre."}
          </p>
        </div>

        {session.role === "mestre" ? (
          <Button asChild>
            <Link href="/controle/sessoes/nova">Criar sessão</Link>
          </Button>
        ) : null}
      </div>

      {sessions.length ? (
        <div className="grid gap-3">
          {sessions.map((s) => (
            <Card key={s.id} className="border-border/60 bg-card/70 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Link className="hover:underline" href={`/controle/sessoes/${s.id}`}>
                    {s.title}
                  </Link>
                  <Badge variant="secondary">{s.style}</Badge>
                </CardTitle>
                <CardDescription>Início: {new Date(s.startAt).toLocaleString("pt-BR")}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-muted-foreground">Nº {s.id}</div>
                  <Button asChild variant="secondary">
                    <Link href={`/controle/sessoes/${s.id}`}>Abrir</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/60 bg-card/70 backdrop-blur">
          <CardHeader>
            <CardTitle>Nenhuma sessão</CardTitle>
            <CardDescription>
              {session.role === "mestre"
                ? "Crie a primeira sessão e selecione os jogadores com acesso."
                : "Aguarde o mestre liberar uma sessão para você."}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}

