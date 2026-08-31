import type { ID } from "@/app/types";

export interface ProductSummary {
  id: ID;
  name: string;
  price: number;
  image?: string | null;
  stock: number;
  is_active?: boolean;
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
  slug?: string | null;
  is_active?: boolean;
}

export interface ProductUpdateInput
  extends Partial<ProductCreateInput> {
  id: ID;
}
