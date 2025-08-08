"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext"; // <-- asegúrate de importar correctamente

export default function Navbar() {
  const { data: session, status } = useSession();
  const { cartItems } = useCart(); // <-- usa cartItems

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md text-white px-4 sm:px-6 py-3 shadow-lg border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
        <Link href="/" className="flex items-center space-x-2 text-cyan-400 font-bold text-xl">
          <span className="bg-gray-800 p-1 rounded">
            ⚡
          </span>
          <span>ElectroSite</span>
        </Link>
        
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 relative">
          <Link href="/" className="hover:text-cyan-400 transition-colors px-2 py-1 rounded hover:bg-gray-800/50">Inicio</Link>
          <Link href="/proyectos" className="hover:text-cyan-400 transition-colors px-2 py-1 rounded hover:bg-gray-800/50">Proyectos</Link>
          <Link href="/servicios" className="hover:text-cyan-400 transition-colors px-2 py-1 rounded hover:bg-gray-800/50">Servicios</Link>
          <Link href="/tienda" className="hover:text-cyan-400 transition-colors px-2 py-1 rounded hover:bg-gray-800/50">Tienda</Link>
          <Link href="/dashboard" className="hover:text-cyan-400 transition-colors px-2 py-1 rounded hover:bg-gray-800/50">Panel IoT</Link>
          <Link href="/scada" className="hover:text-cyan-400 transition-colors px-2 py-1 rounded hover:bg-gray-800/50">SCADA</Link>
          
          <Link href="/carrito" className="relative text-white hover:text-cyan-400 inline-block px-2 py-1 rounded hover:bg-gray-800/50 transition-colors">
            🛒 Carrito
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </Link>

          {status === "authenticated" ? (
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <span className="text-gray-300 text-sm bg-gray-800/50 px-3 py-1 rounded-full">Hola, {session.user?.name}</span>
              <button
                onClick={() => signOut()}
                className="text-red-400 hover:text-red-300 text-sm bg-gray-800/50 hover:bg-gray-800 px-3 py-1 rounded-full transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              className="text-cyan-400 hover:text-cyan-300 text-sm bg-gray-800/50 hover:bg-gray-800 px-3 py-1 rounded-full mt-2 sm:mt-0 transition-colors"
            >
              Ingresar
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
