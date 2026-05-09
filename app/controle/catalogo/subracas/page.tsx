import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/server-session"
import { SubracasClient } from "./subracas-client"

export default async function SubracasPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  return <SubracasClient canCreate={session.role === "mestre"} />
}

