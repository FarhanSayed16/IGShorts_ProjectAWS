'use client';

import React from 'react';

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center px-4">
      <div className="max-w-sm w-full rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-4">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        <p className="text-xs text-slate-400">{body}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-lg text-xs bg-rose-700 text-white font-semibold"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
