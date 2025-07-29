// src/app/layout.tsx
import "./globals.css"
import { Inter } from "next/font/google"
import { Providers } from "@/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "My Electro Site",
  description: "IoT, SCADA y Electrónica",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
