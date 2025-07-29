"use client";
import { createContext, useContext, useState } from "react";

type Producto = {
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
};

type CartContextType = {
  cartItems: Producto[];
  addToCart: (producto: Producto) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<Producto[]>([]);

  const addToCart = (producto: Producto) => {
    setCartItems((prev) => [...prev, producto]);
  };

  const removeFromCart = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
};
