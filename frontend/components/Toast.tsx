'use client';

import React from 'react';
import { ToastMessage } from '../lib/types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center justify-between p-4 rounded-xl shadow-xl border text-sm font-medium transition-all duration-200 ${
            toast.type === 'success'
              ? 'bg-zinc-950 text-zinc-100 border-zinc-800 shadow-zinc-950/20'
              : toast.type === 'error'
              ? 'bg-red-950 text-red-100 border-red-900 shadow-red-950/20'
              : 'bg-zinc-900 text-zinc-200 border-zinc-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'error' ? 'bg-red-400' : 'bg-zinc-400'}`} />
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-4 text-zinc-400 hover:text-zinc-100 text-lg leading-none focus:outline-none"
            aria-label="Dismiss toast"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
