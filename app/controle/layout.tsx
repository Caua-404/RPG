import { redirect } from "next/navigation"
import Link from "next/link"
import { getServerSession } from "@/lib/server-session"
import { prisma } from "@/lib/prisma"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button asChild variant="ghost" className="w-full justify-start">
      <Link href={href}>{children}</Link>
    </Button>
  )
}

export default async function ControleLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect("/login")
  const userId = Number(session.sub)
  const currentUser = Number.isFinite(userId)
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { displayName: true, avatarMimeType: true },
      })
    : null
  const headerName = currentUser?.displayName || session.name

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-3 py-3 md:px-4 md:py-4">
        <header className="mb-3 flex items-center justify-between border border-border/60 bg-card/70 px-4 py-3 backdrop-blur">
          <div>
            <div className="text-lg font-semibold">Painel de Controle</div>
            <div className="text-sm text-muted-foreground">Gestao de sessoes e usuarios</div>
          </div>
          <Link
            href="/controle/perfil"
            className="flex items-center gap-3 rounded-full border border-border/60 bg-background/40 px-2 py-1 pr-3 transition-colors hover:bg-accent"
          >
            <img
              src={currentUser?.avatarMimeType ? `/api/users/avatar/${userId}` : "/placeholder.svg"}
              alt={`Perfil de ${headerName}`}
              className="h-9 w-9 rounded-full border border-border/60 object-cover"
            />
            <span className="max-w-[180px] truncate text-sm font-medium">{headerName}</span>
          </Link>
        </header>

        <div className="grid min-h-[calc(100vh-92px)] grid-cols-1 border border-border/60 bg-card/70 backdrop-blur md:grid-cols-[260px_1fr]">
          <aside
            className={cn(
              "bg-transparent p-3 md:h-full",
              "border-b border-border/60 md:border-b-0 md:border-r",
              "md:sticky md:top-0",
            )}
          >
            <div className="px-2 py-2">
              <div className="font-serif text-lg tracking-wide">Controle</div>
              <div className="text-xs text-muted-foreground">
                {session.name} • {session.role}
              </div>
            </div>

            <div className="mt-3 grid gap-1">
              <NavLink href="/controle">Sessões</NavLink>
              {session.role === "mestre" ? <NavLink href="/controle/jogadores">Jogadores</NavLink> : null}
              <NavLink href="/controle/catalogo">Catálogo</NavLink>
              <NavLink href="/controle/perfil">Perfil</NavLink>
            </div>
          </aside>

          <main className="bg-transparent p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

