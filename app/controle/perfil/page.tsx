import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/server-session"
import { LogoutButton } from "./logout-button"
import { ProfileClient } from "./profile-client"

export default async function PerfilPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-xl font-semibold">Perfil</h1>
        <p className="text-sm text-muted-foreground">Painel pessoal de jogador.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-background/40">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <div className="p-4">
          <div className="grid gap-1 text-sm">
            <div className="text-lg font-semibold">{session.name}</div>
            <div className="text-muted-foreground">@{session.username}</div>
            <div className="mt-1 inline-flex w-fit rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              {session.role}
            </div>
          </div>
        </div>
      </div>

      <ProfileClient />

      <div className="flex justify-end">
        <LogoutButton />
      </div>
    </div>
  )
}

