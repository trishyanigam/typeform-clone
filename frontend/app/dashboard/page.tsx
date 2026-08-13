'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import FormCard from '../../components/FormCard';
import CreateFormModal from '../../components/CreateFormModal';
import RenameFormModal from '../../components/RenameFormModal';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';
import Toast from '../../components/Toast';
import { Form, ToastMessage } from '../../lib/types';
import * as api from '../../lib/api';

export default function DashboardPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const [deletingForm, setDeletingForm] = useState<Form | null>(null);

  // Toasts state
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

  const loadForms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchForms();
      setForms(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to connect to backend server');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  // Handlers
  const handleCreateForm = async (title: string) => {
    try {
      setActionLoading(true);
      await api.createForm({ title });
      setIsCreateOpen(false);
      showToast('Form created successfully!', 'success');
      await loadForms();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create form';
      showToast(msg, 'error');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenameForm = async (id: number, newTitle: string) => {
    try {
      setActionLoading(true);
      await api.updateForm(id, { title: newTitle });
      setEditingForm(null);
      showToast('Form renamed successfully!', 'success');
      await loadForms();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to rename form';
      showToast(msg, 'error');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicateForm = async (form: Form) => {
    try {
      await api.duplicateForm(form.id);
      showToast(`Duplicated "${form.title}" successfully!`, 'success');
      await loadForms();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to duplicate form';
      showToast(msg, 'error');
    }
  };

  const handlePublishForm = async (form: Form) => {
    try {
      await api.publishForm(form.id);
      showToast(`Published "${form.title}"!`, 'success');
      await loadForms();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish form';
      showToast(msg, 'error');
    }
  };

  const handleUnpublishForm = async (form: Form) => {
    try {
      await api.unpublishForm(form.id);
      showToast(`Unpublished "${form.title}" (set to draft)!`, 'info');
      await loadForms();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to unpublish form';
      showToast(msg, 'error');
    }
  };

  const handleDeleteForm = async (id: number) => {
    try {
      setActionLoading(true);
      await api.deleteForm(id);
      setDeletingForm(null);
      showToast('Form deleted successfully!', 'success');
      await loadForms();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete form';
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 flex flex-col font-sans text-zinc-900">
      <Header
        onCreateClick={() => setIsCreateOpen(true)}
        formCount={forms.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm animate-pulse flex flex-col justify-between h-48"
              >
                <div>
                  <div className="w-20 h-5 bg-zinc-200 rounded-full mb-4" />
                  <div className="w-3/4 h-6 bg-zinc-200 rounded-lg mb-2" />
                  <div className="w-1/2 h-4 bg-zinc-100 rounded-md" />
                </div>
                <div className="flex gap-2 pt-4 border-t border-zinc-100">
                  <div className="flex-1 h-9 bg-zinc-200 rounded-xl" />
                  <div className="w-24 h-9 bg-zinc-100 rounded-xl" />
                </div>
              </div>
            ))}
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
            <h2 className="text-lg font-bold text-zinc-900 mb-1">Failed to load forms</h2>
            <p className="text-sm text-zinc-600 mb-6">{error}</p>
            <button
              onClick={loadForms}
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
        {!loading && !error && forms.length === 0 && (
          <div className="max-w-md mx-auto my-16 p-10 rounded-2xl bg-white border border-zinc-200 shadow-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-400 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-1">No forms yet</h2>
            <p className="text-sm text-zinc-500 mb-6">
              Create your first form to get started.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create form</span>
            </button>
          </div>
        )}

        {/* Forms Grid */}
        {!loading && !error && forms.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onRename={(f) => setEditingForm(f)}
                onDuplicate={handleDuplicateForm}
                onPublish={handlePublishForm}
                onUnpublish={handleUnpublishForm}
                onDelete={(f) => setDeletingForm(f)}
                onShowToast={showToast}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateForm}
        loading={actionLoading}
      />

      <RenameFormModal
        form={editingForm}
        isOpen={!!editingForm}
        onClose={() => setEditingForm(null)}
        onSubmit={handleRenameForm}
        loading={actionLoading}
      />

      <ConfirmDeleteModal
        form={deletingForm}
        isOpen={!!deletingForm}
        onClose={() => setDeletingForm(null)}
        onConfirm={handleDeleteForm}
        loading={actionLoading}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
