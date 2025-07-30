"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

interface Project {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_url?: string;
  video_url?: string;
}

export default function ProyectosPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/projects/")
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-br from-black via-gray-900 to-gray-800 min-h-screen text-white p-10">
        <h1 className="text-4xl font-bold text-center text-cyan-400 mb-10">Proyectos Recientes</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl p-4 hover:scale-105 transition"
            >
              {project.imagen_url && (
                <img
                  src={project.imagen_url}
                  alt={project.titulo}
                  className="rounded-lg w-full h-48 object-cover mb-4"
                />
              )}
              <h2 className="text-2xl font-semibold text-cyan-300 mb-2">{project.titulo}</h2>
              <p className="text-gray-300 text-sm mb-4">{project.descripcion}</p>
              {project.video_url && (
                <div className="aspect-video">
                  <iframe
                    src={project.video_url}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          ))}
          {projects.length === 0 && (
            <p className="col-span-full text-center text-gray-400">No hay proyectos aún.</p>
          )}
        </div>
      </main>
    </>
  );
}
