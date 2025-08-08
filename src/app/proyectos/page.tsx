"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Proyecto = {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_path: string[] | null;
  video_path: string[] | null;
  tags?: string[] | null;
  fecha_creacion: string;
};

export default function ProyectosPage() {
  const [projects, setProjects] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/projects/?page=1&page_size=9&order=date_desc`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data?.items) ? data.items : [];
        setProjects(items);
      })
      .catch((e) => console.error("Error cargando proyectos:", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 text-white p-10">
        <h1 className="text-3xl font-bold mb-6">Proyectos</h1>
        <p>Cargando…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-cyan-400">Nuestros Proyectos</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">Descubre nuestra innovación en electrónica, automatización y sistemas embebidos</p>
        </div>

        {projects.length === 0 ? (
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-12 text-center max-w-2xl mx-auto">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">No hay proyectos publicados aún</h3>
            <p className="text-gray-400">Estamos trabajando en emocionantes proyectos para mostrar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {projects.map((p) => {
              const coverRel = p.imagen_path?.[0]; // primera imagen
              const coverUrl = coverRel ? `${API}/static/${encodeURI(coverRel)}` : null;

              return (
                <Link
                  key={p.id}
                  href={`/proyectos/${p.id}`}
                  className="block bg-gray-800/40 border border-gray-700 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-cyan-500/40 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02]"
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-700/50 to-gray-800/50">
                    {coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={coverUrl}
                        alt={p.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-center">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h2 className="text-lg font-bold mb-2 line-clamp-2">{p.titulo}</h2>
                    <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                      {p.descripcion}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {p.tags?.slice(0, 3).map((t, i) => (
                        <span
                          key={i}
                          className="text-xs bg-cyan-900/30 text-cyan-300 px-2.5 py-1 rounded-full"
                        >
                          #{t}
                        </span>
                      ))}
                      {p.tags && p.tags.length > 3 && (
                        <span className="text-xs bg-gray-700/50 text-gray-400 px-2.5 py-1 rounded-full">
                          +{p.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
