import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/server-session"
import { ItensClient } from "./itens-client"

export default async function ItensPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  return <ItensClient canCreate={session.role === "mestre"} />
}

