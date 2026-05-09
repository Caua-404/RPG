import { redirect } from "next/navigation"
import Link from "next/link"
import { getServerSession } from "@/lib/server-session"
import { Button } from "@/components/ui/button"
import { CreatePlayerClient } from "./create-player-client"

export default async function CadastrarJogadorPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")
  if (session.role !== "mestre") redirect("/controle")

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Cadastrar jogador</h1>
          <p className="text-sm text-muted-foreground">
            Cadastro inicial simplificado. O usuario completa foto, bio e observacoes depois do primeiro acesso.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/controle/jogadores">Voltar para lista</Link>
        </Button>
      </div>
      <CreatePlayerClient />
    </div>
  )
}
