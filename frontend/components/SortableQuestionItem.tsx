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
      className={`w-full p-3 rounded-xl border transition-all duration-150 flex items-center justify-between gap-2.5 group cursor-pointer ${
        isDragging
          ? 'opacity-40 border-dashed border-zinc-400 bg-zinc-100 shadow-lg z-20 scale-[1.02]'
          : isSelected
          ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
          : 'bg-zinc-50/70 hover:bg-zinc-100 border-zinc-200/80 text-zinc-900'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder question"
          className={`p-1 rounded cursor-grab active:cursor-grabbing hover:bg-black/10 focus:outline-none shrink-0 ${
            isSelected ? 'text-zinc-400 hover:text-white' : 'text-zinc-400 hover:text-zinc-700'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 7.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6-9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
        </button>

        <span
          className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
            isSelected ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-700'
          }`}
        >
          {question.position}
        </span>

        <div className="min-w-0">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider block ${
              isSelected ? 'text-zinc-300' : 'text-zinc-400'
            }`}
          >
            {question.type.replace('_', ' ')}
          </span>
          <h3 className="text-xs font-semibold truncate leading-snug">
            {question.title}
          </h3>
        </div>
      </div>

      {question.required && (
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
            isSelected ? 'bg-white/10 text-zinc-300' : 'bg-zinc-200 text-zinc-600'
          }`}
        >
          Req
        </span>
      )}
    </div>
  );
}
