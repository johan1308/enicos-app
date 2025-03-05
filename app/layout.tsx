import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SalesProvider } from "@/lib/sales-context"
import { InventoryProvider } from "@/lib/inventory-context"
import { ClientsProvider } from "@/lib/clients-context"
import { SuppliersProvider } from "@/lib/suppliers-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ENICOS - Sistema de Gestión de Inventario",
  description: "Un sistema integral de gestión de inventario",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <InventoryProvider>
            <ClientsProvider>
              <SuppliersProvider>
                <SalesProvider>
                  {children}
                  <Toaster />
                </SalesProvider>
              </SuppliersProvider>
            </ClientsProvider>
          </InventoryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'