"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClient } from "@/utils/supabase/client";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  description?: string | null;
  category?: string | null;
  quantity: number;
  pages?: 100 | 150 | 200;

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
  pages: 100 | 150 | 200;
};

type CartContextType = {
  cart: CartItem[];

  addToCart: (product: CartProduct) => void;

  addCustomCoverToCart: (
    product: CustomCoverCartProduct,
    customCoverId: string,
    quantity: number
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
  pages?: 100 | 150 | 200;
}) {
  if (item.cartKey) {
    return String(item.cartKey);
  }

  if (item.customCoverId) {
    return `${String(item.id)}::custom::${String(
      item.customCoverId
    )}`;
  }

  return item.pages
    ? `${String(item.id)}::pages::${String(item.pages)}`
    : String(item.id);
}

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function refreshCartPrices(items: CartItem[]) {
    if (items.length === 0) return items;

    const productIds = [
      ...new Set(items.map((item) => String(item.id))),
    ];

    const supabase = createClient();

    const { data, error } = await supabase
      .from("product_page_prices")
      .select("product_id, pages, price")
      .in("product_id", productIds)
      .in("pages", [100, 150, 200]);

    if (error) {
      console.error(
        "CART CANONICAL PRICES LOAD FAILED:",
        error
      );
      return items;
    }

    const priceMap = new Map<string, Map<number, number>>();

    for (const row of data ?? []) {
      const productId = String(row.product_id);
      const pages = Number(row.pages);
      const price = Number(row.price);

      if (
        !Number.isFinite(price) ||
        price < 0 ||
        ![100, 150, 200].includes(pages)
      ) {
        continue;
      }

      if (!priceMap.has(productId)) {
        priceMap.set(productId, new Map());
      }

      priceMap.get(productId)!.set(pages, price);
    }

    return items.map((item) => {
      const productPrices = priceMap.get(String(item.id));

      if (!productPrices) {
        return item;
      }

      const pagePrice =
        item.pages
          ? productPrices.get(Number(item.pages))
          : productPrices.get(100);

      if (
        pagePrice === undefined ||
        !Number.isFinite(pagePrice)
      ) {
        return item;
      }

      return {
        ...item,
        price: pagePrice,
      };
    });
  }

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

          queueMicrotask(async () => {
            const refreshed =
              await refreshCartPrices(normalized);

            setCart(refreshed);
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
      const productKey = getCartItemKey({
        id: productId,
        pages: product.pages,
      });

      const existing = prev.find(
        (item) =>
          getCartItemKey(item) === productKey
      );

      if (existing) {
        return prev.map((item) =>
          getCartItemKey(item) === productKey
            ? {
                ...item,
                name: product.name,
                price: product.price,
                image: product.image,
                description: product.description,
                category: product.category,
                pages: product.pages,
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
          cartKey: productKey,
          customCoverId: null,
          quantity: 1,
        },
      ];
    });
  }

  function addCustomCoverToCart(
    product: CustomCoverCartProduct,
    customCoverId: string,
    quantity: number
  ) {
    const productId = String(product.id);
    const customizationId = String(customCoverId);
    const cartKey =
      `${productId}::custom::${customizationId}`;

    const normalizedQuantity = Math.max(
      1,
      Math.floor(
        Number.isFinite(Number(quantity))
          ? Number(quantity)
          : 1
      )
    );

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
                quantity: normalizedQuantity,
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
          quantity: normalizedQuantity,
          pages: product.pages,
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
