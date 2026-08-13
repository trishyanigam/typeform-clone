'use client';

import React, { useState, useEffect } from 'react';

interface ShareFormModalProps {
  slug: string;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type: 'info' | 'success' | 'error') => void;
}

export default function ShareFormModal({
  slug,
  isOpen,
  onClose,
  onShowToast,
}: ShareFormModalProps) {
  const [publicUrl, setPublicUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPublicUrl(`${window.location.origin}/f/${slug}`);
    }
  }, [slug]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(publicUrl);
      } else {
        const input = document.createElement('input');
        input.value = publicUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      onShowToast('Link copied!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onShowToast('Failed to copy link', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Share your form</h2>
            <p className="text-xs text-zinc-500">Anyone with this link can respond.</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 rounded-lg p-1.5 transition-colors text-xl leading-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <div className="py-5">
          <label htmlFor="share-public-url" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
            Public Form URL
          </label>
          <div className="flex items-center gap-2">
            <input
              id="share-public-url"
              type="text"
              readOnly
              value={publicUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 select-all"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors shrink-0 flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy link</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-zinc-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
