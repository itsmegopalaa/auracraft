"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Review = {
  id: string;
  rating: number;
  review_text: string;
  verified_buyer: boolean;
  created_at: string;
};

type ProductReviewsProps = {
  productId: string;
  initialReviews: Review[];
};

export default function ProductReviews({
  productId,
  initialReviews,
}: ProductReviewsProps) {
  const router = useRouter();

  const reviews = initialReviews;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  async function submitReview(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/products/${productId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating,
            reviewText,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.error || "Unable to submit your review."
        );
        return;
      }

      setMessage("Review submitted successfully. ❤️");
      setReviewText("");
      setRating(5);

      router.refresh();
    } catch (error) {
      console.error("REVIEW SUBMIT ERROR:", error);
      setError("Unable to submit your review.");
    } finally {
      setSubmitting(false);
    }
  }

  const reviewCount = reviews.length;

  const averageRating =
    reviewCount > 0
      ? reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        ) / reviewCount
      : 0;

  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-4xl font-extrabold">
            Customer{" "}
            <span className="text-[var(--mn-accent)]">
              Reviews
            </span>{" "}
            ⭐
          </h2>

          <p className="mt-3 text-[var(--mn-text-secondary)]">
            {reviewCount > 0
              ? `${averageRating.toFixed(1)} / 5 from ${reviewCount} review${
                  reviewCount === 1 ? "" : "s"
                }`
              : "No reviews yet."}
          </p>
        </div>

        {reviewCount > 0 && (
          <div
            className="text-2xl text-[var(--mn-accent)]"
            aria-label={`${averageRating.toFixed(1)} out of 5 stars`}
          >
            {"★".repeat(Math.round(averageRating))}
            <span className="text-[var(--mn-text-muted)]">
              {"★".repeat(
                5 - Math.round(averageRating)
              )}
            </span>
          </div>
        )}
      </div>

      {reviewCount === 0 ? (
        <div className="rounded-3xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-8 text-[var(--mn-text-secondary)]">
          No customer reviews yet.
        </div>
      ) : (
        <div className="grid gap-[var(--mn-space-card)] md:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-3xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-[var(--mn-space-card)]"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-bold text-lg">
                  Customer
                </h3>

                <div
                  className="text-[var(--mn-accent)]"
                  aria-label={`${review.rating} out of 5 stars`}
                >
                  {"★".repeat(review.rating)}
                  <span className="text-[var(--mn-text-muted)]">
                    {"★".repeat(5 - review.rating)}
                  </span>
                </div>
              </div>

              <p className="mt-5 leading-7 text-[var(--mn-text-secondary)]">
                {review.review_text}
              </p>

              {review.verified_buyer && (
                <p className="mt-5 text-sm font-semibold text-[var(--mn-success)]">
                  ✓ Verified Buyer
                </p>
              )}
            </article>
          ))}
        </div>
      )}

      <div className="mt-10 rounded-3xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-8">
        <h3 className="text-2xl font-bold">
          Share Your Experience
        </h3>

        <p className="mt-2 text-[var(--mn-text-secondary)]">
          Only customers who purchased and received this
          product can submit a verified review.
        </p>

        <form
          onSubmit={submitReview}
          className="mt-6"
        >
          <label className="block text-sm font-semibold text-[var(--mn-text-secondary)]">
            Rating
          </label>

          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={`text-3xl transition ${
                  value <= rating
                    ? "text-[var(--mn-accent)]"
                    : "text-[var(--mn-text-muted)]"
                }`}
                aria-label={`${value} star rating`}
              >
                ★
              </button>
            ))}
          </div>

          <label className="mt-6 block text-sm font-semibold text-[var(--mn-text-secondary)]">
            Your Review
          </label>

          <textarea
            value={reviewText}
            onChange={(event) =>
              setReviewText(event.target.value)
            }
            minLength={5}
            maxLength={2000}
            rows={5}
            required
            placeholder="Tell us about your MineNote notebook..."
            className="mt-3 w-full rounded-[1.5rem] border border-[var(--mn-border-strong)] bg-[var(--mn-bg)] p-4 text-[var(--mn-text)] outline-none transition focus:border-[var(--mn-accent)]"
          />

          {error && (
            <p className="mt-4 text-sm text-[var(--mn-danger)]">
              {error}
            </p>
          )}

          {message && (
            <p className="mt-4 text-sm text-[var(--mn-success)]">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 rounded-full bg-[var(--mn-accent)] px-8 py-4 font-bold text-[var(--mn-accent-contrast)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Submitting..."
              : "Submit Review →"}
          </button>
        </form>
      </div>
    </section>
  );
}
