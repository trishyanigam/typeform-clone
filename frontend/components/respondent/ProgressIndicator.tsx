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
    <div className="w-full fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xs">
      {/* Top thin progress bar matching Typeform */}
      <div className="w-full h-1 bg-zinc-100 overflow-hidden">
        <div
          className="h-full bg-[#262627] transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between text-xs font-medium text-zinc-500">
        <div className="flex items-center gap-3">
          {currentIndex > 0 && onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-[#262627] font-semibold transition-colors focus:outline-none cursor-pointer"
              aria-label="Previous question"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
          )}
          <span className="font-bold text-[#262627] truncate max-w-[200px] sm:max-w-xs">{formTitle}</span>
        </div>

        <div className="text-xs font-semibold text-zinc-500">
          <span className="font-bold text-[#262627]">{currentIndex + 1}</span> of {totalQuestions}
        </div>
      </div>
    </div>
  );
}

