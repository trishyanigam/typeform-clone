'use client';

import React from 'react';

interface HeaderProps {
  onCreateClick: () => void;
  formCount?: number;
}

export default function Header({ onCreateClick, formCount }: HeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold text-sm tracking-tighter">
              T
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Typeform Clone
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                My Forms
                {formCount !== undefined && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                    {formCount}
                  </span>
                )}
              </h1>
            </div>
          </div>

          <button
            onClick={onCreateClick}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 text-white font-medium text-sm hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Create form</span>
          </button>
        </div>
      </div>
    </header>
  );
}
