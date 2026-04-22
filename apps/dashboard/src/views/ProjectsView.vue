<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import { useProjects } from '../composables/useProjects'
import type { Project } from '@changelog/types'

const router = useRouter()
const { projects, loading, fetchProjects, createProject, deleteProject } = useProjects()

const showNewForm = ref(false)
const newName = ref('')
const creating = ref(false)
const confirmDeleteId = ref<string | null>(null)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function handleCreate() {
  if (!newName.value.trim() || creating.value) return
  creating.value = true
  try {
    await createProject({ name: newName.value.trim() })
    newName.value = ''
    showNewForm.value = false
  } finally {
    creating.value = false
  }
}

async function handleDelete(id: string) {
  await deleteProject(id)
  confirmDeleteId.value = null
}

onMounted(fetchProjects)
</script>

<template>
  <AppLayout>
    <!-- Top bar -->
    <div
      style="
        height: 56px;
        flex-shrink: 0;
        border-bottom: 1px solid var(--border);
        padding: 0 28px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--surface);
      "
    >
      <h1 style="font-size: 20px; font-weight: 600; color: var(--text)">
        Projects
      </h1>
      <button
        @click="showNewForm = !showNewForm"
        style="
          background: var(--text);
          color: white;
          border: none;
          border-radius: var(--r-sm);
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-ui);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        "
        @mouseover="(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.87')"
        @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')"
      >
        <span style="font-size: 15px; line-height: 1">+</span>
        New project
      </button>
    </div>

    <div style="flex: 1; overflow: auto; padding: 20px 28px">
      <!-- New project form -->
      <div
        v-if="showNewForm"
        style="
          background: var(--surface);
          border-radius: var(--r-md);
          box-shadow: var(--sh-sm);
          padding: 20px;
          margin-bottom: 16px;
          display: flex;
          gap: 10px;
          align-items: flex-end;
        "
      >
        <div style="flex: 1">
          <label
            style="
              display: block;
              font-size: 12px;
              font-weight: 500;
              color: var(--muted);
              margin-bottom: 5px;
            "
          >Project name</label>
          <input
            v-model="newName"
            placeholder="My App"
            @keydown.enter="handleCreate"
            @keydown.escape="showNewForm = false"
            style="
              width: 100%;
              padding: 9px 12px;
              background: var(--bg);
              border: 1px solid var(--border-md);
              border-radius: var(--r-sm);
              font-size: 14px;
              font-family: var(--font-ui);
              color: var(--text);
              outline: none;
            "
          >
        </div>
        <button
          @click="handleCreate"
          :disabled="!newName.trim() || creating"
          style="
            padding: 9px 16px;
            background: var(--text);
            color: white;
            border: none;
            border-radius: var(--r-sm);
            font-size: 13px;
            font-weight: 500;
            font-family: var(--font-ui);
            cursor: pointer;
            white-space: nowrap;
          "
        >
          {{ creating ? 'Creating…' : 'Create' }}
        </button>
        <button
          @click="showNewForm = false"
          style="
            padding: 9px 14px;
            background: none;
            border: 1px solid var(--border-md);
            border-radius: var(--r-sm);
            font-size: 13px;
            font-family: var(--font-ui);
            cursor: pointer;
            color: var(--muted);
          "
        >
          Cancel
        </button>
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        style="padding: 48px 0; text-align: center; color: var(--dimmed); font-size: 13px"
      >
        Loading…
      </div>

      <!-- Table -->
      <div
        v-else-if="projects.length"
        style="
          background: var(--surface);
          border-radius: var(--r-lg);
          box-shadow: var(--sh-sm);
          overflow: hidden;
        "
      >
        <table style="width: 100%; border-collapse: collapse">
          <thead>
            <tr style="background: var(--bg2)">
              <th
                style="
                  padding: 10px 16px;
                  text-align: left;
                  font-family: var(--font-mono);
                  font-size: 10px;
                  font-weight: 500;
                  color: var(--dimmed);
                  letter-spacing: 0.06em;
                  text-transform: uppercase;
                  border-bottom: 1px solid var(--border);
                "
              >
                Name
              </th>
              <th
                style="
                  padding: 10px 16px;
                  text-align: left;
                  font-family: var(--font-mono);
                  font-size: 10px;
                  font-weight: 500;
                  color: var(--dimmed);
                  letter-spacing: 0.06em;
                  text-transform: uppercase;
                  border-bottom: 1px solid var(--border);
                "
              >
                Slug
              </th>
              <th
                style="
                  padding: 10px 16px;
                  text-align: left;
                  font-family: var(--font-mono);
                  font-size: 10px;
                  font-weight: 500;
                  color: var(--dimmed);
                  letter-spacing: 0.06em;
                  text-transform: uppercase;
                  border-bottom: 1px solid var(--border);
                  white-space: nowrap;
                "
              >
                Created
              </th>
              <th
                style="padding: 10px 16px; border-bottom: 1px solid var(--border); width: 80px"
              />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(project, idx) in projects"
              :key="project.id"
              :style="{
                borderBottom: idx < projects.length - 1 ? '1px solid var(--border)' : 'none',
              }"
              @mouseover="(e) => ((e.currentTarget as HTMLElement).style.background = '#fafaf8')"
              @mouseleave="
                (e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')
              "
            >
              <td style="padding: 13px 16px">
                <span style="font-size: 13px; font-weight: 500; color: var(--text)">{{
                  project.name
                }}</span>
              </td>
              <td style="padding: 13px 16px">
                <span style="font-family: var(--font-mono); font-size: 12px; color: var(--muted)">{{
                  project.slug
                }}</span>
              </td>
              <td style="padding: 13px 16px; white-space: nowrap">
                <span
                  style="font-family: var(--font-mono); font-size: 11px; color: var(--dimmed)"
                >{{ formatDate(project.createdAt) }}</span>
              </td>
              <td
                style="padding: 13px 16px; text-align: right"
                @click.stop
              >
                <div
                  v-if="confirmDeleteId === project.id"
                  style="display: flex; gap: 6px; justify-content: flex-end; align-items: center"
                >
                  <span style="font-size: 12px; color: var(--muted)">Delete?</span>
                  <button
                    @click="handleDelete(project.id)"
                    style="
                      padding: 4px 10px;
                      background: var(--red-bg);
                      color: var(--red);
                      border: 1px solid rgba(185, 28, 28, 0.2);
                      border-radius: var(--r-sm);
                      font-size: 12px;
                      cursor: pointer;
                      font-family: var(--font-ui);
                    "
                  >
                    Yes
                  </button>
                  <button
                    @click="confirmDeleteId = null"
                    style="
                      padding: 4px 10px;
                      background: none;
                      border: 1px solid var(--border-md);
                      border-radius: var(--r-sm);
                      font-size: 12px;
                      cursor: pointer;
                      font-family: var(--font-ui);
                      color: var(--muted);
                    "
                  >
                    No
                  </button>
                </div>
                <div
                  v-else
                  style="display: flex; gap: 2px; justify-content: flex-end"
                >
                  <button
                    @click="router.push('/settings')"
                    title="Settings"
                    style="
                      width: 28px;
                      height: 28px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      border: none;
                      background: none;
                      cursor: pointer;
                      border-radius: var(--r-sm);
                      color: var(--muted);
                    "
                    @mouseover="
                      (e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg2)')
                    "
                    @mouseleave="
                      (e) => ((e.currentTarget as HTMLElement).style.background = 'none')
                    "
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 13 13"
                      fill="none"
                    >
                      <path
                        d="M9 2l2 2-7 7H2V9L9 2z"
                        stroke="currentColor"
                        stroke-width="1.2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    @click="confirmDeleteId = project.id"
                    title="Delete"
                    style="
                      width: 28px;
                      height: 28px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      border: none;
                      background: none;
                      cursor: pointer;
                      border-radius: var(--r-sm);
                      color: var(--muted);
                    "
                    @mouseover="
                      (e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg2)')
                    "
                    @mouseleave="
                      (e) => ((e.currentTarget as HTMLElement).style.background = 'none')
                    "
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 13 13"
                      fill="none"
                    >
                      <path
                        d="M2 4h9M5 4V2.5h3V4M5.5 6.5v4M7.5 6.5v4M3 4l.7 6.5h5.6L10 4"
                        stroke="currentColor"
                        stroke-width="1.2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty -->
      <div
        v-else
        style="padding: 64px 0; text-align: center"
      >
        <div style="font-size: 14px; color: var(--muted); margin-bottom: 10px">
          No projects yet
        </div>
        <button
          @click="showNewForm = true"
          style="
            background: none;
            border: none;
            cursor: pointer;
            color: var(--accent);
            font-size: 13px;
            font-weight: 500;
            font-family: var(--font-ui);
          "
        >
          Create first project →
        </button>
      </div>
    </div>
  </AppLayout>
</template>
