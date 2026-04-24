<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import { useProjects } from '../composables/useProjects'
import { useToast } from '../composables/useToast'

const router = useRouter()
const { projects, loading, fetchProjects, createProject, deleteProject, setCurrentProject } =
  useProjects()
const toast = useToast()

const showNewForm = ref(false)
const newName = ref('')
const creating = ref(false)
const confirmDeleteId = ref<string | null>(null)
const newInputRef = ref<HTMLInputElement | null>(null)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })
}

function projectColor(c: string | null) {
  return c ?? '#0a6640'
}

async function handleCreate() {
  if (!newName.value.trim() || creating.value) return
  creating.value = true
  try {
    await createProject({ name: newName.value.trim() })
    toast.success(`Project "${newName.value.trim()}" created`)
    newName.value = ''
    showNewForm.value = false
  } finally {
    creating.value = false
  }
}

async function handleDelete(id: string) {
  await deleteProject(id)
  confirmDeleteId.value = null
  toast.success('Project deleted')
}

function openNewForm(): void {
  showNewForm.value = true
  setTimeout(() => newInputRef.value?.focus(), 50)
}

type Project = (typeof projects.value)[0]

function openProject(project: Project): void {
  setCurrentProject(project)
  router.push('/entries')
}

function openProjectSettings(project: Project): void {
  setCurrentProject(project)
  router.push('/settings')
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
        @click="openNewForm"
        style="
          background: var(--text);
          color: var(--bg);
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

    <div style="flex: 1; overflow: auto; padding: 24px 28px">
      <!-- New project form -->
      <Transition name="slidedown">
        <div
          v-if="showNewForm"
          style="
            background: var(--surface);
            border-radius: var(--r-lg);
            box-shadow: var(--sh-md);
            border: 1px solid var(--border-md);
            padding: 20px;
            margin-bottom: 20px;
          "
        >
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 14px">
            New project
          </div>
          <div style="display: flex; gap: 10px; align-items: flex-end">
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
                ref="newInputRef"
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
                  transition:
                    border-color 120ms,
                    box-shadow 120ms;
                "
                @focus="
                  (e) => {
                    ;(e.target as HTMLInputElement).style.borderColor = 'var(--accent)'
                    ;(e.target as HTMLInputElement).style.boxShadow = '0 0 0 2px var(--accent-bg)'
                  }
                "
                @blur="
                  (e) => {
                    ;(e.target as HTMLInputElement).style.borderColor = 'var(--border-md)'
                    ;(e.target as HTMLInputElement).style.boxShadow = 'none'
                  }
                "
              >
            </div>
            <button
              @click="handleCreate"
              :disabled="!newName.trim() || creating"
              style="
                padding: 9px 18px;
                background: var(--text);
                color: var(--bg);
                border: none;
                border-radius: var(--r-sm);
                font-size: 13px;
                font-weight: 500;
                font-family: var(--font-ui);
                cursor: pointer;
                white-space: nowrap;
              "
              @mouseover="(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.87')"
              @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')"
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
        </div>
      </Transition>

      <!-- Loading -->
      <div
        v-if="loading"
        style="
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        "
      >
        <div
          v-for="i in 3"
          :key="i"
          class="skeleton"
          style="height: 160px; border-radius: var(--r-lg)"
        />
      </div>

      <!-- Card grid -->
      <div
        v-else-if="projects.length"
        style="
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          animation: fadeUp 200ms var(--ease-spring) both;
        "
      >
        <div
          v-for="project in projects"
          :key="project.id"
          style="
            background: var(--surface);
            border-radius: var(--r-lg);
            box-shadow: var(--sh-sm);
            border: 1px solid var(--border);
            overflow: hidden;
            transition:
              box-shadow 200ms var(--ease-smooth),
              transform 200ms var(--ease-smooth);
            cursor: pointer;
          "
          @click="openProject(project)"
          @mouseover="
            (e) => {
              const el = e.currentTarget as HTMLElement
              el.style.boxShadow = 'var(--sh-lg)'
              el.style.transform = 'translateY(-2px)'
            }
          "
          @mouseleave="
            (e) => {
              const el = e.currentTarget as HTMLElement
              el.style.boxShadow = 'var(--sh-sm)'
              el.style.transform = 'none'
            }
          "
        >
          <!-- Colored header -->
          <div
            style="
              height: 80px;
              padding: 16px;
              display: flex;
              align-items: flex-end;
              position: relative;
              overflow: hidden;
            "
            :style="{ background: projectColor(project.accentColor) }"
          >
            <!-- Abstract shape -->
            <div
              style="
                position: absolute;
                top: -20px;
                right: -20px;
                width: 120px;
                height: 120px;
                border-radius: 50%;
                opacity: 0.15;
              "
              :style="{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }"
            />
            <div
              style="
                width: 36px;
                height: 36px;
                border-radius: var(--r-sm);
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(4px);
                display: flex;
                align-items: center;
                justify-content: center;
              "
            >
              <span style="color: white; font-size: 16px; font-weight: 700; line-height: 1">
                {{ project.name[0].toUpperCase() }}
              </span>
            </div>
          </div>

          <!-- Body -->
          <div style="padding: 14px 16px 12px">
            <div
              style="
                font-size: 14px;
                font-weight: 600;
                color: var(--text);
                margin-bottom: 2px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
            >
              {{ project.name }}
            </div>
            <div
              style="
                font-family: var(--font-mono);
                font-size: 11px;
                color: var(--dimmed);
                margin-bottom: 8px;
              "
            >
              {{ project.slug }}
            </div>
            <div
              v-if="project.description"
              style="
                font-size: 12px;
                color: var(--muted);
                line-height: 1.5;
                margin-bottom: 10px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              "
            >
              {{ project.description }}
            </div>
          </div>

          <!-- Footer -->
          <div
            style="
              padding: 10px 16px;
              border-top: 1px solid var(--border);
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
            @click.stop
          >
            <span style="font-family: var(--font-mono); font-size: 10px; color: var(--dimmed)">
              {{ formatDate(project.createdAt) }}
            </span>

            <div
              v-if="confirmDeleteId === project.id"
              style="display: flex; gap: 5px; align-items: center"
            >
              <span style="font-size: 12px; color: var(--muted)">Delete?</span>
              <button
                @click="handleDelete(project.id)"
                style="
                  padding: 3px 9px;
                  background: var(--red-bg);
                  color: var(--red);
                  border: 1px solid var(--red-border);
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
                  padding: 3px 9px;
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
              style="display: flex; gap: 4px"
            >
              <button
                @click="openProjectSettings(project)"
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
                @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.background = 'none')"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                >
                  <circle
                    cx="6.5"
                    cy="6.5"
                    r="2"
                    stroke="currentColor"
                    stroke-width="1.2"
                  />
                  <path
                    d="M6.5 1v1.3M6.5 10.2V11.5M1 6.5h1.3M10.2 6.5H11.5"
                    stroke="currentColor"
                    stroke-width="1.2"
                    stroke-linecap="round"
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
                @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.background = 'none')"
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
          </div>
        </div>

        <!-- Add card -->
        <button
          @click="openNewForm"
          style="
            min-height: 160px;
            border: 2px dashed var(--border-md);
            border-radius: var(--r-lg);
            background: transparent;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            cursor: pointer;
            color: var(--dimmed);
            transition:
              border-color 150ms,
              background 150ms,
              color 150ms;
          "
          @mouseover="
            (e) => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'var(--accent)'
              el.style.background = 'var(--accent-lt)'
              el.style.color = 'var(--accent)'
            }
          "
          @mouseleave="
            (e) => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'var(--border-md)'
              el.style.background = 'transparent'
              el.style.color = 'var(--dimmed)'
            }
          "
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M10 3v14M3 10h14"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <span style="font-size: 13px; font-weight: 500; font-family: var(--font-ui)">New project</span>
        </button>
      </div>

      <!-- Empty -->
      <div
        v-else
        style="padding: 80px 0; text-align: center; animation: fadeUp 300ms var(--ease-spring) both"
      >
        <div style="font-size: 14px; font-weight: 500; color: var(--text); margin-bottom: 6px">
          No projects yet
        </div>
        <div style="font-size: 13px; color: var(--muted); margin-bottom: 20px">
          Create your first project to get started.
        </div>
        <button
          @click="openNewForm"
          style="
            background: var(--text);
            color: var(--bg);
            border: none;
            border-radius: var(--r-sm);
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 500;
            font-family: var(--font-ui);
            cursor: pointer;
          "
          @mouseover="(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.87')"
          @mouseleave="(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')"
        >
          Create first project →
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.slidedown-enter-active {
  animation: fadeUp 250ms var(--ease-spring) both;
}
.slidedown-leave-active {
  transition:
    opacity 150ms,
    transform 150ms;
}
.slidedown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
