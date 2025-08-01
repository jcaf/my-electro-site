"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { API, toStaticUrl } from "@/lib/api";

type Proyecto = {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_path: string[];
  fecha_creacion: string;
};

export default function ProyectosPage() {
  const [projects, setProjects] = useState<Proyecto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  /* Leer lista paginada */
  useEffect(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      order: "date_desc",
    });

    fetch(`${API}/projects/?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setProjects(data.items ?? []);
        setTotal(data.total ?? 0);
      })
      .catch((e) => console.error("Error cargando proyectos:", e));
  }, [page]);

  /* UI */
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 text-white p-6">
        <h1 className="text-3xl font-extrabold text-cyan-400 mb-6">
          Proyectos
        </h1>

        {projects.length === 0 ? (
          <p className="text-gray-400">No hay proyectos para mostrar.</p>
        ) : (
          <>
            {/* Grid de tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => (
                <a
                  key={p.id}
                  href={`/proyectos/${p.id}`}
                  className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:shadow-xl transition"
                >
                  {/* miniatura: primera imagen o placeholder */}
                  <img
                    src={
                      p.imagen_path?.length
                        ? toStaticUrl(p.imagen_path[0])
                        : "/placeholder.jpg"
                    }
                    alt={p.titulo}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="font-semibold text-lg text-cyan-300">
                      {p.titulo}
                    </h2>
                    <p className="text-sm text-gray-400 line-clamp-3">
                      {p.descripcion}
                    </p>
                    <span className="block text-xs text-gray-500 mt-2">
                      {new Date(p.fecha_creacion).toLocaleDateString()}
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {/* Paginación simple */}
            {total > pageSize && (
              <div className="mt-6 flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  disabled={page * pageSize >= total}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
