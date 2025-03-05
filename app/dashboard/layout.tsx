import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[56px] items-center gap-4 border-b px-6 dark:bg-background dark:border-purple-800 ">
          <div className="w-full flex-1 flex items-center">
            <div className="text-sm font-medium text-muted-foreground">
              Tasa de cambio: <span className="font-bold">64,6116 Bs/$</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserNav />
          </div>
        </header>
        <main className="">{children}</main>
      </div>
    </div>
  )
}

