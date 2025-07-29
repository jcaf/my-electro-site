"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext"; // Asegúrate que exista

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}
