'use client';

import React, { useState } from 'react';
import { QuestionType } from '../lib/types';

interface QuestionTypeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: QuestionType) => void;
}

export interface QuestionTypeItem {
  type: QuestionType;
  label: string;
  category: 'Text' | 'Choice' | 'Contact' | 'Rating & Other';
  icon: React.ReactNode;
}

export const QUESTION_TYPES_INFO: QuestionTypeItem[] = [
  {
    type: 'short_text',
    label: 'Short text',
    category: 'Text',
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h7" />
      </svg>
    ),
  },
  {
    type: 'long_text',
    label: 'Long text',
    category: 'Text',
    icon: (
      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h12" />
      </svg>
    ),
  },
  {
    type: 'multiple_choice',
    label: 'Multiple choice',
    category: 'Choice',
    icon: (
      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    type: 'dropdown',
    label: 'Dropdown',
    category: 'Choice',
    icon: (
      <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    ),
  },
  {
    type: 'yes_no',
    label: 'Yes / No',
    category: 'Choice',
    icon: (
      <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    type: 'email',
    label: 'Email',
    category: 'Contact',
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    type: 'number',
    label: 'Number',
    category: 'Rating & Other',
    icon: (
      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    ),
  },
  {
    type: 'rating',
    label: 'Rating',
    category: 'Rating & Other',
    icon: (
      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
];

const COMING_SOON_TYPES = [
  {
    label: 'Payment',
    category: 'Rating & Other',
    icon: (
      <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'File Upload',
    category: 'Rating & Other',
    icon: (
      <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
];

export default function QuestionTypeSelectorModal({
  isOpen,
  onClose,
  onSelect,
}: QuestionTypeSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const categories = ['Text', 'Choice', 'Contact', 'Rating & Other'] as const;

  const filteredTypes = QUESTION_TYPES_INFO.filter(
    (qt) =>
      qt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qt.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredComingSoon = COMING_SOON_TYPES.filter(
    (cs) =>
      cs.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cs.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 relative overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-[#262627] tracking-tight">Add form elements</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 rounded-lg p-1 transition-colors text-2xl leading-none cursor-pointer"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Search */}
        <div className="py-4 shrink-0">
          <div className="relative">
            <svg
              className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search form elements..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
              autoFocus
            />
          </div>
        </div>

        {/* Categorized Elements Grid */}
        <div className="overflow-y-auto pr-1 space-y-6 flex-1">
          {categories.map((cat) => {
            const items = filteredTypes.filter((t) => t.category === cat);
            const csItems = filteredComingSoon.filter((t) => t.category === cat);
            if (items.length === 0 && csItems.length === 0) return null;
            return (
              <div key={cat}>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
                  {cat}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {items.map((qt) => (
                    <button
                      key={qt.type}
                      onClick={() => {
                        onSelect(qt.type);
                        onClose();
                      }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 bg-white text-left hover:border-zinc-900 hover:bg-zinc-50 transition-all group shadow-2xs cursor-pointer"
                    >
                      <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-100 group-hover:bg-white group-hover:border-zinc-200 transition-colors shrink-0">
                        {qt.icon}
                      </div>
                      <span className="text-xs font-bold text-[#262627] group-hover:text-black">
                        {qt.label}
                      </span>
                    </button>
                  ))}

                  {/* Coming Soon Disabled Question Types */}
                  {csItems.map((cs) => (
                    <div
                      key={cs.label}
                      className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/60 bg-zinc-50/70 text-left opacity-60 cursor-not-allowed select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-zinc-100 border border-zinc-200 shrink-0">
                          {cs.icon}
                        </div>
                        <span className="text-xs font-bold text-zinc-500">
                          {cs.label}
                        </span>
                      </div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 bg-zinc-200 px-1.5 py-0.5 rounded">
                        Soon
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


