'use client';

import React from 'react';

interface ProgressIndicatorProps {
  currentIndex: number;
  totalQuestions: number;
  onBack?: () => void;
  formTitle: string;
}

export default function ProgressIndicator({
  currentIndex,
  totalQuestions,
  onBack,
  formTitle,
}: ProgressIndicatorProps) {
  const percentage = Math.min(100, Math.max(0, ((currentIndex + 1) / totalQuestions) * 100));

  return (
    <div className="w-full fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-100">
      {/* Top thin progress bar */}
      <div className="w-full h-1 bg-zinc-100 overflow-hidden">
        <div
          className="h-full bg-zinc-900 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between text-xs font-medium text-zinc-500">
        <div className="flex items-center gap-3">
          {currentIndex > 0 && onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold transition-colors focus:outline-none"
              aria-label="Previous question"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
          )}
          <span className="font-bold text-zinc-900 truncate max-w-[200px] sm:max-w-xs">{formTitle}</span>
        </div>

        <div>
          Question <span className="font-bold text-zinc-900">{currentIndex + 1}</span> of {totalQuestions}
        </div>
      </div>
    </div>
  );
}
