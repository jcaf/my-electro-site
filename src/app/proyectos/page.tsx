"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

interface Comment {
  id: number;
  proyecto_id: number;
  user_id: number;
  texto: string;
  estrellas: number;
  fecha: string;
}

export default function ProyectosPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/comments/")
      .then((res) => res.json())
      .then((data) => {
        console.log("DATA:", data);
        setComments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("ERROR FETCH COMMENTS:", err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white min-h-screen p-10">
        <section className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-cyan-400 mb-6">Proyectos y Comentarios</h1>

          {loading && <p className="text-gray-400">Cargando comentarios...</p>}

          {!loading && comments.length === 0 && (
            <p className="text-gray-400">No hay comentarios aún.</p>
          )}

          <div className="space-y-4 mt-6">
            {comments.map((c) => (
              <div key={c.id} className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                <p className="text-lg text-cyan-300 font-semibold">Proyecto ID: {c.proyecto_id}</p>
                <p className="mt-2">{c.texto}</p>
                <p className="text-yellow-400 mt-1">⭐ {c.estrellas}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {new Date(c.fecha).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
