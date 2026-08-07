"use client";

export default function ShareButton() {
  async function handleShare() {
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
  }

  return (
    <button
      onClick={handleShare}
      className="
        rounded-xl
        border
        border-zinc-700
        px-5
        py-3
        text-white
        hover:border-yellow-400
        transition
      "
    >
      Share Product 📤
    </button>
  );
}