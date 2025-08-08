"use client";

const servicios = [
  {
    titulo: "Diseño de Tarjetas Electrónicas",
    descripcion: "Diseñamos PCBs personalizadas para sistemas embebidos, IoT y control industrial.",
    icono: "🧩",
  },
  {
    titulo: "Sistemas Embebidos",
    descripcion: "Programación en C/C++ para microcontroladores, con protocolos como I2C, SPI, UART, CAN.",
    icono: "⚙️",
  },
  {
    titulo: "Automatización y PLCs",
    descripcion: "Desarrollo de lógica industrial con PLCs Siemens, Allen-Bradley y más.",
    icono: "🏭",
  },
  {
    titulo: "IoT y Protocolos Industriales",
    descripcion: "Integración con MQTT, Modbus, HART, PROFINET, SCADA, y control desde celulares.",
    icono: "📡",
  },
  {
    titulo: "Prototipado Rápido",
    descripcion: "Te ayudamos a validar tu idea con prototipos funcionales.",
    icono: "🚀",
  },
  {
    titulo: "Reparación de Tarjetas Electrónicas",
    descripcion: "Diagnóstico y reparación de Tarjetas.",
    icono: "👨‍💻",
  },
  {
    titulo: "Asesoría Técnica Personalizada",
    descripcion: "Consultoría remota para proyectos de electrónica y automatización.",
    icono: "👨‍💻",
  },
];

export default function ServiciosPage() {
  return (
    <main className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white min-h-screen p-10">
      <section className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-400 mb-8 text-center">Servicios Profesionales</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicios.map((servicio, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:shadow-2xl transition duration-300"
            >
              <div className="text-4xl mb-4">{servicio.icono}</div>
              <h2 className="text-xl font-semibold text-cyan-300 mb-2">{servicio.titulo}</h2>
              <p className="text-gray-300">{servicio.descripcion}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
