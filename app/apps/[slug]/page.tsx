import { apps } from "@/lib/apps"
import { notFound } from "next/navigation"
import BettingCalculator from "@/components/apps/scommesse-eque-probabilita"
import BayesCoinDemo from "@/components/apps/bayes-moneta"
import { ChevronRight, LayoutGrid } from "lucide-react"
import Link from "next/link"

export default async function AppPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const app = apps.find((a) => a.id === slug)

    if (!app) {
        notFound()
    }

    // Route to the correct component based on slug
    const components: Record<string, React.ComponentType> = {
        'scommesse-eque-probabilita': BettingCalculator,
        'bayes-moneta': BayesCoinDemo,
    }

    const Component = components[app.id]

    if (!Component) {
        return <div>Component not found</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link href="/" className="flex items-center gap-2 hover:text-foreground transition-colors">
                    <LayoutGrid className="h-4 w-4" />
                    <span>IRS Hub</span>
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">{app.title}</span>
            </div>

            <div className="space-y-6">
                <Component />
            </div>
        </div>
    )
}