'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Form } from '../lib/types';
import ShareFormModal from './ShareFormModal';

interface BuilderHeaderProps {
  form: Form;
  onUpdateTitle: (newTitle: string) => Promise<void>;
  onPublishToggle: () => Promise<void>;
  onShowToast: (message: string, type: 'info' | 'success' | 'error') => void;
  publishing: boolean;
  activeTab: 'questions' | 'settings';
  onTabChange: (tab: 'questions' | 'settings') => void;
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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    setTitleInput(form.title);
  }, [form.title]);

  const handleShare = () => {
    if (form.status === 'published') {
      setIsShareModalOpen(true);
    } else {
      onShowToast('Publish form to share it with respondents', 'info');
    }
  };

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
    <>
      <header className="border-b border-[#e5e5e5] bg-white sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 h-14">
          {/* Left: Back Link & Form Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors flex items-center gap-1 shrink-0"
              title="Back to My Forms"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline text-xs font-medium">Forms</span>
            </Link>

            <div className="h-4 w-px bg-zinc-200 shrink-0" />

            {/* Editable Title */}
            <div className="flex items-center gap-2 min-w-0">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={handleKeyDown}
                  className="px-2 py-0.5 text-sm sm:text-base font-bold text-[#262627] bg-zinc-50 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="group flex items-center gap-1.5 min-w-0 text-left hover:bg-zinc-50 px-2 py-0.5 rounded-md transition-colors"
                  title="Click to rename form"
                >
                  <h1 className="text-sm sm:text-base font-bold text-[#262627] tracking-tight truncate">
                    {form.title}
                  </h1>
                  <svg className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 210.3H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}

              {/* Status badge */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
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

          {/* Center: Top Nav Tabs */}
          <div className="hidden md:flex items-center gap-1">
            <span className="px-4 py-2 text-xs font-bold text-[#262627] border-b-2 border-[#262627]">
              Content
            </span>
            <button
              onClick={handleShare}
              className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Share
            </button>
            <Link
              href={`/responses/${form.id}`}
              className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Results
            </Link>

            {/* Coming Soon Logic / Branching Tab */}
            <div className="px-3 py-2 text-xs font-semibold text-zinc-400 flex items-center gap-1.5 opacity-60 cursor-not-allowed select-none">
              <span>Logic</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-100 px-1 py-0.2 rounded border border-zinc-200">
                Soon
              </span>
            </div>
          </div>


          {/* Right: Share, Preview & Publish Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {form.status === 'published' && (
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#044543] text-white text-xs font-semibold hover:bg-[#033433] transition-colors shadow-xs cursor-pointer"
              >

                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>
            )}

            <Link
              href={`/f/${form.slug}`}
              target="_blank"
              className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 text-xs font-semibold hover:bg-zinc-50 transition-colors inline-flex items-center gap-1"
            >
              <span>Preview</span>
              <svg className="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>

            <button
              onClick={onPublishToggle}
              disabled={publishing}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                form.status === 'published'
                  ? 'bg-zinc-100 text-zinc-800 border border-zinc-300 hover:bg-zinc-200'
                  : 'bg-[#262627] text-white hover:bg-black'
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

      {/* Share Form Modal */}
      <ShareFormModal
        slug={form.slug}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShowToast={onShowToast}
      />
    </>
  );
}

