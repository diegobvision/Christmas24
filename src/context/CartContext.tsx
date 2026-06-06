"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Cart, createCart, addToCart, updateCartLines, removeCartLines, getCart } from "@/lib/shopify";
import { addToCart as gtmAddToCart, viewCart as gtmViewCart, toGTMProduct } from "@/lib/gtm";

interface CartContextValue {
  cart: Cart | null;
  isLoading: boolean;
  addItem: (merchandiseId: string, quantity?: number, meta?: AddItemMeta) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  isOpen: boolean;
}

/** Optional product metadata passed alongside addItem for GTM */
export interface AddItemMeta {
  handle: string;
  title: string;
  price: string;
  currency: string;
  variantTitle?: string;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_ID_KEY = "shopify_cart_id";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const cartId = localStorage.getItem(CART_ID_KEY);
    if (cartId) {
      getCart(cartId).then((c) => {
        if (c) setCart(c);
        else localStorage.removeItem(CART_ID_KEY);
      });
    }
  }, []);

  const persistCart = (c: Cart) => {
    localStorage.setItem(CART_ID_KEY, c.id);
    setCart(c);
  };

  const addItem = useCallback(
    async (merchandiseId: string, quantity = 1, meta?: AddItemMeta) => {
      setIsLoading(true);
      try {
        const lines = [{ merchandiseId, quantity }];
        let updated: Cart;
        if (cart) {
          updated = await addToCart(cart.id, lines);
        } else {
          updated = await createCart(lines);
        }
        persistCart(updated);
        setIsOpen(true);

        // GTM: add_to_cart
        if (meta) {
          gtmAddToCart({
            item: toGTMProduct({
              id: merchandiseId,
              handle: meta.handle,
              title: meta.title,
              price: meta.price,
              currency: meta.currency,
              variantTitle: meta.variantTitle,
            }),
            quantity,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [cart]
  );

  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) return;
      setIsLoading(true);
      try {
        const updated = await updateCartLines(cart.id, [{ id: lineId, quantity }]);
        persistCart(updated);
      } finally {
        setIsLoading(false);
      }
    },
    [cart]
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cart) return;
      setIsLoading(true);
      try {
        const updated = await removeCartLines(cart.id, [lineId]);
        persistCart(updated);
      } finally {
        setIsLoading(false);
      }
    },
    [cart]
  );

  const openCart = useCallback(() => {
    setIsOpen(true);
    // GTM: view_cart
    if (cart && cart.lines.nodes.length > 0) {
      gtmViewCart({
        currency: cart.cost.totalAmount.currencyCode,
        value: parseFloat(cart.cost.totalAmount.amount),
        items: cart.lines.nodes.map((line) =>
          toGTMProduct({
            id: line.merchandise.id,
            handle: line.merchandise.product.handle,
            title: line.merchandise.product.title,
            price: line.merchandise.price.amount,
            currency: line.merchandise.price.currencyCode,
            variantTitle: line.merchandise.title,
            quantity: line.quantity,
          })
        ),
      });
    }
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addItem,
        updateItem,
        removeItem,
        openCart,
        closeCart: () => setIsOpen(false),
        isOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
