'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Form } from '../lib/types';

interface BuilderHeaderProps {
  form: Form;
  onUpdateTitle: (newTitle: string) => Promise<void>;
  onPublishToggle: () => Promise<void>;
  onShowToast: (message: string, type: 'info' | 'success' | 'error') => void;
  publishing: boolean;
}

export default function BuilderHeader({
  form,
  onUpdateTitle,
  onPublishToggle,
  onShowToast,
  publishing,
}: BuilderHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(form.title);

  useEffect(() => {
    setTitleInput(form.title);
  }, [form.title]);

  const handleTitleSubmit = async () => {
    const trimmed = titleInput.trim();
    if (!trimmed) {
      setTitleInput(form.title);
      setIsEditingTitle(false);
      return;
    }
    if (trimmed !== form.title) {
      await onUpdateTitle(trimmed);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTitleInput(form.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Back Link & Form Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors flex items-center gap-1 shrink-0"
            title="Back to My Forms"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline text-xs font-semibold">Forms</span>
          </Link>

          <div className="h-5 w-px bg-zinc-200 shrink-0" />

          {/* Editable Title */}
          <div className="flex items-center gap-2 min-w-0">
            {isEditingTitle ? (
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleKeyDown}
                className="px-2 py-1 text-base sm:text-lg font-bold text-zinc-900 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="group flex items-center gap-2 min-w-0 text-left hover:bg-zinc-50 px-2 py-1 rounded-lg transition-colors"
                title="Click to rename form"
              >
                <h1 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight truncate">
                  {form.title}
                </h1>
                <svg className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 210.3H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}

            {/* Status badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider shrink-0 ${
                form.status === 'published'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${form.status === 'published' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
              {form.status}
            </span>
          </div>
        </div>

        {/* Right: Preview & Publish Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onShowToast('Preview mode coming soon!', 'info')}
            className="px-3.5 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-semibold hover:bg-zinc-50 transition-colors"
          >
            Preview
          </button>

          <button
            onClick={onPublishToggle}
            disabled={publishing}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              form.status === 'published'
                ? 'bg-zinc-100 text-zinc-800 border border-zinc-200 hover:bg-zinc-200'
                : 'bg-zinc-900 text-white hover:bg-zinc-800'
            } disabled:opacity-50`}
          >
            {publishing ? (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : form.status === 'published' ? (
              <span>Unpublish</span>
            ) : (
              <span>Publish</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
