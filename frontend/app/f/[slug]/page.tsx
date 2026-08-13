'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import ProgressIndicator from '../../../components/respondent/ProgressIndicator';
import QuestionRenderer from '../../../components/respondent/QuestionRenderer';
import { PublicForm, AnswerItem } from '../../../lib/types';
import * as api from '../../../lib/api';

interface RespondentPageProps {
  params: Promise<{ slug: string }>;
}

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function RespondentPage({ params }: RespondentPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [form, setForm] = useState<PublicForm | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Fetch Public Form schema
  const loadPublicForm = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchPublicForm(slug);
      setForm(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('This form does not exist or is no longer accepting responses.');
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadPublicForm();
  }, [loadPublicForm]);

  const questions = form?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Answer handler
  const handleAnswerChange = (val: any) => {
    if (!currentQuestion) return;
    setValidationError(null);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: val,
    }));
  };

  // Validate answer for a specific question
  const validateQuestion = (q: typeof currentQuestion, val: any): string | null => {
    if (!q) return null;
    const strVal = val !== undefined && val !== null ? str(val).trim() : '';

    if (q.required && !strVal) {
      return 'This question is required.';
    }

    if (!strVal) return null;

    if (q.type === 'email' && !EMAIL_REGEX.test(strVal)) {
      return 'Please enter a valid email address.';
    }

    if (q.type === 'number' && isNaN(Number(strVal))) {
      return 'Please enter a valid number.';
    }

    if (q.type === 'yes_no' && strVal.toLowerCase() !== 'yes' && strVal.toLowerCase() !== 'no') {
      return 'Please select Yes or No.';
    }

    if (q.type === 'rating') {
      const num = Number(strVal);
      const max = q.settings?.max || 5;
      if (isNaN(num) || num < 1 || num > max) {
        return `Please select a rating between 1 and ${max}.`;
      }
    }

    return null;
  };

  function str(val: any): string {
    return String(val);
  }

  // Submission handler
  const handleSubmit = async () => {
    if (!form || submitting) return;

    // Validate current & all required questions
    for (const q of questions) {
      const err = validateQuestion(q, answers[q.id]);
      if (err) {
        const qIdx = questions.findIndex((item) => item.id === q.id);
        setCurrentQuestionIndex(qIdx);
        setValidationError(err);
        return;
      }
    }

    try {
      setSubmitting(true);
      setValidationError(null);

      const answersArray: AnswerItem[] = Object.entries(answers)
        .filter(([, val]) => val !== undefined && val !== null && str(val).trim() !== '')
        .map(([qIdStr, val]) => ({
          question_id: Number(qIdStr),
          value: val,
        }));

      await api.submitPublicResponse(slug, answersArray);
      setIsSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit response. Please try again.';
      setValidationError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Next Question Handler
  const handleNext = () => {
    if (!currentQuestion) return;

    const val = answers[currentQuestion.id];
    const err = validateQuestion(currentQuestion, val);

    if (err) {
      setValidationError(err);
      return;
    }

    setValidationError(null);

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Back Question Handler
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setValidationError(null);
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Keyboard Navigation Listener for Shortcuts (A/B/C/D, Y/N, Ratings 1-9)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') {
        return;
      }

      if (!currentQuestion || submitting || isSubmitted) return;

      if (currentQuestion.type === 'multiple_choice') {
        const opts = currentQuestion.settings?.options || [];
        const keyUpper = e.key.toUpperCase();
        const ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        const matchIdx = ALPHABET.indexOf(keyUpper);
        if (matchIdx !== -1 && matchIdx < opts.length) {
          handleAnswerChange(opts[matchIdx]);
        }
      } else if (currentQuestion.type === 'yes_no') {
        if (e.key.toUpperCase() === 'Y') {
          handleAnswerChange('yes');
        } else if (e.key.toUpperCase() === 'N') {
          handleAnswerChange('no');
        }
      } else if (currentQuestion.type === 'rating') {
        const max = currentQuestion.settings?.max || 5;
        const keyNum = parseInt(e.key, 10);
        if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= max) {
          handleAnswerChange(keyNum);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [currentQuestion, submitting, isSubmitted]);

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-zinc-500">Loading form...</p>
      </div>
    );
  }

  // 2. Unavailable / Not Found State
  if (error || !form) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-400 flex items-center justify-center text-2xl mb-4">
          🔒
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">Form Unavailable</h1>
        <p className="text-sm text-zinc-500 max-w-md mb-6">
          This form does not exist, has been deleted, or is currently in draft mode.
        </p>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // 3. Thank You Screen State
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-3xl font-bold mb-6">
          ✓
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mb-3">
          Thank you!
        </h1>
        <p className="text-base text-zinc-500 max-w-md leading-relaxed">
          Your response has been recorded for <span className="font-semibold text-zinc-900">&ldquo;{form.title}&rdquo;</span>.
        </p>
      </div>
    );
  }

  // 4. Conversational One-Question-at-a-Time Main View
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between selection:bg-zinc-900 selection:text-white">
      <ProgressIndicator
        currentIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        onBack={handleBack}
        formTitle={form.title}
      />

      <main className="flex-1 flex items-center justify-center pt-16 pb-12">
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full"
            >
              <QuestionRenderer
                question={currentQuestion}
                value={answers[currentQuestion.id]}
                onChange={handleAnswerChange}
                onNext={handleNext}
                isLast={isLastQuestion}
                validationError={validationError}
                submitting={submitting}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
