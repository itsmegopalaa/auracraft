import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to review this product." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const rating = Number(body.rating);
    const reviewText = String(body.reviewText ?? "").trim();

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    if (reviewText.length < 5 || reviewText.length > 2000) {
      return NextResponse.json(
        {
          error:
            "Review must be between 5 and 2000 characters.",
        },
        { status: 400 }
      );
    }

    /*
     * Only paid orders that have actually been delivered
     * can generate verified-buyer reviews.
     */
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(
        "order_id, customer_id, payment_status, order_status, items"
      )
      .eq("customer_id", user.id)
      .eq("payment_status", "paid")
      .eq("order_status", "delivered");

    if (ordersError) {
      console.error("REVIEW ORDER LOOKUP ERROR:", ordersError);

      return NextResponse.json(
        { error: "Unable to verify your purchase." },
        { status: 500 }
      );
    }

    const matchingOrder = (orders ?? []).find((order) => {
      if (!Array.isArray(order.items)) {
        return false;
      }

      return order.items.some((item: unknown) => {
        if (!item || typeof item !== "object") {
          return false;
        }

        const orderItem = item as Record<string, unknown>;

        return String(orderItem.id ?? "") === productId;
      });
    });

    if (!matchingOrder) {
      return NextResponse.json(
        {
          error:
            "You can review this product only after purchasing and receiving it.",
        },
        { status: 403 }
      );
    }

    const { data: existingReview, error: existingReviewError } =
      await supabase
        .from("product_reviews")
        .select("id")
        .eq("product_id", productId)
        .eq("order_id", matchingOrder.order_id)
        .maybeSingle();

    if (existingReviewError) {
      console.error(
        "REVIEW EXISTING CHECK ERROR:",
        existingReviewError
      );

      return NextResponse.json(
        { error: "Unable to check existing review." },
        { status: 500 }
      );
    }

    if (existingReview) {
      return NextResponse.json(
        {
          error:
            "You have already reviewed this product for this order.",
        },
        { status: 409 }
      );
    }

    const { data: review, error: insertError } = await supabase
      .from("product_reviews")
      .insert({
        product_id: productId,
        customer_id: user.id,
        order_id: matchingOrder.order_id,
        rating,
        review_text: reviewText,
        verified_buyer: true,
      })
      .select(
        "id, product_id, customer_id, order_id, rating, review_text, verified_buyer, created_at"
      )
      .single();

    if (insertError) {
      console.error("REVIEW INSERT ERROR:", insertError);

      if (insertError.code === "23505") {
        return NextResponse.json(
          {
            error:
              "You have already reviewed this product for this order.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Unable to submit your review." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REVIEW API ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
