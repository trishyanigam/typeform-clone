'use client';

import React, { useState, useEffect } from 'react';
import { Question, QuestionType, QuestionUpdatePayload } from '../lib/types';
import { QUESTION_TYPES_INFO } from './QuestionTypeSelectorModal';

interface QuestionEditorProps {
  question: Question;
  onSave: (id: number, payload: QuestionUpdatePayload) => Promise<void>;
  onDelete: (id: number) => void;
  saving: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
}

export default function QuestionEditor({
  question,
  onSave,
  onDelete,
  saving,
  onDirtyChange,
}: QuestionEditorProps) {
  const [type, setType] = useState<QuestionType>(question.type);
  const [title, setTitle] = useState<string>(question.title);
  const [description, setDescription] = useState<string>(question.description || '');
  const [required, setRequired] = useState<boolean>(question.required);
  const [options, setOptions] = useState<string[]>(question.settings?.options || []);
  const [ratingMax, setRatingMax] = useState<number>(question.settings?.max || 5);
  const [validationError, setValidationError] = useState<string>('');

  // Sync state whenever selected question changes
  useEffect(() => {
    setType(question.type);
    setTitle(question.title);
    setDescription(question.description || '');
    setRequired(question.required);
    setOptions(question.settings?.options || (question.type === 'multiple_choice' ? ['Option 1', 'Option 2'] : question.type === 'dropdown' ? ['Option 1'] : []));
    setRatingMax(question.settings?.max || 5);
    setValidationError('');
  }, [question]);

  // Determine if local edits differ from saved question state
  const isDirty =
    type !== question.type ||
    title !== question.title ||
    description !== (question.description || '') ||
    required !== question.required ||
    JSON.stringify(options) !== JSON.stringify(question.settings?.options || []) ||
    ratingMax !== (question.settings?.max || 5);

  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  const handleTypeChange = (newType: QuestionType) => {
    setType(newType);
    if (newType === 'multiple_choice' && options.length < 2) {
      setOptions(['Option 1', 'Option 2']);
    } else if (newType === 'dropdown' && options.length < 1) {
      setOptions(['Option 1']);
    }
  };

  const handleAddOption = () => {
    setOptions([...options, `Option ${options.length + 1}`]);
  };

  const handleUpdateOption = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleDeleteOption = (index: number) => {
    if (type === 'multiple_choice' && options.length <= 2) {
      setValidationError('Multiple choice questions must have at least 2 options.');
      return;
    }
    if (type === 'dropdown' && options.length <= 1) {
      setValidationError('Dropdown questions must have at least 1 option.');
      return;
    }
    setValidationError('');
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('Question title cannot be empty.');
      return;
    }

    let settingsPayload: any = null;

    if (type === 'multiple_choice') {
      const nonPharmOptions = options.map((opt) => opt.trim()).filter((opt) => opt.length > 0);
      if (nonPharmOptions.length < 2) {
        setValidationError('Multiple choice questions must have at least 2 non-empty options.');
        return;
      }
      settingsPayload = { options: nonPharmOptions };
    } else if (type === 'dropdown') {
      const nonPharmOptions = options.map((opt) => opt.trim()).filter((opt) => opt.length > 0);
      if (nonPharmOptions.length < 1) {
        setValidationError('Dropdown questions must have at least 1 non-empty option.');
        return;
      }
      settingsPayload = { options: nonPharmOptions };
    } else if (type === 'rating') {
      settingsPayload = { max: ratingMax };
    }

    const payload: QuestionUpdatePayload = {
      type,
      title: trimmedTitle,
      description: description.trim() || null,
      required,
      settings: settingsPayload,
    };

    try {
      await onSave(question.id, payload);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save question');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between h-full min-h-[550px]">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Editor Top Bar: Position & Save Status */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">
              {question.position}
            </span>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Question Editor
            </span>
          </div>

          {isDirty && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full animate-pulse">
              Unsaved changes
            </span>
          )}
        </div>

        {validationError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {validationError}
          </div>
        )}

        {/* 1. Question Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
            Question Type
          </label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
          >
            {QUESTION_TYPES_INFO.map((qt) => (
              <option key={qt.type} value={qt.type}>
                {qt.icon} {qt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Question Title Input */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
            Question Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. What is your full name?"
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all placeholder:text-zinc-400 placeholder:font-normal"
          />
        </div>

        {/* 3. Description / Help Text */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
            Description / Help text (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add optional context or instructions for respondents..."
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all placeholder:text-zinc-400 resize-none"
          />
        </div>

        {/* 4. Required Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
          <div>
            <span className="text-sm font-semibold text-zinc-900 block">Required</span>
            <span className="text-xs text-zinc-500 block">Respondents must answer this question</span>
          </div>
          <button
            type="button"
            onClick={() => setRequired(!required)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              required ? 'bg-zinc-900' : 'bg-zinc-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                required ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 5. Type-Specific Settings */}
        {(type === 'multiple_choice' || type === 'dropdown') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                Options
              </label>
              <button
                type="button"
                onClick={handleAddOption}
                className="text-xs font-semibold text-zinc-900 hover:text-black flex items-center gap-1"
              >
                + Add option
              </button>
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-400 w-5 text-center">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleUpdateOption(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteOption(idx)}
                    className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                    title="Delete option"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {type === 'rating' && (
          <div className="pt-2">
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
              Maximum Rating Scale
            </label>
            <div className="flex items-center gap-3">
              {[3, 5, 7, 10].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRatingMax(val)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    ratingMax === val
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {val} Stars
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-zinc-100 mt-8">
          <button
            type="button"
            onClick={() => onDelete(question.id)}
            className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete question</span>
          </button>

          <button
            type="submit"
            disabled={saving || !isDirty}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50 shadow-sm"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
