"use client"
import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function Login() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl)
    }
  }, [status, router, callbackUrl])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        username,
        password,
        callbackUrl,
        redirect: false
      })

      if (result?.error) {
        setError("Credenciales incorrectas")
      } else if (result?.ok) {
        router.push(callbackUrl)
      }
    } catch (err) {
      setError("Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return <div className="max-w-md mx-auto mt-20 text-center">Cargando...</div>
  }

  if (status === "authenticated") {
    return <div className="max-w-md mx-auto mt-20 text-center">Redirigiendo...</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <form onSubmit={handleLogin} className="max-w-md w-full mx-4 bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Iniciar Sesión</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-600 text-white rounded text-sm">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <input
            name="username"
            className="border border-gray-600 bg-gray-700 text-white p-3 w-full rounded focus:outline-none focus:border-cyan-500"
            placeholder="Usuario (admin)"
            required
            disabled={loading}
          />
        </div>
        
        <div className="mb-6">
          <input
            name="password"
            type="password"
            className="border border-gray-600 bg-gray-700 text-white p-3 w-full rounded focus:outline-none focus:border-cyan-500"
            placeholder="Contraseña (admin123)"
            required
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-4 py-3 rounded w-full font-medium"
          disabled={loading}
        >
          {loading ? "Iniciando sesión..." : "Entrar"}
        </button>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-cyan-400 hover:underline text-sm"
          >
            ← Volver
          </button>
        </div>
      </form>
    </div>
  )
}
