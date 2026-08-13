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

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
