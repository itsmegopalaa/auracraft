import type { ID } from "@/app/types";

export interface Product {
  id: ID;
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

  theme?: string | null;
  badge?: string | null;

  created_at?: string;
  updated_at?: string;
}

export interface ProductSummary {
  id: ID;
  name: string;
  price: number;
  image?: string | null;
  stock: number;
  active: boolean;
}

export interface ProductSearchInput {
  query: string;
  limit?: number;
}

export interface ProductCreateInput {
  name: string;
  price: number;
  stock: number;
  image?: string | null;
  description?: string | null;
  category?: string | null;
  active?: boolean;
  theme?: string | null;
  badge?: string | null;
  featured?: boolean;
}

export interface ProductUpdateInput
  extends Partial<ProductCreateInput> {
  id: ID;
}
