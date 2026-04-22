export type Result<T> = { ok: true; data: T } | { ok: false; error: string; status: number }

export function ok<T>(data: T): Result<T> {
  return { ok: true, data }
}

export function err(error: string, status: number): Result<never> {
  return { ok: false, error, status }
}
