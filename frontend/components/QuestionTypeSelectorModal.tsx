'use client';

import React from 'react';
import { QuestionType } from '../lib/types';

interface QuestionTypeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: QuestionType) => void;
}

export const QUESTION_TYPES_INFO: { type: QuestionType; label: string; description: string; icon: string }[] = [
  { type: 'short_text', label: 'Short text', description: 'Single line text answer', icon: '📝' },
  { type: 'long_text', label: 'Long text', description: 'Multi-line text response', icon: '📄' },
  { type: 'multiple_choice', label: 'Multiple choice', description: 'Select from options list', icon: '🔘' },
  { type: 'dropdown', label: 'Dropdown', description: 'Select single option from dropdown', icon: '🔽' },
  { type: 'email', label: 'Email', description: 'Email address field', icon: '✉️' },
  { type: 'number', label: 'Number', description: 'Numeric value input', icon: '🔢' },
  { type: 'yes_no', label: 'Yes / No', description: 'Binary choice question', icon: '👍' },
  { type: 'rating', label: 'Rating', description: 'Score rating scale', icon: '⭐' },
];

export default function QuestionTypeSelectorModal({
  isOpen,
  onClose,
  onSelect,
}: QuestionTypeSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Choose question type</h2>
            <p className="text-xs text-zinc-500">Select the format for your new question</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 rounded-lg p-1.5 transition-colors text-xl leading-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {QUESTION_TYPES_INFO.map((qt) => (
            <button
              key={qt.type}
              onClick={() => {
                onSelect(qt.type);
                onClose();
              }}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-200 text-left hover:border-zinc-900 hover:bg-zinc-50/80 transition-all duration-150 group"
            >
              <span className="text-2xl select-none">{qt.icon}</span>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-black">
                  {qt.label}
                </h3>
                <p className="text-xs text-zinc-500 leading-normal">{qt.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
