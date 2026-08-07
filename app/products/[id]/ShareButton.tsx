"use client";

import { useState } from "react";

export default function ShareButton() {
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (sharing) return;

    setSharing(true);

    try {
      if (navigator.share) {
        await navigator.share({
          title: "AuraCraft Premium Notebook",
          text: "Check out this premium notebook from AuraCraft",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(
          window.location.href
        );

        alert("Product link copied!");
      }
    } catch (error: any) {
      // User cancel share - ignore
      if (error.name !== "AbortError") {
        console.error(error);
      }
    } finally {
      setSharing(false);
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={sharing}
      className="
        rounded-xl
        border
        border-zinc-700
        px-5
        py-3
        text-white
        hover:border-yellow-400
        transition
        disabled:opacity-50
      "
    >
      {sharing ? "Sharing..." : "Share Product 📤"}
    </button>
  );
}