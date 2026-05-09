import { redirect } from "next/navigation"
import Link from "next/link"
import { getServerSession } from "@/lib/server-session"
import { Button } from "@/components/ui/button"
import { PlayersClient } from "./players-client"

export default async function JogadoresPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")
  if (session.role !== "mestre") redirect("/controle")

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Jogadores</h1>
          <p className="text-sm text-muted-foreground">
            Aqui voce acompanha os usuarios cadastrados. Cadastro inicial fica em pagina separada.
          </p>
        </div>
        <Button asChild>
          <Link href="/controle/jogadores/cadastrar">Cadastrar jogador</Link>
        </Button>
      </div>

      <PlayersClient />
    </div>
  )
}

