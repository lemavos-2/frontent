import React from "react";
import clsx from "clsx";

export function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-surface rounded-[10px] p-6 shadow-card min-w-[320px] max-w-[90vw]">
        {children}
        <button
          className="absolute top-4 right-4 text-textSecondary hover:text-accent"
          aria-label="Fechar"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  );
}
