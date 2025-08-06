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
    <main className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-3xl font-bold mb-6">Proyectos</h1>

      {projects.length === 0 ? (
        <p className="text-gray-300">No hay proyectos publicados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => {
            const coverRel = p.imagen_path?.[0]; // primera imagen
            const coverUrl = coverRel ? `${API}/static/${encodeURI(coverRel)}` : null;

            return (
              <Link
                key={p.id}
                href={`/proyectos/${p.id}`}
                className="block bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition"
              >
                <div className="aspect-video bg-gray-700">
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverUrl}
                      alt={p.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold">{p.titulo}</h2>
                  <p className="text-sm text-gray-300 line-clamp-2 mt-1">
                    {p.descripcion}
                  </p>
                  {!!p.tags?.length && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {p.tags!.map((t, i) => (
                        <span
                          key={i}
                          className="text-xs bg-cyan-700/20 text-cyan-300 px-2 py-0.5 rounded"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
