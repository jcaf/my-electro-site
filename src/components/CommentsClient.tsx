"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import StarRating from "./StarRating";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type CommentItem = {
  id: number;
  proyecto_id: number;
  estrellas: number;
  content_html: string;
  created_at: string;
  user?: { id: number; email: string } | null;
};

export default function CommentsClient({ projectId }: { projectId: number }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CommentItem[]>([]);
  const [stars, setStars] = useState(5);
  const [content, setContent] = useState("");

  const userEmail = session?.user?.email ?? "";

  const load = async () => {
    const r = await fetch(`${API}/comments/${projectId}?page=1&page_size=20`, { cache: "no-store" });
    const data = await r.json();
    setItems(Array.isArray(data?.items) ? data.items : []);
  };

  useEffect(() => {
    load();
  }, [projectId]);

  const avg = useMemo(() => {
    if (!items.length) return 0;
    return items.reduce((a, c) => a + (c.estrellas || 0), 0) / items.length;
  }, [items]);

  const submit = async () => {
    if (status !== "authenticated") {
      // Redirigir al login con callback URL
      await signIn("credentials", {
        callbackUrl: window.location.href
      });
      return;
    }
    if (!content.trim()) {
      alert("Por favor escribe un comentario");
      return;
    }

    const payload = {
      proyecto_id: projectId,
      user_email: userEmail,
      estrellas: stars,
      content_html: content, // el backend limpia con bleach
    };

    try {
      const r = await fetch(`${API}/comments/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // credentials no son necesarias porque el backend no valida cookie
        body: JSON.stringify(payload),
      });

      if (r.ok) {
        setContent("");
        setStars(5);
        load();
        alert("Comentario publicado exitosamente");
      } else {
        const txt = await r.text();
        alert("Error al publicar comentario: " + txt);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Error de conexión al publicar comentario");
    }
  };

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold mb-4">Comentarios</h2>

      {/* Caja de escritura */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-300">
            {status === "authenticated" ? userEmail : "No autenticado"}
          </span>
          <StarRating value={stars} onChange={setStars} />
        </div>

        {/* Editor simple: textarea (puedes integrar react-quill luego) */}
        <textarea
          className="w-full h-28 bg-gray-900 border border-gray-700 rounded p-3 text-sm text-gray-100"
          placeholder="Escribe tu comentario (soporta formato básico en backend)…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="mt-3 flex justify-end">
          {status === "authenticated" ? (
            <button
              onClick={submit}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white"
            >
              Publicar
            </button>
          ) : (
            <button
              onClick={() => signIn("credentials", {
                callbackUrl: window.location.href
              })}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white"
            >
              Ingresar para comentar
            </button>
          )}
        </div>
      </div>

      {/* Resumen */}
      <div className="flex items-center gap-3 mb-4">
        <StarRating value={Math.round(avg)} readOnly />
        <span className="text-sm text-gray-300">
          Promedio: {avg.toFixed(1)} ({items.length} {items.length === 1 ? "comentario" : "comentarios"})
        </span>
      </div>

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {items.map((c) => (
          <div key={c.id} className="bg-gray-800 border border-gray-700 rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <StarRating value={c.estrellas} readOnly />
              <span className="text-xs text-gray-400">
                {new Date(c.created_at).toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-gray-400 mb-2">
              {c.user?.email}
            </div>
            {/* mostramos HTML limpiado por backend */}
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: c.content_html }}
            />
          </div>
        ))}

        {!items.length && (
          <p className="text-gray-400">Aún no hay comentarios.</p>
        )}
      </div>
    </section>
  );
}
