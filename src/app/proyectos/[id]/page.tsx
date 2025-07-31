"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Project = {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_path?: string[] | null;
  video_path?: string[] | null;
  fecha_creacion: string;
};

const API = "http://127.0.0.1:8000";

function toFileUrl(relPath: string) {
  // Si DB guarda "projects/archivo.jpg", lo servimos como /static/projects/archivo.jpg
  const clean = relPath.replace(/^\/+/, "");
  return `${API}/static/${clean}`;
}

export default function ProyectoDetallePage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    const fetchProject = async () => {
      try {
        const res = await fetch(`${API}/projects/${params.id}`);
        const data = await res.json();
        setProject(data);
      } catch (e) {
        console.error("Error cargando proyecto:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [params?.id]);

  const imageUrls = useMemo(
    () => (project?.imagen_path || []).map(toFileUrl),
    [project]
  );
  const videoUrls = useMemo(
    () => (project?.video_path || []).map(toFileUrl),
    [project]
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-900 text-white p-8">
          <div className="max-w-5xl mx-auto">Cargando…</div>
        </main>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-900 text-white p-8">
          <div className="max-w-5xl mx-auto">Proyecto no encontrado</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <header>
            <h1 className="text-3xl font-extrabold text-cyan-400">{project.titulo}</h1>
            <p className="text-gray-300 mt-2">{project.descripcion}</p>
            <p className="text-xs text-gray-500 mt-1">
              Creado: {new Date(project.fecha_creacion).toLocaleString()}
            </p>
          </header>

          {/* Galería de imágenes */}
          {imageUrls.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-cyan-300 mb-3">Imágenes</h2>
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                spaceBetween={16}
                slidesPerView={1}
                className="rounded-xl overflow-hidden"
              >
                {imageUrls.map((src, i) => (
                  <SwiperSlide key={i}>
                    <img
                      src={src}
                      alt={`img-${i}`}
                      className="w-full h-[420px] object-contain bg-black"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </section>
          )}

          {/* Galería de videos */}
          {videoUrls.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-cyan-300 mb-3">Videos</h2>
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                spaceBetween={16}
                slidesPerView={1}
                className="rounded-xl overflow-hidden"
              >
                {videoUrls.map((src, i) => (
                  <SwiperSlide key={i}>
                    <video
                      src={src}
                      className="w-full h-[420px] bg-black"
                      controls
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </section>
          )}

          {imageUrls.length === 0 && videoUrls.length === 0 && (
            <p className="text-gray-400">Este proyecto no tiene galería aún.</p>
          )}
        </div>
      </main>
    </>
  );
}
