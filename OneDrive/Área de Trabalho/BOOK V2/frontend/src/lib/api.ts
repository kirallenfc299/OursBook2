// API client — calls Next.js API Routes (backed by SQLite)

const BASE = '/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('oursbook_token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: authHeaders(),
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Erro desconhecido');
  }

  return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface APIUser {
  id: string;
  email: string;
  username: string | null;
  name: string;
  avatar: string | null;
  subscription_tier: 'basic' | 'premium' | 'ultimate';
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: APIUser;
}

export const AuthAPI = {
  register: (name: string, email: string, password: string, username?: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, username }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<APIUser>('/auth/me'),

  updateProfile: (data: Partial<Pick<APIUser, 'name' | 'username' | 'avatar' | 'subscription_tier'>>) =>
    request<APIUser>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// ─── Users (admin) ────────────────────────────────────────────────────────────

export const UsersAPI = {
  list: () => request<APIUser[]>('/users'),

  get: (id: string) => request<APIUser>(`/users/${id}`),

  update: (id: string, data: Partial<APIUser> & { newPassword?: string }) =>
    request<APIUser>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/users/${id}`, { method: 'DELETE' }),
};

// ─── User Books ───────────────────────────────────────────────────────────────

export type ListType = 'favorites' | 'reading_list' | 'currently_reading' | 'completed';

export interface UserBookRow {
  id: string;
  user_id: string;
  book_id: string;
  list_type: ListType;
  progress: number;
  created_at: string;
}

export const UserBooksAPI = {
  list: (listType?: ListType) =>
    request<UserBookRow[]>(`/user-books${listType ? `?list_type=${listType}` : ''}`),

  add: (book_id: string, list_type: ListType, progress = 0) =>
    request<UserBookRow>('/user-books', {
      method: 'POST',
      body: JSON.stringify({ book_id, list_type, progress }),
    }),

  remove: (bookId: string, listType?: ListType) =>
    request<{ message: string }>(
      `/user-books/${bookId}${listType ? `?list_type=${listType}` : ''}`,
      { method: 'DELETE' }
    ),
};
