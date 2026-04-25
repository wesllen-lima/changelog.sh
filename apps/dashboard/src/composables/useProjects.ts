import { ref, readonly } from 'vue'
import { api } from './useApi'
import type { Project, CustomTag, Result } from '@changelog/types'

const projects = ref<Project[]>([])
const current = ref<Project | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function useProjects(): {
  projects: Readonly<typeof projects>
  current: Readonly<typeof current>
  loading: Readonly<typeof loading>
  error: Readonly<typeof error>
  fetchProjects: () => Promise<void>
  createProject: (payload: {
    name: string
    description?: string
    accentColor?: string
  }) => Promise<Result<Project>>
  updateProject: (
    id: string,
    payload: Partial<Pick<Project, 'name' | 'slug' | 'description' | 'accentColor'>> & {
      customTags?: CustomTag[]
    },
  ) => Promise<Result<Project>>
  deleteProject: (id: string) => Promise<Result<undefined>>
  setCurrentProject: (project: Project) => void
} {
  async function fetchProjects(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const result = await api.get<Project[]>('/api/projects')
      if (result.ok) {
        projects.value = result.data
        if (!current.value && result.data.length > 0) {
          current.value = result.data[0]
        }
      } else {
        error.value = result.error
      }
    } finally {
      loading.value = false
    }
  }

  async function createProject(payload: {
    name: string
    description?: string
    accentColor?: string
  }): Promise<Result<Project>> {
    const result = await api.post<Project>('/api/projects', payload)
    if (result.ok) {
      projects.value.push(result.data)
      if (!current.value) current.value = result.data
    }
    return result
  }

  async function updateProject(
    id: string,
    payload: Partial<Pick<Project, 'name' | 'slug' | 'description' | 'accentColor'>> & {
      customTags?: CustomTag[]
    },
  ): Promise<Result<Project>> {
    const result = await api.patch<Project>(`/api/projects/${id}`, payload)
    if (result.ok) {
      const idx = projects.value.findIndex((p) => p.id === id)
      if (idx !== -1) projects.value[idx] = result.data
      if (current.value?.id === id) current.value = result.data
    }
    return result
  }

  async function deleteProject(id: string): Promise<Result<undefined>> {
    const result = await api.delete<undefined>(`/api/projects/${id}`)
    if (result.ok) {
      projects.value = projects.value.filter((p) => p.id !== id)
      if (current.value?.id === id) current.value = projects.value[0] ?? null
    }
    return result
  }

  function setCurrentProject(project: Project): void {
    current.value = project
  }

  return {
    projects: readonly(projects),
    current: readonly(current),
    loading: readonly(loading),
    error: readonly(error),
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
  }
}
