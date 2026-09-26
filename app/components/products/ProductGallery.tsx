"use client";

import Image from "next/image";
import NotebookPageFlip, {
  type NotebookFlipPage,
} from "@/app/components/notebook/NotebookPageFlip";

type Props = {
  image: string;
  name: string;
  pages: NotebookFlipPage[];
};

export default function ProductGallery({
  image,
  name,
  pages,
}: Props) {
  const frontPage: NotebookFlipPage = {
    id: "front",
    label: "Front",
    content: (
        <div className="relative flex h-full w-full items-center justify-center bg-white">
          <Image
            src={image}
            alt={`${name} front cover`}
            fill
            priority
            sizes="(max-width: 768px) 92vw, 680px"
            className="object-contain"
            draggable={false}
          />
        </div>
      ),
  };

  const previewPages: NotebookFlipPage[] = [
    frontPage,
    ...pages.filter((page) => page.id !== "front"),
  ].slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 shadow-[var(--mn-shadow-lg)] sm:p-5">
        <div className="mb-4 flex items-center justify-between px-1 sm:px-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--mn-accent)]">
              📖 Notebook Preview
            </p>
            <p className="mt-1 text-xs text-[var(--mn-text-muted)]">
              Flip through all four sides before ordering.
            </p>
          </div>

          <span className="hidden rounded-full border border-[var(--mn-border)] bg-[var(--mn-bg)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--mn-text-muted)] sm:inline-flex">
            4 sides
          </span>
        </div>

        <NotebookPageFlip
          pages={previewPages}
          initialIndex={0}
          pageClassName="rounded-xl border border-[var(--mn-border)] shadow-[var(--mn-shadow-sm)]"
        />
      </div>
    </div>
  );
}
