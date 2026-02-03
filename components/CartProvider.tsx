"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { buildItemKey, sanitizeText } from "@/lib/utils";
import { products } from "@/lib/products";

export type CartItem = {
  id: string;
  productSlug: string;
  name: string;
  price: number;
  quantity: number;
  options: {
    color: string;
    size: string;
    packaging: string;
    giftMessage?: string;
    light?: boolean;
  };
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "id">) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  subtotal: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "forever-lilies-cart";

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CartItem[];
        setItems(parsed);
      } catch {
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("cart-open");
    } else {
      document.body.classList.remove("cart-open");
    }
  }, [isOpen]);

  const addItem = (item: Omit<CartItem, "id">) => {
    const safeMessage = item.options.giftMessage
      ? sanitizeText(item.options.giftMessage)
      : undefined;
    const key = buildItemKey({
      productSlug: item.productSlug,
      color: item.options.color,
      size: item.options.size,
      packaging: item.options.packaging,
      giftMessage: safeMessage,
      light: item.options.light ? "light" : "none"
    });

    setItems((prev) => {
      const existing = prev.find((entry) => entry.id === key);
      if (existing) {
        return prev.map((entry) =>
          entry.id === key
            ? { ...entry, quantity: entry.quantity + item.quantity }
            : entry
        );
      }
      return [
        ...prev,
        {
          ...item,
          id: key,
          options: { ...item.options, giftMessage: safeMessage }
        }
      ];
    });
    setIsOpen(true);
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((entry) =>
          entry.id === id ? { ...entry, quantity: Math.max(1, quantity) } : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((entry) => entry.id !== id));
  };

  const clear = () => setItems([]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value = useMemo(
    () => ({
      items,
      isOpen,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      subtotal,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen((prev) => !prev)
    }),
    [items, isOpen, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const getCartProductName = (slug: string, lang: "en" | "lt") => {
  const product = products.find((item) => item.slug === slug);
  return product?.name[lang] ?? slug;
};
