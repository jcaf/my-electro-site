"use client";

import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";

export default function CarritoPage() {
  const { cartItems, removeFromCart, clearCart } = useCart();

  const total = cartItems.reduce((sum, item) => sum + item.precio, 0);

  // Generar mensaje para WhatsApp
  const generarMensajeWhatsApp = () => {
    const mensaje = cartItems
      .map((item) => `🛠 ${item.nombre} - S/ ${item.precio.toFixed(2)}`)
      .join("\n");
    const mensajeFinal = `👋 Hola, deseo comprar los siguientes productos:\n\n${mensaje}\n\n💰 Total: S/ ${total.toFixed(2)}\n\nGracias.`;
    const numero = "51999999999"; // <-- tu número con código país (ej. Perú: 51)
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensajeFinal)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-900 min-h-screen text-white p-10">
        <h1 className="text-3xl font-bold text-cyan-400 mb-6">Carrito de Compras</h1>
        {cartItems.length === 0 ? (
          <p className="text-gray-300">Tu carrito está vacío.</p>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-700"
              >
                <div>
                  <h2 className="font-semibold text-lg">{item.nombre}</h2>
                  <p className="text-sm text-gray-400">S/ {item.precio.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(i)}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                >
                  Quitar
                </button>
              </div>
            ))}

            <div className="text-right space-y-4">
              <p className="text-xl font-semibold">Total: S/ {total.toFixed(2)}</p>
              <button
                onClick={clearCart}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
              >
                Vaciar Carrito
              </button>

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                <button
                  onClick={generarMensajeWhatsApp}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  📲 Finalizar por WhatsApp
                </button>

                <a
                  href="/qr-yape"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-center"
                >
                  💳 Pagar con Yape
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
