<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useProjects } from '../composables/useProjects'
import { useTheme } from '../composables/useTheme'

const router = useRouter()
const route = useRoute()
const { user, signOut } = useAuth()
const { projects, current, fetchProjects, setCurrentProject } = useProjects()
const { isDark, toggle: toggleTheme } = useTheme()

const projectMenuOpen = ref(false)
const cmdHintVisible = ref(false)

const serverBase = import.meta.env.DEV ? 'http://localhost:3456' : ''
const publicChangelogUrl = computed(() =>
  current.value ? `${serverBase}/${current.value.slug}` : null,
)

onMounted(() => {
  fetchProjects()
  setTimeout(() => (cmdHintVisible.value = true), 1400)
})

function closeOnOutside(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest('[data-project-menu]')) {
    projectMenuOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', closeOnOutside))
onUnmounted(() => document.removeEventListener('mousedown', closeOnOutside))

const navGroups = [
  {
    label: 'Content',
    items: [{ id: 'entries', label: 'Entries', path: '/entries', icon: 'entries' }],
  },
  {
    label: 'Manage',
    items: [
      { id: 'projects', label: 'Projects', path: '/projects', icon: 'projects' },
      { id: 'settings', label: 'Settings', path: '/settings', icon: 'settings' },
    ],
  },
]

function isActive(path: string): boolean {
  return route.path.startsWith(path)
}

function projectColor(accentColor: string | null): string {
  return accentColor ?? '#0a6640'
}

function selectProject(p: (typeof projects.value)[0]): void {
  setCurrentProject(p)
  projectMenuOpen.value = false
}

function goToProjects(): void {
  router.push('/projects')
  projectMenuOpen.value = false
}
</script>

<template>
  <div style="display: flex; height: 100vh; overflow: hidden; background: var(--bg)">
    <!-- Sidebar -->
    <aside
      style="
        width: 216px;
        flex-shrink: 0;
        background: var(--sidebar-bg);
        border-right: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        height: 100%;
      "
    >
      <!-- Logo -->
      <div style="padding: 16px 16px 12px; display: flex; align-items: center; gap: 8px">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <rect
            width="20"
            height="20"
            rx="5"
            fill="#111110"
          />
          <rect
            x="5"
            y="6.5"
            width="5"
            height="1.5"
            rx="0.75"
            fill="white"
          />
          <rect
            x="5"
            y="9.5"
            width="9"
            height="1.5"
            rx="0.75"
            fill="white"
          />
          <rect
            x="5"
            y="12.5"
            width="7"
            height="1.5"
            rx="0.75"
            fill="white"
          />
        </svg>
        <span
          style="
            font-family: var(--font-mono);
            font-size: 13px;
            font-weight: 500;
            color: var(--text);
          "
        >
          changelog.sh
        </span>
      </div>

      <!-- Project selector -->
      <div
        style="margin: 0 10px 14px; position: relative"
        data-project-menu
      >
        <button
          @click="projectMenuOpen = !projectMenuOpen"
          style="
            width: 100%;
            background: var(--surface);
            box-shadow: var(--sh-sm);
            border-radius: var(--r-md);
            border: none;
            padding: 9px 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            text-align: left;
          "
          @mouseover="(e) => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-md)')"
          @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--sh-sm)')"
        >
          <!-- Color badge -->
          <div
            style="
              width: 22px;
              height: 22px;
              border-radius: var(--r-xs);
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            "
            :style="{ background: projectColor(current?.accentColor ?? null) }"
          >
            <span style="color: white; font-size: 10px; font-weight: 600; line-height: 1">
              {{ (current?.name?.[0] ?? 'P').toUpperCase() }}
            </span>
          </div>

          <div style="overflow: hidden; flex: 1">
            <div
              style="
                font-size: 13px;
                font-weight: 500;
                color: var(--text);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
            >
              {{ current?.name ?? 'Select project' }}
            </div>
            <div
              style="
                font-family: var(--font-mono);
                font-size: 10px;
                color: var(--dimmed);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
            >
              {{ current?.slug ?? '—' }}
            </div>
          </div>

          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style="flex-shrink: 0; transition: transform 150ms var(--ease-out)"
            :style="{ transform: projectMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }"
          >
            <path
              d="M3 5l3 3 3-3"
              stroke="var(--dimmed)"
              stroke-width="1.3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <!-- Dropdown -->
        <Transition name="dropdown">
          <div
            v-if="projectMenuOpen"
            style="
              position: absolute;
              top: calc(100% + 4px);
              left: 0;
              right: 0;
              z-index: 50;
              background: var(--surface);
              box-shadow: var(--sh-lg);
              border-radius: var(--r-md);
              border: 1px solid var(--border-md);
              overflow: hidden;
            "
          >
            <button
              v-for="p in projects"
              :key="p.id"
              @click="selectProject(p)"
              style="
                width: 100%;
                background: none;
                border: none;
                padding: 9px 12px;
                text-align: left;
                cursor: pointer;
                font-family: var(--font-ui);
                font-size: 13px;
                color: var(--text);
                display: flex;
                align-items: center;
                gap: 8px;
              "
              @mouseover="(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg)')"
              @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.background = 'none')"
            >
              <div
                style="
                  width: 16px;
                  height: 16px;
                  border-radius: 3px;
                  flex-shrink: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
                :style="{ background: projectColor(p.accentColor) }"
              >
                <span style="color: white; font-size: 8px; font-weight: 700">{{
                  p.name[0].toUpperCase()
                }}</span>
              </div>
              <span
                style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
              >{{ p.name }}</span>
              <svg
                v-if="current?.id === p.id"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M2 6l3 3 5-5"
                  stroke="var(--accent)"
                  stroke-width="1.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <div style="border-top: 1px solid var(--border); padding: 4px 6px">
              <button
                @click="goToProjects"
                style="
                  width: 100%;
                  background: none;
                  border: none;
                  padding: 7px 8px;
                  text-align: left;
                  cursor: pointer;
                  font-size: 12px;
                  color: var(--muted);
                  border-radius: var(--r-sm);
                  font-family: var(--font-ui);
                  display: flex;
                  align-items: center;
                  gap: 6px;
                "
                @mouseover="
                  (e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg)')
                "
                @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.background = 'none')"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M6 1v10M1 6h10"
                    stroke="currentColor"
                    stroke-width="1.3"
                    stroke-linecap="round"
                  />
                </svg>
                New project
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Nav -->
      <nav style="flex: 1; padding: 0 8px; overflow-y: auto">
        <div
          v-for="group in navGroups"
          :key="group.label"
          style="margin-bottom: 16px"
        >
          <div
            style="
              font-family: var(--font-mono);
              font-size: 9.5px;
              font-weight: 500;
              color: var(--dimmed);
              text-transform: uppercase;
              letter-spacing: 0.07em;
              padding: 0 8px;
              margin-bottom: 3px;
            "
          >
            {{ group.label }}
          </div>
          <button
            v-for="item in group.items"
            :key="item.id"
            @click="router.push(item.path)"
            style="
              width: 100%;
              border: none;
              border-radius: var(--r-sm);
              padding: 7px 8px;
              margin-bottom: 1px;
              display: flex;
              align-items: center;
              gap: 8px;
              cursor: pointer;
              text-align: left;
              font-family: var(--font-ui);
              font-size: 13px;
              transition: background 100ms;
            "
            :style="{
              background: isActive(item.path) ? 'rgba(0,0,0,0.055)' : 'transparent',
              fontWeight: isActive(item.path) ? '500' : '400',
              color: isActive(item.path) ? 'var(--text)' : 'var(--muted)',
            }"
            @mouseover="
              (e) => {
                if (!isActive(item.path))
                  (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.03)'
              }
            "
            @mouseleave="
              (e) => {
                if (!isActive(item.path))
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
              }
            "
          >
            <svg
              v-if="item.icon === 'entries'"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M2 4h10M2 7h7M2 10h9"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
              />
            </svg>
            <svg
              v-else-if="item.icon === 'projects'"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <rect
                x="1.5"
                y="1.5"
                width="4.5"
                height="4.5"
                rx="1"
                stroke="currentColor"
                stroke-width="1.3"
              />
              <rect
                x="8"
                y="1.5"
                width="4.5"
                height="4.5"
                rx="1"
                stroke="currentColor"
                stroke-width="1.3"
              />
              <rect
                x="1.5"
                y="8"
                width="4.5"
                height="4.5"
                rx="1"
                stroke="currentColor"
                stroke-width="1.3"
              />
              <rect
                x="8"
                y="8"
                width="4.5"
                height="4.5"
                rx="1"
                stroke="currentColor"
                stroke-width="1.3"
              />
            </svg>
            <svg
              v-else-if="item.icon === 'settings'"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <circle
                cx="7"
                cy="7"
                r="2"
                stroke="currentColor"
                stroke-width="1.3"
              />
              <path
                d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.9 2.9l1.1 1.1M10 10l1.1 1.1M2.9 11.1L4 10M10 4l1.1-1.1"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
              />
            </svg>
            {{ item.label }}
          </button>
        </div>

        <!-- Public changelog link -->
        <div style="margin-top: 4px; padding: 0 8px">
          <a
            v-if="publicChangelogUrl"
            :href="publicChangelogUrl"
            target="_blank"
            rel="noopener"
            style="
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 7px 0;
              font-size: 12px;
              color: var(--dimmed);
              text-decoration: none;
            "
            @mouseover="(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--muted)')"
            @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--dimmed)')"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M10 3H3v8h8V7M10 3l1 1M10 3H7M11 4L7.5 7.5"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Ver changelog público
          </a>
        </div>
      </nav>

      <!-- Command hint -->
      <Transition name="fade">
        <div
          v-if="cmdHintVisible"
          style="
            margin: 0 10px 8px;
            padding: 7px 10px;
            background: var(--bg2);
            border-radius: var(--r-sm);
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: default;
          "
        >
          <kbd
            style="
              font-family: var(--font-mono);
              font-size: 10px;
              color: var(--dimmed);
              background: var(--surface);
              border: 1px solid var(--border-md);
              border-radius: 4px;
              padding: 1px 5px;
            "
          >⌘K</kbd>
          <span style="font-size: 11px; color: var(--dimmed)">Command palette</span>
        </div>
      </Transition>

      <!-- User -->
      <div style="padding: 10px 12px 12px; border-top: 1px solid var(--border)">
        <!-- Row 1: avatar + name + actions -->
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 3px">
          <div
            style="
              width: 26px;
              height: 26px;
              border-radius: 50%;
              background: var(--accent);
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            <span style="color: white; font-size: 10px; font-weight: 600; line-height: 1">
              {{ user?.name?.[0]?.toUpperCase() ?? 'U' }}
            </span>
          </div>
          <span
            style="
              flex: 1;
              font-size: 13px;
              font-weight: 500;
              color: var(--text);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            "
          >{{ user?.name ?? 'User' }}</span>

          <!-- Theme toggle -->
          <button
            @click="toggleTheme"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            style="
              background: none;
              border: none;
              cursor: pointer;
              color: var(--dimmed);
              padding: 4px;
              border-radius: 4px;
              flex-shrink: 0;
            "
            @mouseover="(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--muted)')"
            @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--dimmed)')"
          >
            <svg
              v-if="isDark"
              width="13"
              height="13"
              viewBox="0 0 14 14"
              fill="none"
            >
              <circle
                cx="7"
                cy="7"
                r="2.5"
                stroke="currentColor"
                stroke-width="1.3"
              />
              <path
                d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.9 2.9l1.1 1.1M10 10l1.1 1.1M2.9 11.1L4 10M10 4l1.1-1.1"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
              />
            </svg>
            <svg
              v-else
              width="13"
              height="13"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M11.5 8A5 5 0 016 2.5a5 5 0 100 9 5 5 0 005.5-3.5z"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <!-- Sign out -->
          <button
            @click="signOut"
            title="Sign out"
            style="
              background: none;
              border: none;
              cursor: pointer;
              color: var(--dimmed);
              padding: 4px;
              border-radius: 4px;
              flex-shrink: 0;
            "
            @mouseover="(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--muted)')"
            @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--dimmed)')"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9.5 9.5L12 7l-2.5-2.5M12 7H5"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>

        <!-- Row 2: email -->
        <div
          style="
            padding-left: 34px;
            font-family: var(--font-mono);
            font-size: 10px;
            color: var(--dimmed);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          "
        >
          {{ user?.email ?? '' }}
        </div>
      </div>
    </aside>

    <!-- Main -->
    <main style="flex: 1; display: flex; flex-direction: column; overflow: hidden">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.dropdown-enter-active {
  animation: scaleIn 160ms var(--ease-spring) both;
}
.dropdown-leave-active {
  animation: fadeIn 100ms ease reverse both;
}

.fade-enter-active {
  animation: fadeUp 400ms var(--ease-spring) both;
}
.fade-leave-active {
  transition: opacity 200ms;
}
.fade-leave-to {
  opacity: 0;
}
</style>
