import Link from "next/link";
import CommentsClient from "@/components/CommentsClient";
import MediaGallery from "@/components/MediaGallery";

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

async function getProject(id: string): Promise<Proyecto> {
  const res = await fetch(`${API}/projects/${id}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("No se pudo cargar el proyecto");
  }
  return res.json();
}

export default async function ProyectoDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proyecto = await getProject(id);

  const imgs = Array.isArray(proyecto.imagen_path) ? proyecto.imagen_path : [];
  const vids = Array.isArray(proyecto.video_path) ? proyecto.video_path : [];

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{proyecto.titulo}</h1>
          <Link
            href="/proyectos"
            className="text-sm text-cyan-300 hover:underline"
          >
            ← Volver a proyectos
          </Link>
        </div>

        {!!proyecto.tags?.length && (
          <div className="mb-4 flex flex-wrap gap-2">
            {proyecto.tags!.map((t, i) => (
              <span
                key={i}
                className="text-xs bg-cyan-700/20 text-cyan-300 px-2 py-0.5 rounded"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        <p className="text-gray-200 mb-8 whitespace-pre-wrap">
          {proyecto.descripcion}
        </p>

        {/* Media Gallery */}
        <MediaGallery images={imgs} videos={vids} apiUrl={API} />

        {/* Comentarios (cliente) */}
        <CommentsClient projectId={Number(id)} />
      </div>
    </main>
  );
}
