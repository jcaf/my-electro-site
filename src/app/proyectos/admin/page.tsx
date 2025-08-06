"use client";

import { useEffect, useState } from "react";
import { API } from "@/lib/api";
import { useSession, signIn } from "next-auth/react";

type FileBox = { file: File; url: string };

export default function ProyectosAdminPage() {
  const { data: session } = useSession();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tagsText, setTagsText] = useState("");

  const [imgs, setImgs] = useState<FileBox[]>([]);
  const [vids, setVids] = useState<FileBox[]>([]);
  const [docs, setDocs] = useState<FileBox[]>([]);

  // drag reorder común
  const handleReorder = (arr: FileBox[], from: number, to: number): FileBox[] => {
    const copy = [...arr];
    const [m] = copy.splice(from, 1);
    copy.splice(to, 0, m);
    return copy;
  };

  const onDrop = (files: FileList, kind: "img" | "vid" | "doc") => {
    const mapped: FileBox[] = Array.from(files).map(f => ({
      file: f,
      url: URL.createObjectURL(f),
    }));
    if (kind === "img") setImgs(prev => [...prev, ...mapped]);
    if (kind === "vid") setVids(prev => [...prev, ...mapped]);
    if (kind === "doc") setDocs(prev => [...prev, ...mapped]);
  };

  const submit = async () => {
    if (!session?.user?.email) { signIn(); return; }

    const fd = new FormData();
    fd.append("titulo", titulo);
    fd.append("descripcion", descripcion);
    const tags = tagsText.split(",").map(t => t.trim()).filter(Boolean);
    tags.forEach(t => fd.append("tags", t));
    imgs.forEach(({ file }) => fd.append("imagenes", file));
    vids.forEach(({ file }) => fd.append("videos", file));
    docs.forEach(({ file }) => fd.append("documentos", file));

    const r = await fetch(`${API}/projects/`, { method: "POST", body: fd });
    if (!r.ok) {
      const t = await r.text();
      alert("Error: " + t);
      return;
    }
    const data = await r.json();
    alert("Proyecto creado. ID: " + data.id);
    setTitulo(""); setDescripcion(""); setTagsText("");
    setImgs([]); setVids([]); setDocs([]);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Administrador de Proyectos</h1>

      <div className="max-w-4xl space-y-4">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título"
          className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700"
        />
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción"
          rows={4}
          className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700"
        />
        <input
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="Tags (iot, plc, ...)"
          className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700"
        />

        {/* Zonas de drop */}
        <Uploader
          title="Imágenes"
          kind="img"
          items={imgs}
          onDrop={(files) => onDrop(files, "img")}
          onReorder={(from, to) => setImgs(prev => handleReorder(prev, from, to))}
        />
        <Uploader
          title="Videos"
          kind="vid"
          items={vids}
          onDrop={(files) => onDrop(files, "vid")}
          onReorder={(from, to) => setVids(prev => handleReorder(prev, from, to))}
        />
        <Uploader
          title="Documentos (PDF, Office, ZIP)"
          kind="doc"
          items={docs}
          onDrop={(files) => onDrop(files, "doc")}
          onReorder={(from, to) => setDocs(prev => handleReorder(prev, from, to))}
        />

        <button onClick={submit} className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded">
          Guardar Proyecto
        </button>
      </div>
    </main>
  );
}

function Uploader({
  title, kind, items,
  onDrop, onReorder
}: {
  title: string;
  kind: "img" | "vid" | "doc";
  items: { file: File; url: string }[];
  onDrop: (files: FileList) => void;
  onReorder: (from: number, to: number) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const onDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragover") setDragOver(true);
    if (e.type === "dragleave") setDragOver(false);
  };

  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <div
        onDrop={(e) => { e.preventDefault(); setDragOver(false); onDrop(e.dataTransfer.files); }}
        onDragOver={onDrag}
        onDragLeave={onDrag}
        className={`border-2 border-dashed rounded p-4 text-center ${dragOver ? "border-cyan-500" : "border-gray-600"}`}
      >
        Arrastra y suelta aquí o
        <label className="ml-2 underline cursor-pointer">
          selecciona archivos
          <input type="file" className="hidden" multiple
                 accept={kind === "img" ? "image/*"
                        : kind === "vid" ? "video/*"
                        : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"}
                 onChange={(e) => e.target.files && onDrop(e.target.files)} />
        </label>
      </div>

      {/* Previews + reorden */}
      <div className="mt-3 flex flex-wrap gap-3">
        {items.map((it, i) => (
          <div key={i}
               className="w-40 h-28 bg-gray-800 border border-gray-700 rounded relative overflow-hidden"
               draggable
               onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))}
               onDrop={(e) => {
                 const from = Number(e.dataTransfer.getData("text/plain"));
                 const to = i;
                 onReorder(from, to);
               }}
               onDragOver={(e) => e.preventDefault()}
          >
            {kind === "img" ? (
              <img src={it.url} className="w-full h-full object-cover" />
            ) : kind === "vid" ? (
              <video src={it.url} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm p-2">
                📄 {it.file.name}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
