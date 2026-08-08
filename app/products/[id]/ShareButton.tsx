"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type ShareButtonProps = {
  productName: string;
};

export default function ShareButton({
  productName,
}: ShareButtonProps) {
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (sharing) return;

    setSharing(true);

    try {
      const shareData = {
        title: `${productName} | AuraCraft`,
        text: `Check out ${productName} from AuraCraft ✨`,
        url: window.location.href,
      };

      if (
        navigator.share &&
        (!navigator.canShare || navigator.canShare(shareData))
      ) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);

      toast.success("Product link copied!");
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      console.error("Share failed:", error);

      try {
        await navigator.clipboard.writeText(
          window.location.href
        );

        toast.success("Product link copied!");
      } catch {
        toast.error("Unable to share this product.");
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={sharing}
      aria-label={`Share ${productName}`}
      className="
        mt-4
        flex
        w-full
        items-center
        justify-center
        gap-3
        rounded-2xl
        border
        border-zinc-700
        bg-zinc-900
        px-6
        py-4
        font-semibold
        text-white
        transition-all
        duration-200
        hover:border-yellow-400
        hover:bg-zinc-800
        active:scale-[0.98]
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>

      {sharing ? "Sharing..." : "Share Product"}
    </button>
  );
}