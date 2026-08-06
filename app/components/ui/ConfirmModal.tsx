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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-6">
      <div className="w-full max-w-md rounded-3xl border border-yellow-400 bg-zinc-900 p-8 shadow-2xl animate-in fade-in zoom-in duration-200">

        <h2 className="text-2xl font-bold text-white">
          {title}
        </h2>

        <p className="mt-4 leading-7 text-gray-400">
          {message}
        </p>

        <div className="mt-8 flex justify-end gap-4">

          <button
            onClick={onCancel}
            className="rounded-full border border-zinc-700 px-6 py-3 text-white transition hover:border-white"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="rounded-full bg-yellow-400 px-6 py-3 font-bold text-black transition hover:scale-105"
          >
            {confirmText}
          </button>

        </div>

      </div>
    </div>
  );
}