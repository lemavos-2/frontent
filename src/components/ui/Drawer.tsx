import React from "react";
import clsx from "clsx";

export function Drawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className={clsx("fixed inset-0 z-50 transition-all duration-150", open ? "translate-x-0" : "-translate-x-full") + " bg-black/40 md:hidden"}>
      <div className="bg-surface h-full w-[260px] shadow-card p-4">
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
