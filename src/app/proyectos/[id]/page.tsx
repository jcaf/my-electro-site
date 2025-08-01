"use client";

/* ---------- Imports ---------- */
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { API, toStaticUrl } from "@/lib/api";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useSession, signIn } from "next-auth/react";

/* ---------- Tipos ---------- */
type Project = {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_path: string[];
  video_path: string[];
  fecha_creacion: string;
};

type CommentItem = {
  id: number;
  user_id: number;
  texto: string;
  estrellas: number;
  fecha: string;
};

type CommentsPage = {
  total: number;
  page: number;
  page_size: number;
  items: CommentItem[];
};

type Summary = {
  count: number;
  avg: number;
  distribution: { stars: number; count: number }[];
};

/* ---------- Helpers ---------- */
function Stars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-block text-yellow-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i}>{i <= rounded ? "★" : "☆"}</span>
      ))}
      <span className="ml-1 text-gray-300 text-sm align-middle">
        {value.toFixed(1)}
      </span>
    </span>
  );
}

/* ---------- Componente ---------- */
export default function ProyectoDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const [project, setProject] = useState<Project | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [commentsPage, setCommentsPage] = useState<CommentsPage | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  /* Form comentario */
  const [texto, setTexto] = useState("");
  const [estrellas, setEstrellas] = useState(5);

  /* Cargar proyecto */
  useEffect(() => {
    if (!params?.id) return;
    fetch(`${API}/projects/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Proyecto no encontrado");
        return r.json();
      })
      .then(setProject)
      .catch(() => router.push("/proyectos"));
  }, [params?.id, router]);

  /* Cargar summary */
  useEffect(() => {
    if (!project) return;
    fetch(`${API}/comments/summary/${project.id}`)
      .then((r) => r.json())
      .then(setSummary);
  }, [project]);

  /* Cargar comments paginados */
  useEffect(() => {
    if (!project) return;
    fetch(
      `${API}/comments/${project.id}?page=${page}&page_size=${pageSize}`
    )
      .then((r) => r.json())
      .then(setCommentsPage);
  }, [project, page]);

  /* Galería unificada */
  const gallery = useMemo(() => {
    if (!project) return [];
    const imgs = project.imagen_path?.map((p) => ({
      type: "img" as const,
      src: toStaticUrl(p),
    }));
    const vids = project.video_path?.map((p) => ({
      type: "vid" as const,
      src: toStaticUrl(p),
    }));
    return [...(imgs || []), ...(vids || [])];
  }, [project]);

  /* Publicar comentario */
  const submitComment = async () => {
    if (!session?.user?.email) {
      signIn();
      return;
    }
    if (!texto.trim()) return;
    try {
      // ⚠️ user_id está fijo en 1. Reemplaza con ID real si lo necesitas
      const user_id = 1;
      const qs = new URLSearchParams({
        proyecto_id: project!.id.toString(),
        user_id: user_id.toString(),
        texto,
        estrellas: estrellas.toString(),
      });
      const res = await fetch(`${API}/comments/?${qs.toString()}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(await res.text());
      setTexto("");
      // refrescar summary & comments
      fetch(`${API}/comments/summary/${project!.id}`)
        .then((r) => r.json())
        .then(setSummary);
      setPage(1);
    } catch (e) {
      alert("Error publicando comentario");
    }
  };

  /* ---------- Render ---------- */
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 text-white p-6">
        {!project ? (
          <p>Cargando…</p>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* Título */}
            <h1 className="text-3xl font-extrabold text-cyan-400">
              {project.titulo}
            </h1>
            <p className="text-gray-300 mt-2">{project.descripcion}</p>

            {/* Galería Swiper */}
            {gallery.length > 0 && (
              <div className="mt-6">
                <Swiper spaceBetween={10} slidesPerView={1}>
                  {gallery.map((g, i) => (
                    <SwiperSlide key={i}>
                      {g.type === "img" ? (
                        <img
                          src={g.src}
                          alt=""
                          className="w-full max-h-[500px] object-contain bg-black"
                        />
                      ) : (
                        <video
                          src={g.src}
                          controls
                          className="w-full max-h-[500px] bg-black"
                        />
                      )}
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}

            {/* Summary estrellas */}
            {summary && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-cyan-300">
                  Valoración
                </h2>
                {summary.count === 0 ? (
                  <p className="text-gray-400">Sin valoraciones aún.</p>
                ) : (
                  <div className="mt-1">
                    <Stars value={summary.avg} />{" "}
                    <span className="text-gray-400">
                      ({summary.count} opiniones)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Comentarios list */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-cyan-300">
                Comentarios
              </h2>

              {commentsPage?.items?.length ? (
                <>
                  <div className="mt-3 space-y-3">
                    {commentsPage.items.map((c) => (
                      <div
                        key={c.id}
                        className="bg-gray-800 border border-gray-700 p-3 rounded"
                      >
                        <div className="text-yellow-400">
                          {"★".repeat(c.estrellas)}
                          {"☆".repeat(5 - c.estrellas)}
                        </div>
                        <p className="text-gray-200">{c.texto}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(c.fecha).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Paginación */}
                  {commentsPage.total > pageSize && (
                    <div className="mt-4 flex gap-2">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <button
                        disabled={page * pageSize >= commentsPage.total}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-400 mt-2">
                  No hay comentarios todavía.
                </p>
              )}
            </div>

            {/* Form comentario */}
            {session ? (
              <div className="mt-8">
                <h3 className="font-semibold text-cyan-300">
                  Añadir comentario
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <label>Estrellas: </label>
                  <select
                    value={estrellas}
                    onChange={(e) => setEstrellas(parseInt(e.target.value))}
                    className="bg-gray-800 border border-gray-700 rounded p-1"
                  >
                    {[5, 4, 3, 2, 1].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  rows={3}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Escribe tu opinión…"
                  className="mt-2 w-full bg-gray-800 border border-gray-700 rounded p-2"
                />
                <button
                  onClick={submitComment}
                  className="mt-2 bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded"
                >
                  Publicar
                </button>
              </div>
            ) : (
              <p className="mt-4 text-gray-400">
                <button
                  className="text-cyan-400 underline"
                  onClick={() => signIn()}
                >
                  Inicia sesión
                </button>{" "}
                para comentar.
              </p>
            )}
          </div>
        )}
      </main>
    </>
  );
}
