export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface Project {
  id: string
  name: string
  slug: string
  description: string | null
  accentColor: string | null
  ownerId: string
  createdAt: string
}

export interface Entry {
  id: string
  projectId: string
  title: string
  body: string
  tags: string[]
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ApiKey {
  id: string
  projectId: string
  label: string
  lastUsedAt: string | null
  createdAt: string
}

export interface WidgetEntry {
  id: string
  title: string
  body: string
  tags: string[]
  publishedAt: string
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: string; status: number }
