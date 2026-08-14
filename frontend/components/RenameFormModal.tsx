'use client';

import React, { useState, useEffect } from 'react';
import { Form } from '../lib/types';

interface RenameFormModalProps {
  form: Form | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, newTitle: string) => Promise<void>;
  loading: boolean;
}

export default function RenameFormModal({
  form,
  isOpen,
  onClose,
  onSubmit,
  loading,
}: RenameFormModalProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setError('');
    }
  }, [form]);

  if (!isOpen || !form) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Form title cannot be empty');
      return;
    }

    try {
      setError('');
      await onSubmit(form.id, trimmedTitle);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to rename form');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <h2 className="text-base font-extrabold text-[#262627] tracking-tight">Rename form</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 rounded-lg p-1 transition-colors text-xl leading-none"
            disabled={loading}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="rename-form-title" className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              New Title
            </label>
            <input
              id="rename-form-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
              autoFocus
              disabled={loading}
            />
            {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#262627] text-white text-xs font-semibold hover:bg-black transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Title</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

