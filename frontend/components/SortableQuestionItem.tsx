'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Question } from '../lib/types';

interface SortableQuestionItemProps {
  question: Question;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

export function SortableQuestionItem({
  question,
  isSelected,
  onSelect,
}: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(question.id)}
      className={`w-full p-2.5 rounded-lg border transition-all duration-150 flex items-center justify-between gap-2 group cursor-pointer ${
        isDragging
          ? 'opacity-40 border-dashed border-zinc-400 bg-zinc-100 shadow-md z-20'
          : isSelected
          ? 'bg-[#e8e8e7] border-[#262627] text-[#262627] font-semibold'
          : 'bg-white hover:bg-zinc-50 border-[#e5e5e5] text-zinc-700'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder question"
          className="p-0.5 rounded cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-700 focus:outline-none shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6-9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
        </button>

        <span
          className={`w-5 h-5 rounded text-[11px] font-bold flex items-center justify-center shrink-0 ${
            isSelected ? 'bg-[#262627] text-white' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
          }`}
        >
          {question.position}
        </span>

        <div className="min-w-0">
          <span className="text-[10px] font-medium text-zinc-400 block uppercase tracking-wider">
            {question.type.replace('_', ' ')}
          </span>
          <h3 className="text-xs truncate leading-snug">
            {question.title}
          </h3>
        </div>
      </div>

      {question.required && (
        <span className="text-[9px] font-bold text-red-600 shrink-0">
          *
        </span>
      )}
    </div>
  );
}

