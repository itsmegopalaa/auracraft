"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type TouchEvent,
} from "react";

export type NotebookFlipSide =
  | "front"
  | "insideFront"
  | "insideBack"
  | "back";

export type NotebookFlipPage = {
  id: NotebookFlipSide;
  label: string;
  content: ReactNode;
  physicalSide?: NotebookFlipSide;
};

type Props = {
  pages: NotebookFlipPage[];
  initialIndex?: number;
  className?: string;
  pageClassName?: string;
  aspectRatio?: string;
  onPageChange?: (index: number, page: NotebookFlipPage) => void;
};

const DEFAULT_ASPECT_RATIO = "1 / 1.4142";
const FLIP_DURATION = 720;
const SWIPE_THRESHOLD = 55;
const TRACKPAD_THRESHOLD = 70;

type Turn = {
  from: number;
  to: number;
  direction: "forward" | "backward";
};

export default function NotebookPageFlip({
  pages,
  initialIndex = 0,
  className = "",
  pageClassName = "",
  aspectRatio = DEFAULT_ASPECT_RATIO,
  onPageChange,
}: Props) {
  const safePages = pages.slice(0, 4);

  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.min(
      Math.max(initialIndex, 0),
      Math.max(safePages.length - 1, 0),
    ),
  );

  const [turn, setTurn] = useState<Turn | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // MacBook trackpad horizontal swipe accumulator.
  const trackpadDelta = useRef(0);
  const trackpadLock = useRef(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (targetIndex: number) => {
      if (
        safePages.length <= 1 ||
        turn ||
        targetIndex < 0 ||
        targetIndex >= safePages.length ||
        targetIndex === currentIndex
      ) {
        return;
      }

      const direction =
        targetIndex > currentIndex ? "forward" : "backward";

      setTurn({
        from: currentIndex,
        to: targetIndex,
        direction,
      });

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setCurrentIndex(targetIndex);
        setTurn(null);
        onPageChange?.(
          targetIndex,
          safePages[targetIndex],
        );
      }, FLIP_DURATION);
    },
    [
      currentIndex,
      onPageChange,
      safePages,
      turn,
    ],
  );

  const next = useCallback(() => {
    if (currentIndex < safePages.length - 1) {
      goTo(currentIndex + 1);
    }
  }, [currentIndex, goTo, safePages.length]);

  const previous = useCallback(() => {
    if (currentIndex > 0) {
      goTo(currentIndex - 1);
    }
  }, [currentIndex, goTo]);

  /*
   * Mobile / touchscreen swipe.
   *
   * We intentionally wait until the swipe is completed.
   * The page does NOT follow the finger while dragging.
   */
  const handleTouchStart = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      const touch = event.changedTouches[0];

      if (!touch) {
        return;
      }

      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
    },
    [],
  );

  const handleTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      const startX = touchStartX.current;
      const startY = touchStartY.current;

      touchStartX.current = null;
      touchStartY.current = null;

      if (
        startX === null ||
        startY === null ||
        turn
      ) {
        return;
      }

      const touch = event.changedTouches[0];

      if (!touch) {
        return;
      }

      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      // Ignore vertical scrolling.
      if (
        Math.abs(deltaX) < SWIPE_THRESHOLD ||
        Math.abs(deltaX) <= Math.abs(deltaY)
      ) {
        return;
      }

      if (deltaX < 0) {
        next();
      } else {
        previous();
      }
    },
    [next, previous, turn],
  );

  /*
   * MacBook trackpad.
   *
   * Two-finger horizontal swipe arrives in the browser
   * as horizontal wheel deltas.
   *
   * We accumulate the gesture and only flip after the
   * horizontal swipe crosses the threshold.
   */
  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      const deltaX = event.deltaX;
      const deltaY = event.deltaY;

      // Ignore normal vertical scrolling.
      if (
        Math.abs(deltaX) < 1 ||
        Math.abs(deltaX) <= Math.abs(deltaY)
      ) {
        return;
      }

      event.preventDefault();

      if (turn || trackpadLock.current) {
        return;
      }

      trackpadDelta.current += deltaX;

      if (
        Math.abs(trackpadDelta.current) <
        TRACKPAD_THRESHOLD
      ) {
        return;
      }

      const direction = trackpadDelta.current > 0
        ? "forward"
        : "backward";

      trackpadDelta.current = 0;
      trackpadLock.current = true;

      if (direction === "forward") {
        next();
      } else {
        previous();
      }

      window.setTimeout(() => {
        trackpadLock.current = false;
        trackpadDelta.current = 0;
      }, FLIP_DURATION + 100);
    },
    [next, previous, turn],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "ArrowRight" ||
        event.key === "ArrowDown"
      ) {
        event.preventDefault();
        next();
      }

      if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowUp"
      ) {
        event.preventDefault();
        previous();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [next, previous]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (safePages.length === 0) {
    return null;
  }

  const currentPage = safePages[currentIndex];

  const destinationIndex =
    turn?.to ?? currentIndex;

  const destinationPage =
    safePages[destinationIndex];

  const baseStyle: CSSProperties = {
    aspectRatio,
    perspective: "1800px",
    touchAction: "pan-y",
    WebkitUserSelect: "none",
    WebkitTouchCallout: "none",
  };

  return (
    <div
      className={`w-full ${className}`}
    >
      <div
        className="relative mx-auto w-full overflow-hidden select-none"
        style={baseStyle}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Destination page */}
        <div
          className={`absolute inset-0 h-full w-full overflow-hidden ${pageClassName}`}
        >
          {destinationPage.content}
        </div>

        {/* Current page + 3D flip */}
        <div
          className={`absolute inset-0 z-20 h-full w-full overflow-hidden ${pageClassName}`}
          style={{
            transformStyle: "preserve-3d",
            transformOrigin:
              turn?.direction === "backward"
                ? "right center"
                : "left center",
            transform: turn
              ? turn.direction === "forward"
                ? "rotateY(-180deg)"
                : "rotateY(180deg)"
              : "rotateY(0deg)",
            transition: turn
              ? `transform ${FLIP_DURATION}ms cubic-bezier(0.2, 0.72, 0.2, 1)`
              : "none",
            willChange: "transform",
            boxShadow: turn
              ? turn.direction === "forward"
                ? "18px 0 34px rgba(0,0,0,0.18)"
                : "-18px 0 34px rgba(0,0,0,0.18)"
              : "0 0 0 rgba(0,0,0,0)",
            pointerEvents: "none",
          }}
        >
          {currentPage.content}

          {/* Page edge / depth */}
          {turn && (
            <div
              className="pointer-events-none absolute inset-y-0 w-8"
              style={{
                [turn.direction === "forward"
                  ? "right"
                  : "left"]: 0,
                background:
                  "linear-gradient(90deg, transparent, rgba(0,0,0,0.16), transparent)",
                opacity: 0.65,
              }}
            />
          )}
        </div>

        {/* Previous */}
        <button
          type="button"
          onClick={previous}
          disabled={
            currentIndex === 0 ||
            Boolean(turn)
          }
          aria-label="Previous page"
          className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/90 text-lg shadow-md backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-0"
        >
          ←
        </button>

        {/* Next */}
        <button
          type="button"
          onClick={next}
          disabled={
            currentIndex ===
              safePages.length - 1 ||
            Boolean(turn)
          }
          aria-label="Next page"
          className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/90 text-lg shadow-md backdrop-blur transition hover:bg-white disabled:pointer-events-none disabled:opacity-0"
        >
          →
        </button>
      </div>

      {/* Page indicator */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--mn-text-muted)]">
          {currentPage.label}
        </span>

        <span className="text-[10px] text-[var(--mn-text-muted)]">
          •
        </span>

        <span className="text-[10px] font-semibold text-[var(--mn-text-muted)]">
          {currentIndex + 1} / {safePages.length}
        </span>
      </div>

      <div className="mx-auto mt-2 flex items-center justify-center gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--mn-text-muted)]">
        <span>←</span>
        <span>Swipe to flip</span>
        <span>→</span>
      </div>
    </div>
  );
}
