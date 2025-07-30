"use client"; 

import { useState } from "react";

export default function AdminProjectsPage() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState("");
  const [video, setVideo] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/projects/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo,
        descripcion,
        imagen_url: imagen,
        video_url: video,
      }),
    });
    if (res.ok) {
      setMensaje("Proyecto creado con éxito ✅");
      setTitulo("");
      setDescripcion("");
      setImagen("");
      setVideo("");
    } else {
      setMensaje("Error al crear proyecto ❌");
    }
  };

  return (
    <div className="p-10 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Administrar Proyectos</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input className="w-full p-2 rounded bg-gray-800" placeholder="Título"
          value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <textarea className="w-full p-2 rounded bg-gray-800" placeholder="Descripción"
          value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="URL Imagen"
          value={imagen} onChange={(e) => setImagen(e.target.value)} />
        <input className="w-full p-2 rounded bg-gray-800" placeholder="URL Video"
          value={video} onChange={(e) => setVideo(e.target.value)} />
        <button className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded">Guardar</button>
      </form>
      {mensaje && <p className="mt-4">{mensaje}</p>}
    </div>
  );
}
