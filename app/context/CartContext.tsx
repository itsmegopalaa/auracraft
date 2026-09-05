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

  /*
   * Custom-cover metadata.
   *
   * id remains the REAL product UUID because the order/inventory
   * system uses it for stock deduction.
   *
   * cartKey is the client-side identity.
   */
  cartKey?: string;
  customCoverId?: string | null;
};

type CartProduct = Omit<CartItem, "quantity">;

type CustomCoverCartProduct = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  description?: string | null;
  category?: string | null;
};

type CartContextType = {
  cart: CartItem[];

  addToCart: (product: CartProduct) => void;

  addCustomCoverToCart: (
    product: CustomCoverCartProduct,
    customCoverId: string
  ) => void;

  removeFromCart: (idOrCartKey: string) => void;
  increaseQuantity: (idOrCartKey: string) => void;
  decreaseQuantity: (idOrCartKey: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

function getCartItemKey(item: {
  id: string;
  cartKey?: string;
  customCoverId?: string | null;
}) {
  if (item.cartKey) {
    return String(item.cartKey);
  }

  if (item.customCoverId) {
    return `${String(item.id)}::custom::${String(
      item.customCoverId
    )}`;
  }

  return String(item.id);
}

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

              const normalizedItem: CartItem = {
                ...item,
                id: String(item.id),
                price: Number(item.price),
                quantity: Number(item.quantity),
                cartKey: getCartItemKey(item),
                customCoverId:
                  item.customCoverId
                    ? String(item.customCoverId)
                    : null,
              };

              const normalizedKey =
                getCartItemKey(normalizedItem);

              const existing = result.find(
                (existingItem) =>
                  getCartItemKey(existingItem) ===
                  normalizedKey
              );

              if (existing) {
                existing.quantity +=
                  normalizedItem.quantity;
              } else {
                result.push(normalizedItem);
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
      const productId = String(product.id);

      const existing = prev.find(
        (item) =>
          getCartItemKey(item) === productId
      );

      if (existing) {
        return prev.map((item) =>
          getCartItemKey(item) === productId
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
          id: productId,
          cartKey: productId,
          customCoverId: null,
          quantity: 1,
        },
      ];
    });
  }

  function addCustomCoverToCart(
    product: CustomCoverCartProduct,
    customCoverId: string
  ) {
    const productId = String(product.id);
    const customizationId = String(
      customCoverId
    );
    const cartKey =
      `${productId}::custom::${customizationId}`;

    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          getCartItemKey(item) === cartKey
      );

      if (existing) {
        return prev.map((item) =>
          getCartItemKey(item) === cartKey
            ? {
                ...item,
                name: product.name,
                price: product.price,
                image: product.image,
                description: product.description,
                category: product.category,
                customCoverId: customizationId,
                cartKey,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          id: productId,
          name: product.name,
          price: product.price,
          image: product.image ?? null,
          description: product.description ?? null,
          category: product.category ?? null,
          quantity: 1,
          cartKey,
          customCoverId: customizationId,
        },
      ];
    });
  }

  function removeFromCart(
    idOrCartKey: string
  ) {
    const key = String(idOrCartKey);

    setCart((prev) =>
      prev.filter((item) => {
        const itemKey = getCartItemKey(item);

        /*
         * Keep legacy behavior:
         * passing a product ID removes normal product items.
         *
         * For custom items, callers should pass cartKey.
         */
        if (itemKey === key) {
          return false;
        }

        if (
          !item.customCoverId &&
          String(item.id) === key
        ) {
          return false;
        }

        return true;
      })
    );
  }

  function increaseQuantity(
    idOrCartKey: string
  ) {
    const key = String(idOrCartKey);

    setCart((prev) =>
      prev.map((item) => {
        const itemKey = getCartItemKey(item);

        const matches =
          itemKey === key ||
          (!item.customCoverId &&
            String(item.id) === key);

        return matches
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item;
      })
    );
  }

  function decreaseQuantity(
    idOrCartKey: string
  ) {
    const key = String(idOrCartKey);

    setCart((prev) =>
      prev.map((item) => {
        const itemKey = getCartItemKey(item);

        const matches =
          itemKey === key ||
          (!item.customCoverId &&
            String(item.id) === key);

        return matches && item.quantity > 1
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item;
      })
    );
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        addCustomCoverToCart,
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
