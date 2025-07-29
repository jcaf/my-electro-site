"use client";

import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";


const productos = [
  {
    nombre: "Placa IoT ESP32 con WiFi/Bluetooth",
    descripcion: "Ideal para proyectos de monitoreo remoto y domótica.",
    precio: 120.00,
    imagen: "/productos/esp32-board.jpg",
  },
  {
    nombre: "Módulo Sensor de CO2 + Temp/Hum",
    descripcion: "Sensor integrado para monitoreo ambiental en tiempo real.",
    precio: 95.50,
    imagen: "/productos/sensor-co2.jpg",
  },
  {
    nombre: "Tarjeta PLC Custom",
    descripcion: "Desarrollada para automatización industrial con entradas/salidas digitales y analógicas.",
    precio: 240.00,
    imagen: "/productos/plc-board.jpg",
  },
];

export default function TiendaPage() {
  const { addToCart } = useCart(); // ✅ ¡Esta línea es necesaria!
  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white min-h-screen p-10">
        <section className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-cyan-400 mb-10 text-center">Tienda de Productos Electrónicos</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {productos.map((producto, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-lg hover:shadow-2xl transition"
              >
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h2 className="text-xl font-semibold text-cyan-300">{producto.nombre}</h2>
                <p className="text-gray-300 text-sm mt-2">{producto.descripcion}</p>
                <p className="text-cyan-400 font-bold mt-4">S/ {producto.precio.toFixed(2)}</p>
                <button 
                onClick={() => addToCart(producto)}
                className="mt-4 w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-md">
                  Agregar al carrito
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
