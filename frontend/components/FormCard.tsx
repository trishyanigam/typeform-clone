'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Form } from '../lib/types';

interface FormCardProps {
  form: Form;
  onRename: (form: Form) => void;
  onDuplicate: (form: Form) => void;
  onPublish: (form: Form) => void;
  onUnpublish: (form: Form) => void;
  onDelete: (form: Form) => void;
  onShowToast: (message: string, type: 'info' | 'success' | 'error') => void;
}

export default function FormCard({
  form,
  onRename,
  onDuplicate,
  onPublish,
  onUnpublish,
  onDelete,
}: FormCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="group relative flex flex-col justify-between p-5 rounded-xl bg-white border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-zinc-400 hover:shadow-md transition-all duration-200">
      <div>
        {/* Top Header: Thumbnail tile, Status pill & Menu */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Typeform style thumbnail icon box */}
            <div className="w-10 h-10 rounded-lg bg-[#c86d38] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
              T
            </div>
            <div>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  form.status === 'published'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    form.status === 'published' ? 'bg-emerald-500' : 'bg-zinc-400'
                  }`}
                />
                {form.status}
              </span>
            </div>
          </div>

          {/* Action Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors focus:outline-none"
              aria-label="Form actions"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white border border-zinc-200 shadow-xl py-1 z-20 animate-fade-in text-xs font-semibold text-zinc-700">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onRename(form);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-zinc-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Rename
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDuplicate(form);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-zinc-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Duplicate
                </button>

                {form.status === 'draft' ? (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onPublish(form);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-zinc-50 flex items-center gap-2 text-emerald-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Publish
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onUnpublish(form);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-zinc-50 flex items-center gap-2 text-amber-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Unpublish
                  </button>
                )}

                <div className="my-1 border-t border-zinc-100" />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(form);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[#262627] tracking-tight line-clamp-2 mb-3 group-hover:text-black">
          {form.title}
        </h3>

        {/* Metadata info */}
        <div className="flex items-center justify-between text-xs text-zinc-500 font-medium mb-5">
          <span>{form.response_count} {form.response_count === 1 ? 'response' : 'responses'}</span>
          <span>Updated {formatDate(form.updated_at || form.created_at)}</span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex items-center gap-2 pt-3.5 border-t border-zinc-100">
        <Link
          href={`/builder/${form.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#262627] text-white text-xs font-semibold hover:bg-black transition-colors"
        >
          <span>Open Builder</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>

        <Link
          href={`/responses/${form.id}`}
          className="px-3 py-2 rounded-lg border border-zinc-200 text-zinc-700 text-xs font-semibold hover:bg-zinc-50 transition-colors inline-flex items-center justify-center"
        >
          Responses
        </Link>
      </div>
    </div>
  );
}

