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
      onShowToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onShowToast('Failed to copy link', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
          <h2 className="text-sm font-extrabold text-[#262627]">Share your form</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 rounded-lg p-1 transition-colors text-xl leading-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Share Section matching Typeform screenshot */}
        <div className="space-y-4 py-2">
          <h3 className="text-center text-lg sm:text-xl font-bold text-[#262627] tracking-tight">
            Choose how you&apos;d like to share your form
          </h3>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
            {/* Copy Link Row */}
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-zinc-200 shadow-2xs">
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-lg bg-[#262627] text-white text-xs font-bold hover:bg-black transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
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

              <input
                type="text"
                readOnly
                value={publicUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 px-2 text-xs font-mono text-zinc-600 bg-transparent focus:outline-none truncate select-all"
              />
            </div>

            {/* Integrations & Webhooks Coming Soon Card */}
            <div className="p-3.5 rounded-xl bg-white border border-zinc-200">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-[#262627]">
                  <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a2 2 0 002 2h1a2 2 0 110 4h-1a2 2 0 00-2 2v1a2 2 0 11-4 0v-1a2 2 0 00-2-2H7a2 2 0 110-4h1a2 2 0 002-2V4z" />
                  </svg>
                  <span className="text-xs font-bold">Integrations & Webhooks</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                  Coming Soon
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Sync responses with Google Sheets, Zapier, Webhooks, and Slack automatically.
              </p>
            </div>
          </div>

        </div>

        <div className="flex items-center justify-end pt-3 border-t border-zinc-100 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

