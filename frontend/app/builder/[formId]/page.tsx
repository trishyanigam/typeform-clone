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

  // Question Selection with Unsaved Changes Guard
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

  // 1. Create Question
  const handleAddQuestion = async (type: QuestionType) => {
    let defaultTitle = 'Question';
    let defaultSettings: any = null;

    switch (type) {
      case 'short_text':
        defaultTitle = 'What is your name?';
        break;
      case 'long_text':
        defaultTitle = 'Tell us more';
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
        defaultTitle = 'What is your email?';
        break;
      case 'number':
        defaultTitle = 'Enter a number';
        break;
      case 'yes_no':
        defaultTitle = 'Do you agree?';
        break;
      case 'rating':
        defaultTitle = 'How would you rate this?';
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

  // 2. Save Question
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

  // 3. Delete Question
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

  // 4. Update Form Title
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

  // 5. Publish / Unpublish Toggle
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

  // 6. Drag & Drop Reordering Handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const previousQuestions = [...questions];

    // Optimistic local update
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
      // Rollback on failure
      setQuestions(previousQuestions);
      const msg = err instanceof Error ? err.message : 'Failed to reorder questions';
      showToast(msg, 'error');
    }
  };

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  return (
    <div className="min-h-screen bg-zinc-50/50 flex flex-col font-sans text-zinc-900">
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
        <div className="flex-1 max-w-7xl w-full mx-auto p-8 grid grid-cols-1 md:grid-cols-12 gap-8 animate-pulse">
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <div className="h-10 bg-zinc-200 rounded-xl" />
            <div className="h-16 bg-zinc-200 rounded-xl" />
            <div className="h-16 bg-zinc-200 rounded-xl" />
            <div className="h-16 bg-zinc-200 rounded-xl" />
          </div>
          <div className="md:col-span-8 lg:col-span-9 h-[550px] bg-zinc-200 rounded-2xl" />
        </div>
      )}

      {/* Error / Not Found State */}
      {!loading && (error || !form) && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-red-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 mb-1">Form Not Found</h2>
            <p className="text-sm text-zinc-600 mb-6">{error || 'The requested form could not be located.'}</p>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors inline-block"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!loading && form && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* TAB 1: QUESTIONS BUILDER VIEW */}
          {activeTab === 'questions' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: Question Sidebar */}
              <aside className="md:col-span-4 lg:col-span-4 space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      Questions ({questions.length})
                    </h2>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add question</span>
                    </button>
                  </div>

                  {questions.length === 0 ? (
                    <div className="py-8 text-center px-4">
                      <p className="text-xs text-zinc-500 mb-3">No questions added yet.</p>
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="text-xs font-semibold text-zinc-900 underline hover:text-black"
                      >
                        Click here to add your first question
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
                        <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
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
                    </DndContext>
                  )}
                </div>
              </aside>

              {/* RIGHT COLUMN: Question Editor */}
              <section className="md:col-span-8 lg:col-span-8">
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
                  <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-400 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 tracking-tight mb-1">No question selected</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mb-6">
                      Select a question from the left sidebar to edit its settings, or create a new question.
                    </p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add a question</span>
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 2: SETTINGS PLACEHOLDER VIEW */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* SECTION 1: Appearance / Theme */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
                      Appearance
                    </span>
                    <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Theme</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Customize colors, fonts and background.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-[10px] font-bold uppercase tracking-wider">
                    Coming Soon
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      Aa
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-900 block">Default theme</span>
                      <span className="text-[11px] text-zinc-500 block">Minimalist white canvas with dark typography</span>
                    </div>
                  </div>

                  <button
                    disabled
                    className="px-3.5 py-1.5 rounded-lg bg-zinc-200 text-zinc-500 text-xs font-semibold cursor-not-allowed shrink-0"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>

              {/* SECTION 2: Thank-you screen */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
                      Submission Experience
                    </span>
                    <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Thank-you screen</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Customize the screen respondents see after submitting the form.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-[10px] font-bold uppercase tracking-wider">
                    Coming Soon
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-sm font-bold">
                    ✓
                  </div>
                  <h4 className="text-xs font-bold text-zinc-800">Default Thank You Screen</h4>
                  <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                    &ldquo;Thanks for completing this form. Your response has been recorded.&rdquo;
                  </p>
                  <div className="pt-2">
                    <button
                      disabled
                      className="px-3.5 py-1.5 rounded-lg bg-zinc-200 text-zinc-500 text-xs font-semibold cursor-not-allowed inline-block"
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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

      {/* Unsaved Changes Switching Guard Modal */}
      {pendingSelectId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 relative">
            <h2 className="text-lg font-bold text-zinc-900 tracking-tight mb-2">Unsaved changes</h2>
            <p className="text-xs text-zinc-600 mb-6">
              You have unsaved changes on the current question. Switching to another question will discard these changes. Do you want to proceed?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setPendingSelectId(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Keep editing
              </button>
              <button
                onClick={confirmSwitchQuestion}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800"
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
