'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import {
  Form,
  Question,
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [totalResponses, setTotalResponses] = useState<number>(0);
  const [stats, setStats] = useState<QuestionStat[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [exportingCsv, setExportingCsv] = useState<boolean>(false);
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
      const [formData, responsesData, statsData, questionsData] = await Promise.all([
        api.fetchForm(formIdNum),
        api.fetchFormResponses(formIdNum),
        api.fetchResponseStats(formIdNum),
        api.fetchQuestions(formIdNum).catch(() => []),
      ]);

      setForm(formData);
      setResponses(responsesData.responses);
      setTotalResponses(responsesData.total);
      setStats(statsData.stats);
      setQuestions(questionsData);
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

  const handleExportCsv = () => {
    if (!responses || responses.length === 0) {
      showToast('No responses available to export', 'info');
      return;
    }

    setExportingCsv(true);

    try {
      // 1. Determine question columns in position order
      const questionList = questions.length > 0
        ? questions.map((q) => ({ id: q.id, title: q.title }))
        : stats.map((s) => ({ id: s.question_id, title: s.question_title }));

      // 2. CSV Header row
      const headers = ['Response ID', 'Submitted At', ...questionList.map((q) => q.title)];
      const csvRows: string[] = [];

      // Helper to format a single cell with proper CSV escaping (RFC 4180)
      const escapeCsvCell = (cellValue: any): string => {
        if (cellValue === null || cellValue === undefined) {
          return '""';
        }
        const str = String(cellValue).replace(/"/g, '""');
        return `"${str}"`;
      };

      // Add header row
      csvRows.push(headers.map(escapeCsvCell).join(','));

      // 3. Add data rows for each response
      for (const resp of responses) {
        const rowCells: string[] = [
          String(resp.id),
          resp.submitted_at ? new Date(resp.submitted_at).toISOString() : '',
        ];

        // Map answers for each question
        const answerMap = new Map<number, string>();
        if (resp.answers && Array.isArray(resp.answers)) {
          for (const ans of resp.answers) {
            answerMap.set(ans.question_id, ans.value !== undefined && ans.value !== null ? String(ans.value) : '');
          }
        }

        for (const q of questionList) {
          const val = answerMap.get(q.id) ?? '';
          rowCells.push(val);
        }

        csvRows.push(rowCells.map(escapeCsvCell).join(','));
      }

      // 4. Create Blob and trigger download
      const csvString = csvRows.join('\r\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeTitle = (form?.title || 'form').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.href = url;
      link.setAttribute('download', `${safeTitle}_responses.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Responses exported to CSV successfully!', 'success');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      showToast('Failed to export responses to CSV', 'error');
    } finally {
      setExportingCsv(false);
    }
  };

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
    <div className="min-h-screen bg-[#f9f9f8] flex flex-col font-sans text-[#262627]">
      {/* Header matching Typeform Results Header */}
      {form && (
        <header className="border-b border-[#e5e5e5] bg-white sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 h-14">
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

              <div className="flex items-center gap-2 min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-[#262627] tracking-tight truncate">
                  {form.title}
                </h1>
              </div>
            </div>

            {/* Center: Top Nav Tabs */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href={`/builder/${form.id}`}
                className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Content
              </Link>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Share
              </button>
              <span className="px-4 py-2 text-xs font-bold text-[#262627] border-b-2 border-[#262627]">
                Results
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Export CSV Button */}
              <button
                onClick={handleExportCsv}
                disabled={totalResponses === 0 || exportingCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-[#262627] text-xs font-semibold hover:bg-zinc-50 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                title={totalResponses === 0 ? "No responses to export" : "Export responses to CSV"}
              >
                <svg className="w-3.5 h-3.5 text-zinc-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{exportingCsv ? 'Exporting...' : 'Export CSV'}</span>
              </button>

              {form.status === 'published' && (
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#044543] text-white text-xs font-semibold hover:bg-[#033433] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
              )}

              <Link
                href={`/builder/${form.id}`}
                className="px-3.5 py-1.5 rounded-lg bg-[#262627] text-white text-xs font-semibold hover:bg-black transition-colors inline-flex items-center gap-1.5"
              >
                <span>Edit Builder</span>
              </Link>
            </div>
          </div>
        </header>
      )}


      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Sub-navigation tabs matching Typeform Insights screenshot */}
        <div className="flex items-center gap-2 border-b border-[#e5e5e5] pb-px mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'submissions'
                ? 'border-[#262627] text-[#262627]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Submissions ({totalResponses})
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-[#262627] text-[#262627]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Insights & Question Stats
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs animate-pulse h-24" />
              ))}
            </div>
            <div className="h-80 rounded-xl bg-white border border-zinc-200 shadow-2xs animate-pulse" />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl bg-white border border-red-200 shadow-xs text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#262627] mb-1">Failed to load responses</h2>
            <p className="text-xs text-zinc-500 mb-6">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-lg bg-[#262627] text-white text-xs font-semibold hover:bg-black transition-colors inline-flex items-center gap-2"
            >
              <span>Try again</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && totalResponses === 0 && (
          <div className="max-w-md mx-auto my-16 p-10 rounded-2xl bg-white border border-zinc-200 shadow-xs text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-400 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#262627] tracking-tight mb-1">No responses yet</h2>
            <p className="text-xs text-zinc-500 mb-6">
              Share your published form link with respondents to begin collecting submissions.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href={`/builder/${formIdNum}`}
                className="px-3.5 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Go to Builder
              </Link>

              {form?.status === 'published' && (
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-3.5 py-2 rounded-lg bg-[#262627] text-white text-xs font-semibold hover:bg-black inline-flex items-center gap-1.5"
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
            {/* "Big Picture" Section matching Typeform Insights screenshot */}
            <div className="bg-white p-6 rounded-2xl border border-[#e5e5e5] shadow-2xs space-y-4">
              <h2 className="text-lg font-extrabold text-[#262627]">Big picture</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
                <div>
                  <span className="text-xs font-bold text-zinc-400 block mb-1">Submissions</span>
                  <span className="text-3xl font-black text-[#262627]">{totalResponses}</span>
                </div>

                <div>
                  <span className="text-xs font-bold text-zinc-400 block mb-1">Total Questions</span>
                  <span className="text-3xl font-black text-[#262627]">{stats.length}</span>
                </div>

                <div>
                  <span className="text-xs font-bold text-zinc-400 block mb-1">Completion Rate</span>
                  <span className="text-3xl font-black text-emerald-600">100%</span>
                </div>

                <div>
                  <span className="text-xs font-bold text-zinc-400 block mb-1">Latest Response</span>
                  <span className="text-sm font-bold text-[#262627] block mt-2 truncate">
                    {responses.length > 0 ? formatDate(responses[0].submitted_at) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* TAB 1: Submissions Table */}
            {activeTab === 'submissions' && (
              <div className="bg-white rounded-2xl border border-[#e5e5e5] shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        <th className="py-3 px-5">Response ID</th>
                        <th className="py-3 px-5">Submitted Date</th>
                        <th className="py-3 px-5">Answer Preview</th>
                        <th className="py-3 px-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-xs font-medium">
                      {responses.map((resp) => {
                        const previewAnswers = resp.answers.slice(0, 3);
                        return (
                          <tr
                            key={resp.id}
                            className="hover:bg-zinc-50 transition-colors cursor-pointer group"
                            onClick={() => {
                              window.location.href = `/responses/${formIdNum}/${resp.id}`;
                            }}
                          >
                            <td className="py-3.5 px-5 font-bold text-[#262627]">
                              #{resp.id}
                            </td>
                            <td className="py-3.5 px-5 text-zinc-600">
                              {formatDate(resp.submitted_at)}
                            </td>
                            <td className="py-3.5 px-5 text-zinc-600 max-w-md truncate">
                              {previewAnswers.length > 0 ? (
                                <span className="inline-flex gap-1.5 flex-wrap">
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
                            <td className="py-3.5 px-5 text-right">
                              <Link
                                href={`/responses/${formIdNum}/${resp.id}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#262627] group-hover:underline"
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
              <div className="space-y-4">
                {stats.map((st, idx) => (
                  <div
                    key={st.question_id}
                    className="p-5 rounded-2xl bg-white border border-[#e5e5e5] shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
                          Question {idx + 1} &bull; {st.type.replace('_', ' ')}
                        </span>
                        <h3 className="text-sm font-bold text-[#262627]">
                          {st.question_title}
                        </h3>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
                        {st.total_answers} {st.total_answers === 1 ? 'answer' : 'answers'}
                      </span>
                    </div>

                    {/* Stats Visual Breakdown */}
                    {st.type === 'rating' ? (
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-200/80">
                          <span className="text-xs font-bold uppercase text-zinc-500">Average Rating:</span>
                          <span className="text-xl font-black text-[#262627]">
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
                                    <span className="font-bold text-[#262627]">{count} ({pct}%)</span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                                    <div
                                      className="h-full bg-[#262627] rounded-full transition-all duration-300"
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
                      <div className="space-y-2.5 pt-1">
                        {Object.entries(st.counts).map(([opt, count]) => {
                          const pct = st.total_answers > 0 ? Math.round((count / st.total_answers) * 100) : 0;
                          return (
                            <div key={opt} className="space-y-1">
                              <div className="flex justify-between text-xs font-medium text-zinc-700">
                                <span>{opt}</span>
                                <span className="font-bold text-[#262627]">{count} ({pct}%)</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                                <div
                                  className="h-full bg-[#262627] rounded-full transition-all duration-300"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-3 text-center">
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

