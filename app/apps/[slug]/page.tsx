import { apps } from "@/lib/apps"
import { notFound } from "next/navigation"
import BettingCalculator from "@/components/apps/scommesse-eque-probabilita"

export default async function AppPage({ params }: { params: { slug: string } }) {
    const app = apps.find((a) => a.id === params.slug)

    if (!app) {
        notFound()
    }

    // Route to the correct component based on slug
    const components: Record<string, React.ComponentType> = {
        'scommesse-eque-probabilita': BettingCalculator,
    }

    const Component = components[app.id]

    if (!Component) {
        return <div>Component not found</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{app.icon} {app.title}</h1>
                <p className="text-muted-foreground mt-2">{app.description}</p>
            </div>
            <Component />
        </div>
    )
}