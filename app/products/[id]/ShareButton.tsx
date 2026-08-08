"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ShareButton() {
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (sharing) return;

    setSharing(true);

    try {
      const shareData = {
        title: "AuraCraft Premium Notebook",
        text: "Check out this premium notebook from AuraCraft ✨",
        url: window.location.href,
      };

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData);
        return;
      }

      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);

      toast.success("Product link copied!");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("Share failed:", error);

      try {
        await navigator.clipboard.writeText(window.location.href);
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
      aria-label="Share this product"
      className="
        mt-4
        w-full
        rounded-2xl
        border
        border-zinc-700
        bg-zinc-900
        px-6
        py-4
        font-semibold
        text-white
        transition
        duration-200
        hover:border-yellow-400
        hover:bg-zinc-800
        active:scale-[0.98]
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      {sharing ? "Sharing..." : "Share Product 📤"}
    </button>
  );
}