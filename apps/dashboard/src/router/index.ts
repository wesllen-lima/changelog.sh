import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useProjects } from '../composables/useProjects'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('../views/OnboardingView.vue'),
    },
    {
      path: '/',
      redirect: '/entries',
    },
    {
      path: '/entries',
      name: 'entries',
      component: () => import('../views/EntriesView.vue'),
    },
    {
      path: '/entries/new',
      name: 'entry-new',
      component: () => import('../views/EntryEditorView.vue'),
    },
    {
      path: '/entries/:id',
      name: 'entry-edit',
      component: () => import('../views/EntryEditorView.vue'),
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('../views/ProjectsView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/entries',
    },
  ],
})

router.beforeEach(async (to) => {
  if (to.meta.public) return true

  const { user, fetchMe } = useAuth()
  if (!user.value) {
    const result = await fetchMe()
    if (!result.ok) return '/login'
  }

  if (to.name !== 'onboarding') {
    const { projects, fetchProjects } = useProjects()
    if (projects.value.length === 0) await fetchProjects()
    if (projects.value.length === 0) return '/onboarding'
  }

  return true
})

export default router
