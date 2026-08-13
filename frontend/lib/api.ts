import {
  Form,
  FormCreatePayload,
  FormUpdatePayload,
  Question,
  QuestionCreatePayload,
  QuestionUpdatePayload,
  PublicForm,
  AnswerItem,
  ResponseSubmissionResponse,
  ResponseListResponse,
  ResponseDetailResponse,
  ResponseStatsResponse,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail
            .map((err: { msg?: string; detail?: string }) => err.msg || err.detail || JSON.stringify(err))
            .join(', ');
        }
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

// --- FORMS API ---

export async function fetchForms(): Promise<Form[]> {
  const response = await fetch(`${API_BASE_URL}/forms`, { cache: 'no-store' });
  return handleResponse<Form[]>(response);
}

export async function fetchForm(id: number): Promise<Form> {
  const response = await fetch(`${API_BASE_URL}/forms/${id}`, { cache: 'no-store' });
  return handleResponse<Form>(response);
}

export async function createForm(payload: FormCreatePayload): Promise<Form> {
  const response = await fetch(`${API_BASE_URL}/forms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Form>(response);
}

export async function updateForm(id: number, payload: FormUpdatePayload): Promise<Form> {
  const response = await fetch(`${API_BASE_URL}/forms/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Form>(response);
}

export async function deleteForm(id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/forms/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<{ message: string }>(response);
}

export async function duplicateForm(id: number): Promise<Form> {
  const response = await fetch(`${API_BASE_URL}/forms/${id}/duplicate`, {
    method: 'POST',
  });
  return handleResponse<Form>(response);
}

export async function publishForm(id: number): Promise<Form> {
  const response = await fetch(`${API_BASE_URL}/forms/${id}/publish`, {
    method: 'POST',
  });
  return handleResponse<Form>(response);
}

export async function unpublishForm(id: number): Promise<Form> {
  const response = await fetch(`${API_BASE_URL}/forms/${id}/unpublish`, {
    method: 'POST',
  });
  return handleResponse<Form>(response);
}

// --- QUESTIONS API ---

export async function fetchQuestions(formId: number): Promise<Question[]> {
  const response = await fetch(`${API_BASE_URL}/forms/${formId}/questions`, { cache: 'no-store' });
  return handleResponse<Question[]>(response);
}

export async function createQuestion(formId: number, payload: QuestionCreatePayload): Promise<Question> {
  const response = await fetch(`${API_BASE_URL}/forms/${formId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Question>(response);
}

export async function fetchQuestion(questionId: number): Promise<Question> {
  const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, { cache: 'no-store' });
  return handleResponse<Question>(response);
}

export async function updateQuestion(questionId: number, payload: QuestionUpdatePayload): Promise<Question> {
  const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Question>(response);
}

export async function deleteQuestion(questionId: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
    method: 'DELETE',
  });
  return handleResponse<{ message: string }>(response);
}

export async function reorderQuestions(formId: number, questionIds: number[]): Promise<Question[]> {
  const response = await fetch(`${API_BASE_URL}/forms/${formId}/questions/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question_ids: questionIds }),
  });
  return handleResponse<Question[]>(response);
}

// --- PUBLIC RESPONDENT API ---

export async function fetchPublicForm(slug: string): Promise<PublicForm> {
  const response = await fetch(`${API_BASE_URL}/public/forms/${slug}`, { cache: 'no-store' });
  return handleResponse<PublicForm>(response);
}

export async function submitPublicResponse(
  slug: string,
  answers: AnswerItem[]
): Promise<ResponseSubmissionResponse> {
  const response = await fetch(`${API_BASE_URL}/public/forms/${slug}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  return handleResponse<ResponseSubmissionResponse>(response);
}

// --- CREATOR RESPONSES / RESULTS API ---

export async function fetchFormResponses(formId: number): Promise<ResponseListResponse> {
  const response = await fetch(`${API_BASE_URL}/forms/${formId}/responses`, { cache: 'no-store' });
  return handleResponse<ResponseListResponse>(response);
}

export async function fetchIndividualResponse(
  formId: number,
  responseId: number
): Promise<ResponseDetailResponse> {
  const response = await fetch(`${API_BASE_URL}/forms/${formId}/responses/${responseId}`, { cache: 'no-store' });
  return handleResponse<ResponseDetailResponse>(response);
}

export async function fetchResponseStats(formId: number): Promise<ResponseStatsResponse> {
  const response = await fetch(`${API_BASE_URL}/forms/${formId}/response-stats`, { cache: 'no-store' });
  return handleResponse<ResponseStatsResponse>(response);
}
