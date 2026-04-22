<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useProjects } from '../composables/useProjects'

const router = useRouter()
const route = useRoute()
const { user, signOut } = useAuth()
const { projects, current, fetchProjects, setCurrentProject } = useProjects()

const projectMenuOpen = ref(false)

onMounted(fetchProjects)

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

function isActive(path: string) {
  return route.path.startsWith(path)
}
</script>

<template>
  <div style="display: flex; height: 100vh; overflow: hidden; background: var(--bg)">
    <!-- Sidebar -->
    <aside
      style="
        width: 216px;
        flex-shrink: 0;
        background: #faf9f7;
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
      <div style="margin: 0 10px 14px; position: relative">
        <button
          @click="projectMenuOpen = !projectMenuOpen"
          style="
            width: 100%;
            background: var(--surface);
            box-shadow: var(--sh-sm);
            border-radius: var(--r-md);
            border: none;
            padding: 10px 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            text-align: left;
          "
        >
          <div style="overflow: hidden">
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
                font-size: 11px;
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
            style="flex-shrink: 0"
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

        <!-- Project dropdown -->
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
            overflow: hidden;
          "
        >
          <button
            v-for="p in projects"
            :key="p.id"
            @click="
              () => {
                setCurrentProject(p)
                projectMenuOpen = false
              }
            "
            style="
              width: 100%;
              background: none;
              border: none;
              padding: 10px 12px;
              text-align: left;
              cursor: pointer;
              font-family: var(--font-ui);
              font-size: 13px;
              color: var(--text);
              display: block;
            "
            :style="{ background: current?.id === p.id ? 'var(--bg2)' : 'transparent' }"
          >
            {{ p.name }}
            <span
              style="
                font-family: var(--font-mono);
                font-size: 11px;
                color: var(--dimmed);
                margin-left: 6px;
              "
            >{{ p.slug }}</span>
          </button>
          <div style="border-top: 1px solid var(--border); padding: 6px 8px">
            <button
              @click="
                () => {
                  router.push('/projects')
                  projectMenuOpen = false
                }
              "
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
              "
            >
              + New project
            </button>
          </div>
        </div>
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
              font-size: 10px;
              font-weight: 500;
              color: var(--dimmed);
              text-transform: uppercase;
              letter-spacing: 0.06em;
              padding: 0 8px;
              margin-bottom: 4px;
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
              margin-bottom: 2px;
              display: flex;
              align-items: center;
              gap: 8px;
              cursor: pointer;
              text-align: left;
              font-family: var(--font-ui);
              font-size: 13px;
            "
            :style="{
              background: isActive(item.path) ? 'rgba(0,0,0,0.05)' : 'transparent',
              fontWeight: isActive(item.path) ? '500' : '400',
              color: isActive(item.path) ? 'var(--text)' : 'var(--muted)',
            }"
          >
            <!-- Entries icon -->
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
            <!-- Projects icon -->
            <svg
              v-if="item.icon === 'projects'"
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
            <!-- Settings icon -->
            <svg
              v-if="item.icon === 'settings'"
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
      </nav>

      <!-- User -->
      <div
        style="
          padding: 12px 14px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 8px;
        "
      >
        <div
          style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: var(--accent);
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          "
        >
          <span style="color: white; font-size: 11px; font-weight: 500">
            {{ user?.name?.[0]?.toUpperCase() ?? 'U' }}
          </span>
        </div>
        <div style="overflow: hidden; flex: 1">
          <div
            style="
              font-size: 13px;
              font-weight: 500;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            "
          >
            {{ user?.name ?? 'User' }}
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
            {{ user?.email ?? '' }}
          </div>
        </div>
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
          "
        >
          <svg
            width="14"
            height="14"
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
    </aside>

    <!-- Main slot -->
    <main style="flex: 1; display: flex; flex-direction: column; overflow: hidden">
      <slot />
    </main>
  </div>
</template>
