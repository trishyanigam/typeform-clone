'use client';

import React from 'react';
import { Form } from '../lib/types';

interface ConfirmDeleteModalProps {
  form: Form | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
  loading: boolean;
}

export default function ConfirmDeleteModal({
  form,
  isOpen,
  onClose,
  onConfirm,
  loading,
}: ConfirmDeleteModalProps) {
  if (!isOpen || !form) return null;

  const handleConfirm = async () => {
    await onConfirm(form.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-red-600 pb-3 border-b border-zinc-100">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Delete form</h2>
            <p className="text-xs text-zinc-500">This action cannot be undone</p>
          </div>
        </div>

        <div className="py-4 text-sm text-zinc-600">
          Are you sure you want to delete <span className="font-semibold text-zinc-900">&ldquo;{form.title}&rdquo;</span>? All associated questions and responses will be permanently removed.
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Form</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
