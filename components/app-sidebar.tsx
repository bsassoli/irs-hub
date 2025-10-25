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
} from "@/components/ui/sidebar"

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar>
            <SidebarHeader className="border-b px-6 py-4">
                <h2 className="text-lg font-semibold">📚 Learning Hub</h2>
            </SidebarHeader>

            <SidebarContent>
                {categories.map((category) => (
                    <SidebarGroup key={category}>
                        <SidebarGroupLabel>{category}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {apps
                                    .filter((app) => app.category === category)
                                    .map((app) => (
                                        <SidebarMenuItem key={app.id}>
                                            <SidebarMenuButton asChild isActive={pathname === `/apps/${app.id}`}>
                                                <Link href={`/apps/${app.id}`}>
                                                    <span className="mr-2">{app.icon}</span>
                                                    {app.title}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
        </Sidebar>
    )
}
