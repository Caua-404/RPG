import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/server-session"
import { MagiasClient } from "./magias-client"

export default async function MagiasPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  return <MagiasClient canCreate={session.role === "mestre"} />
}

