/**
 * lib/api.ts — Centralized API Client
 *
 * WHY centralize API calls?
 * Instead of writing `fetch('http://localhost:5000/api/...')` in every component,
 * we create a single API client that:
 * 1. Reads the base URL from environment variables
 * 2. Automatically attaches the JWT auth token from localStorage
 * 3. Handles JSON serialization/deserialization
 * 4. Can be swapped for a different implementation (e.g., axios) in one place
 *
 * WHY process.env.NEXT_PUBLIC_API_URL?
 * In Next.js, env vars are only available server-side UNLESS prefixed with
 * NEXT_PUBLIC_. Since this client also runs in the browser (for client
 * components), we use NEXT_PUBLIC_ to expose it to the browser bundle.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Get auth token from localStorage (browser only)
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    // Attach token if it exists — this is the "Bearer token" pattern
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

// ─── Convenience methods ──────────────────────────────────────────────────────

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};
