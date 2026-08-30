"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type WishlistProduct = {
  id: string;
  name: string;
  price: number | string;
  image: string;
};

type WishlistContextType = {
  wishlist: WishlistProduct[];
  toggleWishlist: (product: WishlistProduct) => void;
  isWishlisted: (id: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

const LEGACY_PRODUCT_IDS: Record<string, string> = {
  "1": "b8c37a8d-9bcf-455c-95d0-731f1a1fc122",
  "2": "4a076972-33ad-4370-a15f-2d9595a7b25d",
  "3": "141af13d-e155-42c3-971d-21d90b679312",
};

function migrateWishlist(items: unknown): WishlistProduct[] {
  if (!Array.isArray(items)) {
    return [];
  }

  const migrated: WishlistProduct[] = [];

  for (const item of items) {
    if (
      !item ||
      typeof item !== "object" ||
      !("id" in item) ||
      !("name" in item) ||
      !("price" in item) ||
      !("image" in item)
    ) {
      continue;
    }

    const product = item as WishlistProduct;
    const oldId = String(product.id);
    const newId = LEGACY_PRODUCT_IDS[oldId] ?? oldId;

    migrated.push({
      id: newId,
      name: String(product.name),
      price: product.price,
      image: String(product.image),
    });
  }

  const unique = new Map<string, WishlistProduct>();

  for (const product of migrated) {
    if (!unique.has(product.id)) {
      unique.set(product.id, product);
    }
  }

  return Array.from(unique.values());
}

export function WishlistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("wishlist");

      if (saved) {
        const parsed = JSON.parse(saved);
        const migrated = migrateWishlist(parsed);

        queueMicrotask(() => {
          setWishlist(migrated);
        });

        localStorage.setItem(
          "wishlist",
          JSON.stringify(migrated)
        );
      }
    } catch (error) {
      console.error(
        "WISHLIST LOAD/MIGRATION FAILED:",
        error
      );

      localStorage.removeItem("wishlist");
    }

    queueMicrotask(() => {
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    localStorage.setItem(
      "wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist, loaded]);

  function toggleWishlist(product: WishlistProduct) {
    setWishlist((prev) => {
      const productId = String(product.id);

      const exists = prev.some(
        (item) => item.id === productId
      );

      if (exists) {
        return prev.filter(
          (item) => item.id !== productId
        );
      }

      return [
        ...prev,
        {
          ...product,
          id: productId,
        },
      ];
    });
  }

  function isWishlisted(id: string) {
    const normalizedId =
      LEGACY_PRODUCT_IDS[String(id)] ?? String(id);

    return wishlist.some(
      (item) => item.id === normalizedId
    );
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider"
    );
  }

  return context;
}
