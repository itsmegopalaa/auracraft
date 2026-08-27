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

export function WishlistProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [loaded, setLoaded] = useState(false);


  // Load wishlist
  useEffect(() => {
    const saved = localStorage.getItem("wishlist");

    if (saved) {
      const parsed = JSON.parse(saved);

      queueMicrotask(() => {
        setWishlist(parsed);
      });
    }

    queueMicrotask(() => {
      setLoaded(true);
    });
  }, []);


  // Save wishlist
  useEffect(() => {

    if (loaded) {
      localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlist)
      );
    }

  }, [wishlist, loaded]);


  function toggleWishlist(product: WishlistProduct) {

    setWishlist((prev) => {

      const exists = prev.some(
        (item) => item.id === product.id
      );

      if (exists) {
        return prev.filter(
          (item) => item.id !== product.id
        );
      }

      return [...prev, product];

    });

  }


  function isWishlisted(id: string){
    return wishlist.some(
      (item)=>item.id === id
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


export function useWishlist(){

  const context = useContext(WishlistContext);

  if(!context){
    throw new Error(
      "useWishlist must be used inside WishlistProvider"
    );
  }

  return context;

}