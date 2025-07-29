export default function QrYapePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-10 text-center">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Pagar con Yape</h1>
      <p className="mb-4 text-gray-300">Escanea este código QR con tu app de Yape para completar el pago:</p>
      <img
        src="/qr-yape.png" // <-- Coloca tu imagen QR real en public/qr-yape.png
        alt="QR Yape"
        className="mx-auto w-64 h-64 border-4 border-white rounded-lg"
      />
      <p className="mt-4 text-gray-400">Una vez que hayas pagado, por favor envíanos un mensaje de WhatsApp con el comprobante.</p>
    </div>
  );
}
