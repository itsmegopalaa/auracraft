import { createClient } from "@/utils/supabase/server";

export type ProductRatingSummary = {
  product_id: string;
  catalog_rating: number | null;
  review_count: number;
  average_review_rating: number | null;
  effective_rating: number | null;
};

export async function getProductRating(
  productId: string
): Promise<ProductRatingSummary | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_product_rating_summary",
    {
      p_product_id: productId,
    }
  );

  if (error) {
    console.error("PRODUCT RATING LOAD FAILED:", error);
    return null;
  }

  const summary = Array.isArray(data) ? data[0] : data;

  if (!summary) {
    return null;
  }

  return {
    product_id: String(summary.product_id),
    catalog_rating:
      summary.catalog_rating === null
        ? null
        : Number(summary.catalog_rating),
    review_count: Number(summary.review_count ?? 0),
    average_review_rating:
      summary.average_review_rating === null
        ? null
        : Number(summary.average_review_rating),
    effective_rating:
      summary.effective_rating === null
        ? null
        : Number(summary.effective_rating),
  };
}


export async function getProductRatings(
  productIds: string[]
): Promise<Record<string, ProductRatingSummary>> {
  const uniqueIds = [...new Set(productIds)].filter(Boolean);

  if (uniqueIds.length === 0) {
    return {};
  }

  const supabase = await createClient();

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, rating")
    .in("id", uniqueIds);

  if (productsError) {
    console.error("PRODUCT RATINGS PRODUCTS LOAD FAILED:", productsError);
    return {};
  }

  const { data: reviews, error: reviewsError } = await supabase
    .from("product_reviews")
    .select("product_id, rating")
    .in("product_id", uniqueIds);

  if (reviewsError) {
    console.error("PRODUCT RATINGS REVIEWS LOAD FAILED:", reviewsError);
    return {};
  }

  const reviewStats = new Map<
    string,
    { count: number; total: number }
  >();

  for (const review of reviews ?? []) {
    const productId = String(review.product_id);
    const current = reviewStats.get(productId) ?? {
      count: 0,
      total: 0,
    };

    current.count += 1;
    current.total += Number(review.rating);
    reviewStats.set(productId, current);
  }

  const result: Record<string, ProductRatingSummary> = {};

  for (const product of products ?? []) {
    const productId = String(product.id);
    const catalogRating =
      product.rating === null ? null : Number(product.rating);

    const stats = reviewStats.get(productId);
    const reviewCount = stats?.count ?? 0;

    const averageReviewRating =
      stats && stats.count > 0
        ? Number((stats.total / stats.count).toFixed(2))
        : null;

    const effectiveRating =
      averageReviewRating ?? catalogRating;

    result[productId] = {
      product_id: productId,
      catalog_rating: catalogRating,
      review_count: reviewCount,
      average_review_rating: averageReviewRating,
      effective_rating: effectiveRating,
    };
  }

  return result;
}
