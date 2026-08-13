'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import {
  Form,
  ResponseItem,
  QuestionStat,
  ToastMessage,
} from '../../../lib/types';
import * as api from '../../../lib/api';
import ShareFormModal from '../../../components/ShareFormModal';
import Toast from '../../../components/Toast';

interface ResponsesPageProps {
  params: Promise<{ formId: string }>;
}

export default function ResponsesDashboardPage({ params }: ResponsesPageProps) {
  const resolvedParams = use(params);
  const formIdNum = parseInt(resolvedParams.formId, 10);

  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [totalResponses, setTotalResponses] = useState<number>(0);
  const [stats, setStats] = useState<QuestionStat[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'submissions' | 'stats'>('submissions');
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadData = useCallback(async () => {
    if (isNaN(formIdNum)) {
      setError('Invalid Form ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [formData, responsesData, statsData] = await Promise.all([
        api.fetchForm(formIdNum),
        api.fetchFormResponses(formIdNum),
        api.fetchResponseStats(formIdNum),
      ]);

      setForm(formData);
      setResponses(responsesData.responses);
      setTotalResponses(responsesData.total);
      setStats(statsData.stats);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load response data');
      }
    } finally {
      setLoading(false);
    }
  }, [formIdNum]);

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
      {form && (
        <header className="border-b border-zinc-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/dashboard"
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors flex items-center gap-1 shrink-0"
                title="Back to My Forms"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline text-xs font-semibold">Forms</span>
              </Link>

              <div className="h-5 w-px bg-zinc-200 shrink-0" />

              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight truncate">
                  {form.title}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-[11px] font-semibold uppercase tracking-wider shrink-0">
                  {totalResponses} {totalResponses === 1 ? 'response' : 'responses'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {form.status === 'published' && (
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
              )}

              <Link
                href={`/builder/${form.id}`}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors inline-flex items-center gap-1.5"
              >
                <span>Open Builder</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm animate-pulse h-28" />
              ))}
            </div>
            <div className="h-96 rounded-2xl bg-white border border-zinc-200 shadow-sm animate-pulse" />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl bg-white border border-red-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 mb-1">Failed to load responses</h2>
            <p className="text-sm text-zinc-600 mb-6">{error}</p>
            <button
              onClick={loadData}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Try again</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && totalResponses === 0 && (
          <div className="max-w-md mx-auto my-16 p-10 rounded-2xl bg-white border border-zinc-200 shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-400 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-1">No responses yet</h2>
            <p className="text-sm text-zinc-500 mb-6">
              Share your form to start collecting responses.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href={`/builder/${formIdNum}`}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                Go to Builder
              </Link>

              {form?.status === 'published' && (
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors inline-flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share Form</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loaded Content */}
        {!loading && !error && totalResponses > 0 && (
          <div className="space-y-8">
            {/* 1. Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Total Responses
                </span>
                <span className="text-3xl font-extrabold text-zinc-900">{totalResponses}</span>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Total Questions
                </span>
                <span className="text-3xl font-extrabold text-zinc-900">{stats.length}</span>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Latest Submission
                </span>
                <span className="text-base font-bold text-zinc-900 block truncate">
                  {responses.length > 0 ? formatDate(responses[0].submitted_at) : 'N/A'}
                </span>
              </div>
            </div>

            {/* 2. Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-zinc-200 pb-px">
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
                  activeTab === 'submissions'
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Submissions ({responses.length})
              </button>

              <button
                onClick={() => setActiveTab('stats')}
                className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
                  activeTab === 'stats'
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Question Insights & Stats
              </button>
            </div>

            {/* TAB 1: Submissions Table */}
            {activeTab === 'submissions' && (
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                        <th className="py-3.5 px-6">Response ID</th>
                        <th className="py-3.5 px-6">Submitted Date</th>
                        <th className="py-3.5 px-6">Answer Preview</th>
                        <th className="py-3.5 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-xs">
                      {responses.map((resp) => {
                        const previewAnswers = resp.answers.slice(0, 3);
                        return (
                          <tr
                            key={resp.id}
                            className="hover:bg-zinc-50/80 transition-colors cursor-pointer group"
                            onClick={() => {
                              window.location.href = `/responses/${formIdNum}/${resp.id}`;
                            }}
                          >
                            <td className="py-4 px-6 font-bold text-zinc-900">
                              #{resp.id}
                            </td>
                            <td className="py-4 px-6 text-zinc-600 font-medium">
                              {formatDate(resp.submitted_at)}
                            </td>
                            <td className="py-4 px-6 text-zinc-600 max-w-md truncate">
                              {previewAnswers.length > 0 ? (
                                <span className="inline-flex gap-2 flex-wrap">
                                  {previewAnswers.map((ans, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono text-[11px]"
                                    >
                                      {ans.value}
                                    </span>
                                  ))}
                                  {resp.answers.length > 3 && (
                                    <span className="text-zinc-400 font-medium text-[11px]">
                                      +{resp.answers.length - 3} more
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="italic text-zinc-400">No answers</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <Link
                                href={`/responses/${formIdNum}/${resp.id}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 group-hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span>View</span>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: Question Statistics */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                {stats.map((st, idx) => (
                  <div
                    key={st.question_id}
                    className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                          Question {idx + 1} &bull; {st.type.replace('_', ' ')}
                        </span>
                        <h3 className="text-base font-bold text-zinc-900">
                          {st.question_title}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
                        {st.total_answers} {st.total_answers === 1 ? 'answer' : 'answers'}
                      </span>
                    </div>

                    {/* Stats Visualization */}
                    {st.type === 'rating' ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200/80">
                          <span className="text-xs font-bold uppercase text-zinc-500">Average Rating:</span>
                          <span className="text-2xl font-extrabold text-zinc-900">
                            {st.average !== undefined && st.average !== null ? st.average : 0} / 5
                          </span>
                        </div>

                        {st.counts && (
                          <div className="space-y-2">
                            {Object.entries(st.counts).map(([score, count]) => {
                              const pct = st.total_answers > 0 ? Math.round((count / st.total_answers) * 100) : 0;
                              return (
                                <div key={score} className="space-y-1">
                                  <div className="flex justify-between text-xs font-medium text-zinc-700">
                                    <span>Rating {score}</span>
                                    <span className="font-semibold text-zinc-900">{count} ({pct}%)</span>
                                  </div>
                                  <div className="w-full h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                                    <div
                                      className="h-full bg-zinc-900 rounded-full transition-all duration-300"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : st.counts && Object.keys(st.counts).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(st.counts).map(([opt, count]) => {
                          const pct = st.total_answers > 0 ? Math.round((count / st.total_answers) * 100) : 0;
                          return (
                            <div key={opt} className="space-y-1">
                              <div className="flex justify-between text-xs font-medium text-zinc-700">
                                <span>{opt}</span>
                                <span className="font-semibold text-zinc-900">{count} ({pct}%)</span>
                              </div>
                              <div className="w-full h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                                <div
                                  className="h-full bg-zinc-900 rounded-full transition-all duration-300"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-xs text-zinc-500">
                          {st.total_answers > 0 ? `${st.total_answers} text responses collected.` : 'No answers collected yet for this question.'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Share Form Modal */}
      {form && (
        <ShareFormModal
          slug={form.slug}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onShowToast={showToast}
        />
      )}

      {/* Toast Notification */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
