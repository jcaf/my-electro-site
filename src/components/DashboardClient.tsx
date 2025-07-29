"use client"

import { useSession } from "next-auth/react"

export default function DashboardClient() {
  const { data: session, status } = useSession()

  if (status === "loading") return <p className="text-white">Cargando...</p>

  if (!session) {
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold text-blue-700">Bienvenido, {session.user?.name}</h1>
      <p className="mt-4">Tu sesión está activa. Aquí verás tu panel.</p>
    </div>
  )
}
