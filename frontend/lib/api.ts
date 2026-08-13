import { Form, FormCreatePayload, FormUpdatePayload } from './types';

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
