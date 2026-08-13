'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { ResponseDetailResponse } from '../../../../lib/types';
import * as api from '../../../../lib/api';

interface IndividualResponsePageProps {
  params: Promise<{ formId: string; responseId: string }>;
}

export default function IndividualResponsePage({ params }: IndividualResponsePageProps) {
  const resolvedParams = use(params);
  const formIdNum = parseInt(resolvedParams.formId, 10);
  const responseIdNum = parseInt(resolvedParams.responseId, 10);

  const [responseData, setResponseData] = useState<ResponseDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (isNaN(formIdNum) || isNaN(responseIdNum)) {
      setError('Invalid Form or Response ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchIndividualResponse(formIdNum, responseIdNum);
      setResponseData(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load response details');
      }
    } finally {
      setLoading(false);
    }
  }, [formIdNum, responseIdNum]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 flex flex-col font-sans text-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/responses/${formIdNum}`}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors flex items-center gap-1 shrink-0"
              title="Back to Responses List"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline text-xs font-semibold">Back to Responses</span>
            </Link>

            <div className="h-5 w-px bg-zinc-200 shrink-0" />

            <h1 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight truncate">
              Response #{responseIdNum}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-20 bg-zinc-200 rounded-2xl" />
            <div className="h-32 bg-zinc-200 rounded-2xl" />
            <div className="h-32 bg-zinc-200 rounded-2xl" />
          </div>
        )}

        {/* Error State */}
        {!loading && (error || !responseData) && (
          <div className="max-w-md mx-auto my-12 p-8 rounded-2xl bg-white border border-red-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 mb-1">Response Not Found</h2>
            <p className="text-sm text-zinc-600 mb-6">{error || 'The requested response details could not be found.'}</p>
            <Link
              href={`/responses/${formIdNum}`}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors inline-block"
            >
              Return to Responses Dashboard
            </Link>
          </div>
        )}

        {/* Response Details View */}
        {!loading && responseData && (
          <div className="space-y-6">
            {/* Submission Summary Metadata Card */}
            <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Submission Summary
                </span>
                <h2 className="text-xl font-extrabold text-zinc-900">
                  Response #{responseData.id}
                </h2>
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  Submitted on {formatDate(responseData.submitted_at)}
                </p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-semibold">
                {responseData.answers.length} {responseData.answers.length === 1 ? 'answer' : 'answers'}
              </span>
            </div>

            {/* Question Breakdown List */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
                Answers Breakdown ({responseData.answers.length})
              </h3>

              {responseData.answers.map((ans, idx) => (
                <div
                  key={ans.question_id}
                  className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Question {idx + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                      {ans.question_type.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-zinc-900 leading-snug">
                    {ans.question_title}
                  </h4>

                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 text-zinc-900 text-sm font-medium">
                    {ans.value ? (
                      <span className="whitespace-pre-wrap">{ans.value}</span>
                    ) : (
                      <span className="italic text-zinc-400 font-normal">(No answer provided)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
