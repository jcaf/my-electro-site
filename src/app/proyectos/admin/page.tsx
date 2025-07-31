"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ----- Tipos -----
type Kind = "image" | "video";

interface MediaItem {
  id: string;      // único para drag
  kind: Kind;      // image | video
  file: File;      // archivo crudo
  preview: string; // URL.createObjectURL
}

// ----- Mini componente para item draggable -----
function SortableThumb({
  id,
  src,
  kind,
  onRemove,
}: {
  id: string;
  src: string;
  kind: Kind;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative rounded-lg overflow-hidden bg-gray-800 border border-gray-700"
    >
      {kind === "image" ? (
        <img src={src} alt="preview" className="w-32 h-32 object-cover" />
      ) : (
        <video src={src} className="w-32 h-32 object-cover" controls />
      )}

      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        title="Arrastrar para reordenar"
        className="absolute left-1 top-1 bg-black/50 text-white text-xs px-2 py-1 rounded"
      >
        ⠿
      </button>

      {/* Eliminar */}
      <button
        onClick={onRemove}
        title="Eliminar"
        className="absolute right-1 top-1 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
      >
        ×
      </button>
    </div>
  );
}

// ----- Página principal -----
export default function AdminProyectosPage() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Una sola dropzone -> separamos a 2 listas por tipo
  const [images, setImages] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Sensores para DnD
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Utilidad para id único
  const newId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

  // Manejo de entrada de archivos (input o drop)
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const arr = Array.from(fileList);
    const imgItems: MediaItem[] = [];
    const vidItems: MediaItem[] = [];
    for (const f of arr) {
      const preview = URL.createObjectURL(f);
      const kind: Kind = f.type.startsWith("image/") ? "image" : f.type.startsWith("video/") ? "video" : "image";
      const item: MediaItem = { id: newId(), kind, file: f, preview };
      if (kind === "image") imgItems.push(item);
      else vidItems.push(item);
    }
    setImages((prev) => [...prev, ...imgItems]);
    setVideos((prev) => [...prev, ...vidItems]);
  };

  // Drop y drag-over de la zona principal
  const onDropZoneDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const onDropZoneDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Eliminar items
  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const removeVideo = (id: string) => {
    setVideos((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  // Drag-end por lista
  const onDragEndImages = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setImages((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === String(active.id));
      const newIndex = prev.findIndex((i) => i.id === String(over.id));
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const onDragEndVideos = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setVideos((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === String(active.id));
      const newIndex = prev.findIndex((i) => i.id === String(over.id));
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  // Envío al backend (respeta orden actual)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descripcion.trim()) {
      alert("Completa título y descripción");
      return;
    }
    setSubmitting(true);

    const formData = new FormData();
    formData.append("titulo", titulo);
    formData.append("descripcion", descripcion);
    images.forEach((it) => formData.append("imagenes", it.file));
    videos.forEach((it) => formData.append("videos", it.file));

    try {
      console.log("🚀 Creando proyecto…", { titulo, descripcion, images: images.length, videos: videos.length });
      const res = await fetch("http://127.0.0.1:8000/projects/", {
        method: "POST",
        body: formData, // <— multipart/form-data
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        // puede ser texto simple de error
      }

      console.log("📡 Status:", res.status, "↩︎", data ?? text);

      if (!res.ok) {
        alert(`Error al crear el proyecto: ${res.status}`);
        return;
      }

      alert("✅ Proyecto creado con éxito");
      // Limpieza
      images.forEach((i) => URL.revokeObjectURL(i.preview));
      videos.forEach((v) => URL.revokeObjectURL(v.preview));
      setTitulo("");
      setDescripcion("");
      setImages([]);
      setVideos([]);
    } catch (err) {
      console.error("❌ Error enviando al backend:", err);
      alert("No se pudo conectar con el backend");
    } finally {
      setSubmitting(false);
    }
  };

  // Limpieza de objectURLs al desmontar
  useEffect(() => {
    return () => {
      images.forEach((i) => URL.revokeObjectURL(i.preview));
      videos.forEach((v) => URL.revokeObjectURL(v.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // IDs para SortableContext
  const imageIds = useMemo(() => images.map((i) => i.id), [images]);
  const videoIds = useMemo(() => videos.map((v) => v.id), [videos]);

  return (
    <main className="bg-gray-900 min-h-screen text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-cyan-400 mb-6">
          Administrador de Proyectos
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="titulo" className="block text-sm text-gray-300 mb-1">
                Título
              </label>
              <input
                id="titulo"
                name="titulo"
                type="text"
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="descripcion" className="block text-sm text-gray-300 mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={4}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Dropzone única */}
          <div
            onDrop={onDropZoneDrop}
            onDragOver={onDropZoneDragOver}
            className="w-full p-6 rounded-2xl border-2 border-dashed border-cyan-500/70 bg-gray-800/50 text-center hover:bg-gray-800 transition"
          >
            <p className="text-gray-300">
              Arrastra <b>imágenes y videos</b> aquí o{" "}
              <label htmlFor="filePicker" className="text-cyan-300 underline cursor-pointer">
                selecciónalos
              </label>
            </p>
            <input
              id="filePicker"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Galería de Imágenes (sortable) */}
          {images.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-cyan-300 mb-2">Imágenes ({images.length})</h2>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEndImages}>
                <SortableContext items={imageIds} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((it) => (
                      <SortableThumb
                        key={it.id}
                        id={it.id}
                        src={it.preview}
                        kind="image"
                        onRemove={() => removeImage(it.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </section>
          )}

          {/* Galería de Videos (sortable) */}
          {videos.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-cyan-300 mb-2">Videos ({videos.length})</h2>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEndVideos}>
                <SortableContext items={videoIds} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {videos.map((it) => (
                      <SortableThumb
                        key={it.id}
                        id={it.id}
                        src={it.preview}
                        kind="video"
                        onRemove={() => removeVideo(it.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </section>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg"
            >
              {submitting ? "Creando…" : "Crear Proyecto"}
            </button>

            <button
              type="button"
              onClick={() => {
                images.forEach((i) => URL.revokeObjectURL(i.preview));
                videos.forEach((v) => URL.revokeObjectURL(v.preview));
                setImages([]);
                setVideos([]);
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Limpiar galería
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
