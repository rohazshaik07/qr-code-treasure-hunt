import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import NavLinks from "./components/nav-links"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Campus Treasure Hunt",
  description: "A digital scavenger hunt experience on campus",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <NavLinks />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'