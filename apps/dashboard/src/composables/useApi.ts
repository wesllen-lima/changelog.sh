import type { Result } from '@changelog/types'

const BASE = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, init: RequestInit = {}): Promise<Result<T>> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init.headers },
    ...init,
  })

  if (res.status === 204) return { ok: true, data: undefined as T }

  let body: unknown
  try {
    body = await res.json()
  } catch {
    return { ok: false, error: 'Invalid response', status: res.status }
  }

  if (!res.ok) {
    const b = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {}
    const msg = String(b.message ?? b.error ?? 'Request failed')
    return { ok: false, error: msg, status: res.status }
  }

  return { ok: true, data: body as T }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),
  patch: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
