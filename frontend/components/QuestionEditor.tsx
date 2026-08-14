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

  useEffect(() => {
    setType(question.type);
    setTitle(question.title);
    setDescription(question.description || '');
    setRequired(question.required);
    setOptions(question.settings?.options || (question.type === 'multiple_choice' ? ['Option 1', 'Option 2'] : question.type === 'dropdown' ? ['Option 1'] : []));
    setRatingMax(question.settings?.max || 5);
    setValidationError('');
  }, [question]);

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
    <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-xs p-5 flex flex-col justify-between h-full min-h-[500px]">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#262627] text-white text-[10px] font-bold flex items-center justify-center">
              {question.position}
            </span>
            <span className="text-xs font-bold text-[#262627]">
              Question Settings
            </span>
          </div>

          {isDirty && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Unsaved
            </span>
          )}
        </div>

        {validationError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {validationError}
          </div>
        )}

        {/* 1. Question Type */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
            Question Type
          </label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all cursor-pointer"
          >
            {QUESTION_TYPES_INFO.map((qt) => (
              <option key={qt.type} value={qt.type}>
                {qt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Question Title */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
            Question Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. What is your full name?"
            className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all placeholder:text-zinc-400 placeholder:font-normal"
          />
        </div>

        {/* 3. Description */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add optional description or instructions..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all placeholder:text-zinc-400 resize-none"
          />
        </div>

        {/* 4. Required Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-200">
          <div>
            <span className="text-xs font-bold text-zinc-900 block">Required</span>
            <span className="text-[11px] text-zinc-500 block">Must answer to proceed</span>
          </div>
          <button
            type="button"
            onClick={() => setRequired(!required)}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
              required ? 'bg-[#262627]' : 'bg-zinc-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                required ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 5. Options Editor */}
        {(type === 'multiple_choice' || type === 'dropdown') && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Options
              </label>
              <button
                type="button"
                onClick={handleAddOption}
                className="text-xs font-bold text-[#262627] hover:underline flex items-center gap-1"
              >
                + Add option
              </button>
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400 w-4 text-center shrink-0">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleUpdateOption(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteOption(idx)}
                    className="p-1 text-zinc-400 hover:text-red-600 transition-colors shrink-0"
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
          <div className="pt-1">
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
              Rating Scale
            </label>
            <div className="flex items-center gap-2">
              {[3, 5, 7, 10].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRatingMax(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    ratingMax === val
                      ? 'bg-[#262627] text-white border-[#262627]'
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
        {/* Advanced Logic / Branching Coming Soon Indicator */}
        <div className="pt-4 border-t border-zinc-100 mt-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/60 opacity-70 select-none cursor-not-allowed">
            <div className="flex items-center gap-2 text-zinc-500">
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="text-xs font-bold">Logic & Branching</span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-200 px-1.5 py-0.5 rounded">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Delete Question & Save Changes Actions */}
        <div className="pt-4 border-t border-zinc-100 mt-4 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => onDelete(question.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>

          <button
            type="submit"
            disabled={saving || !isDirty}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#262627] text-white text-xs font-semibold hover:bg-black transition-colors disabled:opacity-50 shadow-xs cursor-pointer shrink-0"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

