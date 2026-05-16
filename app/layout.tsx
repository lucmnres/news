import type { Metadata } from "next"
import { IBM_Plex_Mono, Noto_Serif, Inter } from "next/font/google"
import "./globals.css"
import { NavBar } from "@/components/NavBar"
import { Providers } from "@/components/Providers"

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
})

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-noto-serif",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Knowledge Portal — Botpress",
  description: "Share links and files with the team",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${ibmPlexMono.variable} ${notoSerif.variable} ${inter.variable}`}
    >
      <body className="min-h-screen bg-paper-canvas text-ink antialiased">
        <Providers>
          <NavBar />
          <main className="mx-auto max-w-[1432px] px-6 py-10">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
