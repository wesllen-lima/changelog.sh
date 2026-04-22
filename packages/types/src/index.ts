export interface Entry {
  id: string
  title: string
  body: string
  tags: string[]
  publishedAt: string | null
  createdAt: string
}
export interface Project {
  id: string
  name: string
  slug: string
}
