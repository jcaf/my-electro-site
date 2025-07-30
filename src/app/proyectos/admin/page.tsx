"use client";

import { useState } from "react";

export default function AdminProyectosPage() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nuevoProyecto = {
      titulo,
      descripcion,
      imagen_url: imagenUrl || null,
      video_url: videoUrl || null,
    };

    const res = await fetch("http://localhost:8000/projects/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoProyecto),
    });

    if (res.ok) {
      setMensaje("✅ Proyecto creado correctamente");
      setTitulo("");
      setDescripcion("");
      setImagenUrl("");
      setVideoUrl("");
    } else {
      setMensaje("❌ Error al crear proyecto");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Administrador de Proyectos</h1>

      {mensaje && <p className="mb-4 text-center">{mensaje}</p>}

      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg space-y-4"
      >
        <div>
          <label className="block text-sm font-medium">Título</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Imagen URL</label>
          <input
            type="text"
            value={imagenUrl}
            onChange={(e) => setImagenUrl(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Video URL</label>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
            placeholder="https://..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded"
        >
          Crear Proyecto
        </button>
      </form>
    </div>
  );
}
