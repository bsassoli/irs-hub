import Link from "next/link"
import { apps, categories } from "@/lib/apps"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Benvenuto su IRS Hub</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Seleziona un'applicazione dalla barra laterale per iniziare
        </p>
      </div>

      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category} className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight">{category}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {apps
                .filter((app) => app.category === category)
                .map((app) => (
                  <Link key={app.id} href={`/apps/${app.id}`}>
                    <Card className="h-full transition-all hover:shadow-md hover:border-foreground/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-2xl">{app.icon}</span>
                          <span className="text-lg">{app.title}</span>
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {app.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
