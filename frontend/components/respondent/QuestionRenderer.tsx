'use client';

import React, { useEffect, useRef } from 'react';
import { PublicQuestion } from '../../lib/types';

interface QuestionRendererProps {
  question: PublicQuestion;
  value: any;
  onChange: (val: any) => void;
  onNext: () => void;
  isLast: boolean;
  validationError: string | null;
  submitting: boolean;
}

const ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export default function QuestionRenderer({
  question,
  value,
  onChange,
  onNext,
  isLast,
  validationError,
  submitting,
}: QuestionRendererProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [question.id]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (question.type === 'long_text') {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onNext();
      }
    } else if (
      question.type === 'short_text' ||
      question.type === 'email' ||
      question.type === 'number'
    ) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onNext();
      }
    }
  };

  const options = question.settings?.options || [];
  const ratingMax = question.settings?.max || 5;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col justify-center min-h-[50vh] py-6 px-4">
      {/* Question Number Badge & Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-white bg-[#262627] px-2 py-0.5 rounded">
            {question.position} &rarr;
          </span>
          {question.required && (
            <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider">
              * Required
            </span>
          )}
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#262627] tracking-tight leading-tight">
          {question.title}
        </h2>

        {question.description && (
          <p className="mt-2.5 text-base sm:text-lg text-zinc-500 font-medium leading-relaxed">
            {question.description}
          </p>
        )}
      </div>

      {/* Input Controls */}
      <div className="my-6">
        {/* 1. Short Text */}
        {question.type === 'short_text' && (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer here..."
            className="w-full text-xl sm:text-3xl font-semibold py-3 px-1 border-b-2 border-[#262627] bg-transparent text-[#262627] placeholder:text-zinc-300 focus:outline-none transition-colors"
          />
        )}

        {/* 2. Long Text */}
        {question.type === 'long_text' && (
          <div>
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response here..."
              rows={4}
              className="w-full text-base sm:text-lg font-medium p-4 border border-zinc-200 rounded-xl bg-zinc-50/50 text-[#262627] placeholder:text-zinc-400 focus:outline-none focus:border-[#262627] focus:bg-white transition-all resize-none shadow-2xs"
            />
            <p className="mt-2 text-xs font-medium text-zinc-400">
              Press <kbd className="px-1 py-0.5 bg-zinc-100 border border-zinc-300 rounded text-zinc-700 font-mono text-[10px]">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-zinc-100 border border-zinc-300 rounded text-zinc-700 font-mono text-[10px]">Enter ↵</kbd> to submit answer
            </p>
          </div>
        )}

        {/* 3. Email */}
        {question.type === 'email' && (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="name@example.com"
            className="w-full text-xl sm:text-3xl font-semibold py-3 px-1 border-b-2 border-[#262627] bg-transparent text-[#262627] placeholder:text-zinc-300 focus:outline-none transition-colors"
          />
        )}

        {/* 4. Number */}
        {question.type === 'number' && (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="number"
            value={value !== undefined && value !== null ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="0"
            className="w-full text-xl sm:text-3xl font-semibold py-3 px-1 border-b-2 border-[#262627] bg-transparent text-[#262627] placeholder:text-zinc-300 focus:outline-none transition-colors"
          />
        )}

        {/* 5. Multiple Choice */}
        {question.type === 'multiple_choice' && (
          <div className="space-y-2.5">
            {options.map((opt: string, idx: number) => {
              const letter = ALPHABET[idx] || `${idx + 1}`;
              const isSelected = value === opt;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChange(opt)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all duration-150 group cursor-pointer ${
                    isSelected
                      ? 'border-[#262627] bg-[#262627] text-white shadow-sm'
                      : 'border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50/80 text-[#262627]'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center border shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-white/20 text-white border-white/30'
                        : 'bg-zinc-100 text-zinc-700 border-zinc-200 group-hover:bg-zinc-200'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm sm:text-base font-bold">{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 6. Dropdown */}
        {question.type === 'dropdown' && (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-base sm:text-lg font-semibold p-3.5 rounded-xl border border-zinc-200 bg-white text-[#262627] focus:outline-none focus:border-[#262627] shadow-2xs cursor-pointer"
          >
            <option value="">Select an option...</option>
            {options.map((opt: string, idx: number) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}

        {/* 7. Yes / No */}
        {question.type === 'yes_no' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Yes', val: 'yes', keyHint: 'Y' },
              { label: 'No', val: 'no', keyHint: 'N' },
            ].map((item) => {
              const isSelected = value === item.val;
              return (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => onChange(item.val)}
                  className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all duration-150 group cursor-pointer ${
                    isSelected
                      ? 'border-[#262627] bg-[#262627] text-white shadow-sm'
                      : 'border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50/80 text-[#262627]'
                  }`}
                >
                  <span className="text-base font-extrabold">{item.label}</span>
                  <span
                    className={`w-7 h-7 rounded-md font-bold text-xs flex items-center justify-center border ${
                      isSelected
                        ? 'bg-white/20 text-white border-white/30'
                        : 'bg-zinc-100 text-zinc-700 border-zinc-200 group-hover:bg-zinc-200'
                    }`}
                  >
                    {item.keyHint}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 8. Rating */}
        {question.type === 'rating' && (
          <div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {Array.from({ length: ratingMax }, (_, i) => i + 1).map((starVal) => {
                const isSelected = Number(value) === starVal;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => onChange(starVal)}
                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl border font-extrabold text-base sm:text-lg flex items-center justify-center transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'border-[#262627] bg-[#262627] text-white shadow-sm scale-105'
                        : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50'
                    }`}
                  >
                    {starVal}
                  </button>
                );
              })}
            </div>
            <p className="mt-2.5 text-xs font-medium text-zinc-400">
              Select rating scale from 1 to {ratingMax}
            </p>
          </div>
        )}
      </div>

      {/* Inline Validation Error */}
      {validationError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{validationError}</span>
        </div>
      )}

      {/* Bottom Action Button: OK / Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onNext}
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#262627] text-white font-bold text-sm hover:bg-black active:scale-[0.98] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Submitting...</span>
            </>
          ) : isLast ? (
            <>
              <span>Submit</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </>
          ) : (
            <>
              <span>OK</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </>
          )}
        </button>

        {!isLast && (
          <span className="text-xs font-medium text-zinc-400 hidden sm:inline">
            press <kbd className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-300 rounded text-zinc-700 font-mono text-[10px]">Enter ↵</kbd>
          </span>
        )}
      </div>
    </div>
  );
}

