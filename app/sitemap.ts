import type { MetadataRoute } from "next";
import { createClient } from "@/utils/supabase/server";

const base = "https://minenote.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("id, updated_at")
    .eq("active", true);

  if (error) {
    console.error("SITEMAP PRODUCTS LOAD FAILED:", error);
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: new Date(),
    },
    {
      url: `${base}/products`,
      lastModified: new Date(),
    },
    {
      url: `${base}/about`,
      lastModified: new Date(),
    },
    {
      url: `${base}/contact`,
      lastModified: new Date(),
    },
    {
      url: `${base}/shipping-policy`,
      lastModified: new Date(),
    },
    {
      url: `${base}/return-refund-policy`,
      lastModified: new Date(),
    },
    {
      url: `${base}/privacy-policy`,
      lastModified: new Date(),
    },
    {
      url: `${base}/terms-and-conditions`,
      lastModified: new Date(),
    },
  ];

  const productPages: MetadataRoute.Sitemap = (products ?? []).map(
    (product) => ({
      url: `${base}/products/${product.id}`,
      lastModified: product.updated_at
        ? new Date(product.updated_at)
        : new Date(),
    })
  );

  return [...staticPages, ...productPages];
}
