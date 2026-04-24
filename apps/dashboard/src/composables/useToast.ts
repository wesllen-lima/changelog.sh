import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  action?: { label: string; fn: () => void }
}

type ToastOpts = { message?: string; action?: Toast['action'] }

const toasts = ref<Toast[]>([])

function remove(id: string): void {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

function add(type: ToastType, title: string, opts?: ToastOpts): void {
  const id = Math.random().toString(36).slice(2)
  toasts.value.push({ id, type, title, ...opts })
  setTimeout(() => remove(id), 3500)
}

export function useToast(): {
  toasts: typeof toasts
  remove: (id: string) => void
  success: (title: string, opts?: ToastOpts) => void
  error: (title: string, opts?: ToastOpts) => void
  info: (title: string, opts?: ToastOpts) => void
  warning: (title: string, opts?: ToastOpts) => void
} {
  return {
    toasts,
    remove,
    success: (title, opts) => add('success', title, opts),
    error: (title, opts) => add('error', title, opts),
    info: (title, opts) => add('info', title, opts),
    warning: (title, opts) => add('warning', title, opts),
  }
}
