"use client"
import { signIn } from "next-auth/react"

export default function Login() {
  const handleLogin = async (e) => {
    e.preventDefault()
    const username = e.target.username.value
    const password = e.target.password.value
    await signIn("credentials", {
      username, password, callbackUrl: "/dashboard"
    })
  }

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto mt-20 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>
      <input name="username" className="border p-2 w-full mb-4" placeholder="Usuario" />
      <input name="password" type="password" className="border p-2 w-full mb-4" placeholder="Contraseña" />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Entrar</button>
    </form>
  )
}
