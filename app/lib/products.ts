export type Product = {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  category?: string | null;
  image?: string | null;
  stock: number;
  active: boolean;
  rating?: number | null;
  review_count?: number;
  bestseller: boolean;
  featured: boolean;
  new_arrival: boolean;
  pages?: number | null;
  paper?: string | null;
  size?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CartProduct = {
  id: string;
  name: string;
  price: number;
  image?: string | null;
};
