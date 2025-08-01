"use client";

import { useState, useEffect, DragEvent } from "react";
import { useSession, signIn } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { API } from "@/lib/api";

/* ---------- Tipos ---------- */
type Preview = { file: File; url: string };

/* ---------- Utilidades ---------- */
const fetchUserRole = async (email: string) => {
  const res = await fetch(
    `${API}/users/by-email?email=${encodeURIComponent(email)}`
  );
  if (!res.ok) throw new Error("No se pudo verificar rol");
  const json = await res.json();
  return json.role as string;
};

/* ---------- Componente ---------- */
export default function AdminProyectosPage() {
  /* sesión */
  const { data: session, status } = useSession();

  /* verificación de rol */
  const [allowed, setAllowed] = useState<boolean | null>(null);
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.email) {
      setAllowed(false);
      return;
    }
    fetchUserRole(session.user.email)
      .then((role) => setAllowed(role === "admin"))
      .catch(() => setAllowed(false));
  }, [status, session?.user?.email]);

  /* estado del formulario */
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imgPreviews, setImgPreviews] = useState<Preview[]>([]);
  const [vidPreviews, setVidPreviews] = useState<Preview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  /* drag & drop handlers */
  const onFilesDrop = (e: DragEvent<HTMLDivElement>, type: "img" | "vid") => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const previews = files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    }));
    if (type === "img") setImgPreviews((p) => [...p, ...previews]);
    else setVidPreviews((p) => [...p, ...previews]);
  };

  /* reordenamiento sencillo (click to move up) */
  const moveUp = (index: number, type: "img" | "vid") => {
    const arr = type === "img" ? [...imgPreviews] : [...vidPreviews];
    if (index === 0) return;
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    type === "img" ? setImgPreviews(arr) : setVidPreviews(arr);
  };

  /* submit */
  const handleSubmit = async () => {
    if (!titulo || !descripcion) {
      setMsg("Título y descripción son obligatorios");
      return;
    }
    setSubmitting(true);
    setMsg(null);

    try {
      /* 1️⃣ Crear proyecto (título + descripción) y subir arrays de files */
      const form = new FormData();
      form.append("titulo", titulo);
      form.append("descripcion", descripcion);
      imgPreviews.forEach((p) => form.append("imagenes", p.file));
      vidPreviews.forEach((p) => form.append("videos", p.file));

      const res = await fetch(`${API}/projects/`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Error al crear proyecto");
      }

      setMsg("✅ Proyecto creado con éxito");
      // limpiar
      setTitulo("");
      setDescripcion("");
      setImgPreviews([]);
      setVidPreviews([]);
    } catch (e: any) {
      setMsg("❌ " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Render ---------- */
  if (status === "loading" || allowed === null) {
    return (
      <>
        <Navbar />
        <main className="p-8 text-white bg-gray-900">Verificando permisos…</main>
      </>
    );
  }
  if (!allowed) {
    return (
      <>
        <Navbar />
        <main className="p-8 text-white bg-gray-900">
          <p>No tienes permisos para acceder a esta página.</p>
          {!session && (
            <button
              className="mt-4 px-4 py-2 bg-cyan-600 rounded"
              onClick={() => signIn()}
            >
              Ingresar
            </button>
          )}
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-3xl font-extrabold text-cyan-400 mb-6">
          Nuevo Proyecto
        </h1>

        {/* Formulario */}
        <div className="space-y-4 max-w-3xl">
          <input
            type="text"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded p-2"
          />
          <textarea
            rows={4}
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded p-2"
          />

          {/* Drag & drop zona imágenes */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onFilesDrop(e, "img")}
            className="border-2 border-dashed border-cyan-600 rounded p-4 text-center cursor-pointer"
          >
            Arrastra imágenes aquí
            <input
              multiple
              accept="image/*"
              type="file"
              hidden
              onChange={(e) =>
                setImgPreviews([
                  ...imgPreviews,
                  ...Array.from(e.target.files || []).map((f) => ({
                    file: f,
                    url: URL.createObjectURL(f),
                  })),
                ])
              }
            />
          </div>

          {/* Previews imágenes */}
          {imgPreviews.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {imgPreviews.map((p, i) => (
                <div key={i} className="relative group">
                  <img
                    src={p.url}
                    alt=""
                    className="w-32 h-32 object-cover rounded"
                  />
                  <button
                    onClick={() => moveUp(i, "img")}
                    className="absolute top-1 left-1 bg-black/60 text-xs px-1 rounded opacity-0 group-hover:opacity-100"
                  >
                    ↑
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Drag & drop zona videos */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onFilesDrop(e, "vid")}
            className="border-2 border-dashed border-cyan-600 rounded p-4 text-center cursor-pointer"
          >
            Arrastra videos aquí
            <input
              multiple
              accept="video/*"
              type="file"
              hidden
              onChange={(e) =>
                setVidPreviews([
                  ...vidPreviews,
                  ...Array.from(e.target.files || []).map((f) => ({
                    file: f,
                    url: URL.createObjectURL(f),
                  })),
                ])
              }
            />
          </div>

          {/* Previews videos */}
          {vidPreviews.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {vidPreviews.map((p, i) => (
                <div key={i} className="relative group">
                  <video
                    src={p.url}
                    className="w-32 h-32 object-cover rounded"
                  />
                  <button
                    onClick={() => moveUp(i, "vid")}
                    className="absolute top-1 left-1 bg-black/60 text-xs px-1 rounded opacity-0 group-hover:opacity-100"
                  >
                    ↑
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Mensaje / Botón */}
          {msg && <p className="text-sm">{msg}</p>}

          <button
            disabled={submitting}
            onClick={handleSubmit}
            className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded disabled:opacity-50"
          >
            {submitting ? "Subiendo…" : "Crear proyecto"}
          </button>
        </div>
      </main>
    </>
  );
}
