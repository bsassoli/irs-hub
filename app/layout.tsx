import type { Metadata } from "next"
import { EB_Garamond, Nunito_Sans } from "next/font/google"
import "./globals.css"
import "katex/dist/katex.min.css"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

const garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-serif"
})

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-sans"
})

export const metadata: Metadata = {
  title: "Learning Hub",
  description: "Interactive learning applications",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={`${nunitoSans.variable} ${garamond.variable} font-sans`}>
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <SidebarInset>
            <header className="sticky top-0 flex shrink-0 h-14 items-center gap-4 border-b border-[#CCCCCC] bg-white px-6">
              <SidebarTrigger className="-ml-1" />
            </header>
            <main className="flex-1 p-8 max-w-7xl">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  )
}
