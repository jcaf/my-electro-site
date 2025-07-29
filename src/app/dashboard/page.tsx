"use client";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Cargando...</p>;
  if (!session) redirect("/login");

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-10">
        <h1 className="text-3xl font-bold text-blue-700">Bienvenido, {session.user?.name}</h1>
        <p className="mt-4">Tu sesión está activa. Aquí verás tu panel.</p>
      </div>
    </>
  );
}
