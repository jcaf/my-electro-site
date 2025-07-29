"use client";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
    <Navbar />
      <main className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white min-h-screen p-10">
        <section className="max-w-5xl mx-auto text-center space-y-8">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-cyan-400">
            Innovación en Ingeniería Electrónica
          </h1>
          <p className="text-xl text-gray-300">
            Desarrollo de sistemas embebidos, automatización industrial, PLCs, IoT, diseño de tarjetas electrónicas y más.
          </p>
          <div className="space-x-6">
            <a href="/servicios" className="bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-6 rounded-full text-lg">Ver Servicios</a>
            <a href="/tienda" className="bg-white text-gray-800 hover:bg-gray-200 py-2 px-6 rounded-full text-lg">Comprar Productos</a>
            <a href="/carrito" className="hover:text-cyan-400">Carrito</a>

          </div>
          <img src="/hero-iot.svg" alt="iot" className="w-full max-w-xl mx-auto mt-10 opacity-80" />
        </section>
      </main>
    </>
  );
}
