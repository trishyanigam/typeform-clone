export type FormStatus = 'draft' | 'published';

export interface Form {
  id: number;
  title: string;
  slug: string;
  status: FormStatus;
  created_at: string;
  updated_at: string;
  response_count: number;
}

export interface FormCreatePayload {
  title: string;
}

export interface FormUpdatePayload {
  title: string;
}

export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'multiple_choice'
  | 'dropdown'
  | 'email'
  | 'number'
  | 'yes_no'
  | 'rating';

export interface QuestionSettings {
  options?: string[];
  max?: number;
  [key: string]: any;
}

export interface Question {
  id: number;
  form_id: number;
  type: QuestionType;
  title: string;
  description: string | null;
  required: boolean;
  position: number;
  settings: QuestionSettings | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionCreatePayload {
  type: QuestionType;
  title: string;
  description?: string | null;
  required?: boolean;
  settings?: QuestionSettings | null;
}

export interface QuestionUpdatePayload {
  type?: QuestionType;
  title?: string;
  description?: string | null;
  required?: boolean;
  settings?: QuestionSettings | null;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// --- PUBLIC RESPONDENT TYPES ---

export interface PublicQuestion {
  id: number;
  type: QuestionType;
  title: string;
  description: string | null;
  required: boolean;
  position: number;
  settings: QuestionSettings | null;
}

export interface PublicForm {
  id: number;
  title: string;
  slug: string;
  questions: PublicQuestion[];
}

export interface AnswerItem {
  question_id: number;
  value: any;
}

export interface ResponseSubmissionPayload {
  answers: AnswerItem[];
}

export interface ResponseSubmissionResponse {
  response_id: number;
  message: string;
}
