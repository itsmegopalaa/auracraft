"use client";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--mn-overlay)] backdrop-blur-sm px-6">
      <div className="w-full max-w-md rounded-3xl border border-[var(--mn-border-strong)] bg-[var(--mn-surface)] p-8 shadow-[var(--mn-shadow-lg)] animate-in fade-in zoom-in duration-200">

        <h2 className="text-2xl font-bold text-[var(--mn-text)]">
          {title}
        </h2>

        <p className="mt-4 leading-7 text-[var(--mn-text-secondary)]">
          {message}
        </p>

        <div className="mt-8 flex justify-end gap-4">

          <button
            onClick={onCancel}
            className="rounded-full border border-[var(--mn-border)] px-6 py-3 text-[var(--mn-text)] transition hover:border-[var(--mn-border-strong)]"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="rounded-full bg-[var(--mn-accent)] px-6 py-3 font-bold text-[var(--mn-accent-contrast)] transition hover:scale-105"
          >
            {confirmText}
          </button>

        </div>

      </div>
    </div>
  );
}