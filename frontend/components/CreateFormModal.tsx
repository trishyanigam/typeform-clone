'use client';

import React, { useState, useEffect } from 'react';

interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => Promise<void>;
  loading: boolean;
}

export default function CreateFormModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
}: CreateFormModalProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Form title is required');
      return;
    }


    try {
      setError('');
      await onSubmit(trimmedTitle);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create form');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 relative transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Create a new form</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 rounded-lg p-1 transition-colors"
            disabled={loading}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="form-title" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Form Title
            </label>
            <input
              id="form-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Customer Feedback Survey"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all placeholder:text-zinc-400"
              autoFocus
              disabled={loading}
            />
            {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create form</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
