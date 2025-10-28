"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { apps, categories } from "@/lib/apps"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar collapsible="icon" className="border-r border-[#CCCCCC] bg-[#FAFAFA]">
            <SidebarHeader className="border-b border-[#CCCCCC] px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-[#003366]">
                        <span className="text-xl">📚</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-serif text-lg font-semibold text-black">IRS Hub</span>
                        <span className="text-xs text-[#666666]">Learning</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-4 py-6">
                {categories.map((category) => (
                    <SidebarGroup key={category} className="mb-8">
                        <SidebarGroupLabel className="px-2 mb-3 text-xs font-semibold uppercase tracking-wider text-[#666666]">
                            {category}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {apps
                                    .filter((app) => app.category === category)
                                    .map((app) => (
                                        <SidebarMenuItem key={app.id}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={pathname === `/apps/${app.id}`}
                                                className="h-auto px-3 py-3 data-[active=true]:bg-white data-[active=true]:border-l-2 data-[active=true]:border-l-[#003366] data-[active=true]:text-black hover:bg-white/50 transition-colors"
                                            >
                                                <Link href={`/apps/${app.id}`} className="flex items-start gap-3 w-full">
                                                    <span className="text-lg flex-shrink-0 mt-0.5">{app.icon}</span>
                                                    <span className="flex-1 text-sm leading-relaxed text-black break-words">{app.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
