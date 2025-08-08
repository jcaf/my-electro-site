// src/app/layout.tsx
import "./globals.css"
import { Inter } from "next/font/google"
import { Providers } from "@/providers"
import Navbar from "@/components/Navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "My Electro Site",
  description: "IoT, SCADA y Electrónica",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-900`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-4">
              <div className="container mx-auto px-4">
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
