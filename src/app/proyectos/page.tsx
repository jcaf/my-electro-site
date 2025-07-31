// src/app/proyectos/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { API, toStaticUrl } from "@/lib/api";

type Project = {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_path?: string[]; // ya normalizado por backend
  video_path?: string[];
  fecha_creacion: string;
};

export default function ProyectosPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch(`${API}/projects/`)
      .then((r) => r.json())
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch((e) => console.error("Error cargando proyectos:", e));
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-extrabold text-cyan-400 mb-6">Proyectos</h1>

          {projects.length === 0 ? (
            <p className="text-gray-400">No hay proyectos aún.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => {
                const cover = p.imagen_path?.[0] || p.video_path?.[0]; // primera imagen o primer video
                const isVideo = !!(!p.imagen_path?.[0] && p.video_path?.[0]);

                return (
                  <Link
                    key={p.id}
                    href={`/proyectos/${p.id}`}
                    className="block bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:shadow-xl transition"
                  >
                    <div className="w-full h-48 bg-black flex items-center justify-center">
                      {cover ? (
                        isVideo ? (
                          <video
                            src={toStaticUrl(cover)}
                            className="w-full h-48 object-cover"
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={toStaticUrl(cover)}
                            alt={p.titulo}
                            className="w-full h-48 object-cover"
                          />
                        )
                      ) : (
                        <div className="text-gray-500">Sin portada</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-cyan-300">{p.titulo}</h2>
                      <p className="text-gray-300 text-sm line-clamp-3 mt-1">{p.descripcion}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
