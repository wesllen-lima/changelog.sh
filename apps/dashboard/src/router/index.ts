import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

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

  return true
})

export default router
