"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  description?: string | null;
  category?: string | null;
  quantity: number;
};

type CartProduct = Omit<CartItem, "quantity">;

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");

      if (savedCart) {
        const parsed = JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          const normalized = parsed.reduce<CartItem[]>(
            (result, rawItem) => {
              if (
                !rawItem ||
                typeof rawItem !== "object" ||
                !rawItem.id
              ) {
                return result;
              }

              const item = rawItem as CartItem;

              if (
                !Number.isFinite(Number(item.price)) ||
                !Number.isInteger(Number(item.quantity)) ||
                Number(item.quantity) < 1
              ) {
                return result;
              }

              const existing = result.find(
                (existingItem) =>
                  existingItem.id === String(item.id)
              );

              if (existing) {
                existing.quantity += Number(item.quantity);
              } else {
                result.push({
                  ...item,
                  id: String(item.id),
                  price: Number(item.price),
                  quantity: Number(item.quantity),
                });
              }

              return result;
            },
            []
          );

          queueMicrotask(() => {
            setCart(normalized);
          });
        }
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
      localStorage.removeItem("cart");
    } finally {
      queueMicrotask(() => {
        setLoaded(true);
      });
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );
  }, [cart, loaded]);

  function addToCart(product: CartProduct) {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === String(product.id)
      );

      if (existing) {
        return prev.map((item) =>
          item.id === String(product.id)
            ? {
                ...item,
                name: product.name,
                price: product.price,
                image: product.image,
                description: product.description,
                category: product.category,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          id: String(product.id),
          quantity: 1,
        },
      ];
    });
  }

  function removeFromCart(id: string) {
    setCart((prev) =>
      prev.filter((item) => item.id !== String(id))
    );
  }

  function increaseQuantity(id: string) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === String(id)
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(id: string) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === String(id) && item.quantity > 1
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
    );
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}
