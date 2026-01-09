import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/Navbar"
import { SessionProvider } from "@/components/SessionProvider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin", "vietnamese"] })

export const metadata: Metadata = {
  title: "WebPhim - Đặt vé xem phim trực tuyến",
  description: "Đặt vé xem phim nhanh chóng, tiện lợi",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <SessionProvider>
          <Navbar />
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
