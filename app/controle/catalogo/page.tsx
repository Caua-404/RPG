import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/server-session"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function CatalogoPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  return (
    <div className="grid gap-4">
      <div className="grid gap-1">
        <h1 className="text-xl font-semibold">Catálogo</h1>
        <p className="text-sm text-muted-foreground">
          {session.role === "mestre"
            ? "Crie e mantenha raças, sub-raças, itens e magias."
            : "Visualize o conteúdo liberado pelo mestre."}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { href: "/controle/catalogo/racas", title: "Raças", desc: "Bônus, idiomas e traços base." },
          { href: "/controle/catalogo/subracas", title: "Sub-raças", desc: "Variações e características por raça." },
          { href: "/controle/catalogo/itens", title: "Itens", desc: "Equipamentos, armas, armaduras e afins." },
          { href: "/controle/catalogo/magias", title: "Magias", desc: "Lista de magias por nível e escola." },
        ].map((x) => (
          <Card key={x.href} className="border-border/60 bg-card/70 backdrop-blur">
            <CardHeader>
              <CardTitle>{x.title}</CardTitle>
              <CardDescription>{x.desc}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild variant="secondary">
                <Link href={x.href}>Abrir</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

