"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext"; // <-- asegúrate de importar correctamente

export default function Navbar() {
  const { data: session, status } = useSession();
  const { cartItems } = useCart(); // <-- usa cartItems

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 shadow-lg flex justify-between items-center">
      <Link href="/" className="text-cyan-400 font-bold text-xl">
        ⚡ ElectroSite
      </Link>
      <div className="space-x-4 relative">
        <Link href="/" className="hover:text-cyan-400">Inicio</Link>
        <Link href="/proyectos" className="hover:text-cyan-400">Proyectos</Link>
        <Link href="/servicios" className="hover:text-cyan-400">Servicios</Link>
        <Link href="/tienda" className="hover:text-cyan-400">Tienda</Link>
        <Link href="/dashboard" className="hover:text-cyan-400">Panel IoT</Link>
        <Link href="/scada" className="hover:text-cyan-400">SCADA</Link>
        <Link href="/carrito" className="relative text-white hover:text-cyan-400 inline-block">
          🛒 Carrito
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-3 bg-cyan-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {cartItems.length}
            </span>
          )}
        </Link>

        {status === "authenticated" ? (
          <>
            <span className="text-gray-300">Hola, {session.user?.name}</span>
            <button onClick={() => signOut()} className="text-red-400 hover:text-red-500 ml-2">Salir</button>
          </>
        ) : (
          <button onClick={() => signIn()} className="text-cyan-400 hover:text-cyan-600">Ingresar</button>
        )}
      </div>
    </nav>
  );
}
