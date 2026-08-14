'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import BuilderHeader from '../../../components/BuilderHeader';
import QuestionTypeSelectorModal from '../../../components/QuestionTypeSelectorModal';
import QuestionEditor from '../../../components/QuestionEditor';
import ConfirmDeleteModal from '../../../components/ConfirmDeleteModal';
import { SortableQuestionItem } from '../../../components/SortableQuestionItem';
import Toast from '../../../components/Toast';
import { Form, Question, QuestionType, QuestionUpdatePayload, ToastMessage } from '../../../lib/types';
import * as api from '../../../lib/api';

interface BuilderPageProps {
  params: Promise<{ formId: string }>;
}

export default function BuilderPage({ params }: BuilderPageProps) {
  const resolvedParams = use(params);
  const formIdNum = parseInt(resolvedParams.formId, 10);

  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [savingQuestion, setSavingQuestion] = useState<boolean>(false);
  const [publishingForm, setPublishingForm] = useState<boolean>(false);

  // Unsaved changes state
  const [isEditorDirty, setIsEditorDirty] = useState<boolean>(false);
  const [pendingSelectId, setPendingSelectId] = useState<number | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // DND Sensors setup
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      const [formData, questionsData] = await Promise.all([
        api.fetchForm(formIdNum),
        api.fetchQuestions(formIdNum),
      ]);

      setForm(formData);
      setQuestions(questionsData);

      if (questionsData.length > 0) {
        setSelectedQuestionId((prev) => (prev && questionsData.some((q) => q.id === prev) ? prev : questionsData[0].id));
      } else {
        setSelectedQuestionId(null);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load form details');
      }
    } finally {
      setLoading(false);
    }
  }, [formIdNum]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectQuestion = (qId: number) => {
    if (qId === selectedQuestionId) return;
    if (isEditorDirty) {
      setPendingSelectId(qId);
    } else {
      setSelectedQuestionId(qId);
    }
  };

  const confirmSwitchQuestion = () => {
    if (pendingSelectId !== null) {
      setSelectedQuestionId(pendingSelectId);
      setPendingSelectId(null);
      setIsEditorDirty(false);
    }
  };

  const handleAddQuestion = async (type: QuestionType) => {
    let defaultTitle = 'Question';
    let defaultSettings: any = null;

    switch (type) {
      case 'short_text':
        defaultTitle = 'What is your name?';
        break;
      case 'long_text':
        defaultTitle = 'Tell us more about yourself';
        break;
      case 'multiple_choice':
        defaultTitle = 'Choose an option';
        defaultSettings = { options: ['Option 1', 'Option 2'] };
        break;
      case 'dropdown':
        defaultTitle = 'Select an option';
        defaultSettings = { options: ['Option 1'] };
        break;
      case 'email':
        defaultTitle = 'What is your email address?';
        break;
      case 'number':
        defaultTitle = 'Enter a number';
        break;
      case 'yes_no':
        defaultTitle = 'Do you agree?';
        break;
      case 'rating':
        defaultTitle = 'How would you rate your experience?';
        defaultSettings = { max: 5 };
        break;
    }

    try {
      setActionLoading(true);
      const newQ = await api.createQuestion(formIdNum, {
        type,
        title: defaultTitle,
        settings: defaultSettings,
      });

      const updatedQuestions = await api.fetchQuestions(formIdNum);
      setQuestions(updatedQuestions);
      setSelectedQuestionId(newQ.id);
      setIsEditorDirty(false);
      showToast('Question added successfully!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add question';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveQuestion = async (id: number, payload: QuestionUpdatePayload) => {
    try {
      setSavingQuestion(true);
      const updatedQ = await api.updateQuestion(id, payload);

      setQuestions((prev) => prev.map((q) => (q.id === id ? updatedQ : q)));
      setIsEditorDirty(false);
      showToast('Question saved successfully!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save question';
      showToast(msg, 'error');
      throw err;
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deletingQuestion) return;
    const targetId = deletingQuestion.id;

    try {
      setActionLoading(true);
      await api.deleteQuestion(targetId);

      const remainingQuestions = questions.filter((q) => q.id !== targetId);
      setQuestions(remainingQuestions);

      if (selectedQuestionId === targetId) {
        if (remainingQuestions.length > 0) {
          setSelectedQuestionId(remainingQuestions[0].id);
        } else {
          setSelectedQuestionId(null);
        }
      }

      setDeletingQuestion(null);
      setIsEditorDirty(false);
      showToast('Question deleted successfully!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete question';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateFormTitle = async (newTitle: string) => {
    if (!form) return;
    try {
      const updated = await api.updateForm(form.id, { title: newTitle });
      setForm(updated);
      showToast('Form title updated!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update title';
      showToast(msg, 'error');
    }
  };

  const handlePublishToggle = async () => {
    if (!form) return;
    try {
      setPublishingForm(true);
      let updated: Form;
      if (form.status === 'published') {
        updated = await api.unpublishForm(form.id);
        showToast('Form set back to draft', 'info');
      } else {
        updated = await api.publishForm(form.id);
        showToast('Form published successfully!', 'success');
      }
      setForm(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change publish status';
      showToast(msg, 'error');
    } finally {
      setPublishingForm(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const previousQuestions = [...questions];

    const reordered = arrayMove(questions, oldIndex, newIndex).map((q, idx) => ({
      ...q,
      position: idx + 1,
    }));

    setQuestions(reordered);
    const orderedIds = reordered.map((q) => q.id);

    try {
      const serverReordered = await api.reorderQuestions(formIdNum, orderedIds);
      setQuestions(serverReordered);
    } catch (err: unknown) {
      setQuestions(previousQuestions);
      const msg = err instanceof Error ? err.message : 'Failed to reorder questions';
      showToast(msg, 'error');
    }
  };

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  return (
    <div className="min-h-screen bg-[#f9f9f8] flex flex-col font-sans text-[#262627]">
      {form && (
        <BuilderHeader
          form={form}
          onUpdateTitle={handleUpdateFormTitle}
          onPublishToggle={handlePublishToggle}
          onShowToast={showToast}
          publishing={publishingForm}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 animate-pulse">
          <div className="md:col-span-3 space-y-3">
            <div className="h-8 bg-zinc-200 rounded-lg" />
            <div className="h-12 bg-zinc-200 rounded-lg" />
            <div className="h-12 bg-zinc-200 rounded-lg" />
          </div>
          <div className="md:col-span-6 h-[500px] bg-zinc-200 rounded-xl" />
          <div className="md:col-span-3 h-[500px] bg-zinc-200 rounded-xl" />
        </div>
      )}

      {/* Error / Not Found State */}
      {!loading && (error || !form) && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-red-200 shadow-xs text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-[#262627] mb-1">Form Not Found</h2>
            <p className="text-xs text-zinc-500 mb-6">{error || 'The requested form could not be located.'}</p>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-[#262627] text-white text-xs font-semibold hover:bg-black transition-colors inline-block"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Main Builder Content Area */}
      {!loading && form && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start flex-1">
            {/* LEFT COLUMN: Question Blocks List */}
            <aside className="md:col-span-3 lg:col-span-3 space-y-3">
              <div className="bg-white p-3 rounded-xl border border-[#e5e5e5] shadow-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 mb-2.5">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Pages ({questions.length})
                  </h2>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="p-1 rounded-md text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
                    title="Add question element"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {questions.length === 0 ? (
                  <div className="py-6 text-center px-2">
                    <p className="text-xs text-zinc-400 mb-3">No questions yet.</p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#262627] text-white text-xs font-semibold hover:bg-black"
                    >
                      <span>+ Add content</span>
                    </button>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={questions.map((q) => q.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-1.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                        {questions.map((q) => (
                          <SortableQuestionItem
                            key={q.id}
                            question={q}
                            isSelected={q.id === selectedQuestionId}
                            onSelect={handleSelectQuestion}
                          />
                        ))}
                      </div>
                    </SortableContext>

                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="w-full mt-3 py-2 rounded-lg border border-dashed border-zinc-300 text-zinc-600 text-xs font-semibold hover:border-zinc-900 hover:text-black transition-colors flex items-center justify-center gap-1"
                    >
                      <span>+ Add content</span>
                    </button>
                  </DndContext>
                )}
              </div>
            </aside>

            {/* CENTER COLUMN: Typeform Live Question Canvas Preview */}
            <section className="md:col-span-6 lg:col-span-6">
              {selectedQuestion ? (
                <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-xs p-8 sm:p-12 flex flex-col justify-center min-h-[500px] relative overflow-hidden">
                  <div className="max-w-xl mx-auto w-full space-y-6">
                    {/* Position tag */}
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-[#262627] text-white font-extrabold text-xs flex items-center justify-center">
                        {selectedQuestion.position}
                      </span>
                      {selectedQuestion.required && (
                        <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
                          * Required
                        </span>
                      )}
                    </div>

                    {/* Question Title & Description Canvas Display */}
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#262627] leading-snug">
                        {selectedQuestion.title}
                      </h2>
                      {selectedQuestion.description && (
                        <p className="mt-2 text-sm text-zinc-500 font-medium">
                          {selectedQuestion.description}
                        </p>
                      )}
                    </div>

                    {/* Input Field Visual Mock in Canvas */}
                    <div className="pt-2">
                      {selectedQuestion.type === 'short_text' && (
                        <input
                          disabled
                          placeholder="Type your answer here..."
                          className="w-full py-2.5 px-1 border-b-2 border-zinc-300 text-base text-zinc-400 bg-transparent"
                        />
                      )}

                      {selectedQuestion.type === 'long_text' && (
                        <textarea
                          disabled
                          placeholder="Type your response here..."
                          rows={3}
                          className="w-full p-3 border border-zinc-200 rounded-xl bg-zinc-50 text-xs text-zinc-400 resize-none"
                        />
                      )}

                      {selectedQuestion.type === 'email' && (
                        <input
                          disabled
                          placeholder="name@example.com"
                          className="w-full py-2.5 px-1 border-b-2 border-zinc-300 text-base text-zinc-400 bg-transparent"
                        />
                      )}

                      {selectedQuestion.type === 'number' && (
                        <input
                          disabled
                          placeholder="0"
                          className="w-full py-2.5 px-1 border-b-2 border-zinc-300 text-base text-zinc-400 bg-transparent"
                        />
                      )}

                      {selectedQuestion.type === 'multiple_choice' && (
                        <div className="space-y-2">
                          {(selectedQuestion.settings?.options || ['Option 1', 'Option 2']).map((opt, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center gap-3 text-xs font-semibold text-zinc-600">
                              <span className="w-6 h-6 rounded-md bg-white border border-zinc-200 flex items-center justify-center font-bold text-[10px]">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedQuestion.type === 'dropdown' && (
                        <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-500 flex items-center justify-between">
                          <span>Select an option...</span>
                          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      )}

                      {selectedQuestion.type === 'yes_no' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-bold text-zinc-700 flex items-center justify-between">
                            <span>Yes</span>
                            <span className="w-5 h-5 rounded bg-white border border-zinc-200 flex items-center justify-center text-[10px]">Y</span>
                          </div>
                          <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-bold text-zinc-700 flex items-center justify-between">
                            <span>No</span>
                            <span className="w-5 h-5 rounded bg-white border border-zinc-200 flex items-center justify-center text-[10px]">N</span>
                          </div>
                        </div>
                      )}

                      {selectedQuestion.type === 'rating' && (
                        <div className="flex items-center gap-2">
                          {Array.from({ length: selectedQuestion.settings?.max || 5 }, (_, i) => i + 1).map((val) => (
                            <div key={val} className="w-10 h-10 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center font-bold text-xs text-zinc-600">
                              {val}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 text-left">
                      <span className="text-[11px] font-medium text-zinc-400">
                        Shift + Enter to make a line break
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-xs p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-[#262627] mb-1">No question selected</h3>
                  <p className="text-xs text-zinc-500 max-w-xs mb-5">
                    Add or click a question block on the left panel to preview and edit its content.
                  </p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#262627] text-white text-xs font-semibold hover:bg-black"
                  >
                    <span>+ Add question element</span>
                  </button>
                </div>
              )}
            </section>

            {/* RIGHT COLUMN: Question Settings Inspector */}
            <section className="md:col-span-3 lg:col-span-3">
              {selectedQuestion ? (
                <QuestionEditor
                  key={selectedQuestion.id}
                  question={selectedQuestion}
                  onSave={handleSaveQuestion}
                  onDelete={(id) => {
                    const qToDelete = questions.find((q) => q.id === id);
                    if (qToDelete) setDeletingQuestion(qToDelete);
                  }}
                  saving={savingQuestion}
                  onDirtyChange={setIsEditorDirty}
                />
              ) : (
                <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 text-center text-xs text-zinc-400 min-h-[500px] flex items-center justify-center">
                  Select a question to view settings
                </div>
              )}
            </section>
          </div>
        </main>
      )}

      {/* Question Type Selector Modal */}
      <QuestionTypeSelectorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelect={handleAddQuestion}
      />

      {/* Delete Question Confirmation Modal */}
      <ConfirmDeleteModal
        title={deletingQuestion?.title}
        itemType="Question"
        isOpen={!!deletingQuestion}
        onClose={() => setDeletingQuestion(null)}
        onConfirm={handleDeleteQuestion}
        loading={actionLoading}
      />

      {/* Unsaved Changes Guard Modal */}
      {pendingSelectId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 relative">
            <h2 className="text-base font-bold text-[#262627] mb-2">Unsaved changes</h2>
            <p className="text-xs text-zinc-600 mb-6">
              You have unsaved changes on the current question. Switching to another question will discard these changes. Do you want to proceed?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setPendingSelectId(null)}
                className="px-3.5 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Keep editing
              </button>
              <button
                onClick={confirmSwitchQuestion}
                className="px-3.5 py-2 rounded-lg bg-[#262627] text-white text-xs font-semibold hover:bg-black"
              >
                Discard changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

