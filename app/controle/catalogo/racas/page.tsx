import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/server-session"
import { RacasClient } from "./racas-client"

export default async function RacasPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  return <RacasClient canCreate={session.role === "mestre"} />
}

