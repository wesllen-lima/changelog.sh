<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import TagPill from '../components/TagPill.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { useEntries } from '../composables/useEntries'
import { useProjects } from '../composables/useProjects'
import type { Entry } from '@changelog/types'

const router = useRouter()
const { entries, loading, fetchEntries, deleteEntry, publishEntry, unpublishEntry } = useEntries()
const { current } = useProjects()

const filter = ref<'all' | 'published' | 'draft'>('all')
const confirmDeleteId = ref<string | null>(null)

const filtered = computed(() => {
  if (filter.value === 'all') return entries.value
  if (filter.value === 'published') return entries.value.filter((e) => e.publishedAt !== null)
  return entries.value.filter((e) => e.publishedAt === null)
})

const counts = computed(() => ({
  all: entries.value.length,
  published: entries.value.filter((e) => e.publishedAt !== null).length,
  draft: entries.value.filter((e) => e.publishedAt === null).length,
}))

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function handleDelete(id: string) {
  await deleteEntry(id)
  confirmDeleteId.value = null
}

async function handleTogglePublish(entry: Entry) {
  if (entry.publishedAt) {
    await unpublishEntry(entry.id)
  } else {
    await publishEntry(entry.id)
  }
}

onMounted(() => {
  if (current.value) fetchEntries(current.value.slug)
})

watch(current, (p) => {
  if (p) fetchEntries(p.slug)
})
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
        Entries
      </h1>
      <button
        @click="router.push('/entries/new')"
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
        New entry
      </button>
    </div>

    <!-- Filter pills -->
    <div
      style="
        padding: 12px 28px;
        border-bottom: 1px solid var(--border);
        background: var(--surface);
        flex-shrink: 0;
        display: flex;
        gap: 4px;
      "
    >
      <button
        v-for="[val, label] in [
          ['all', 'All'],
          ['published', 'Published'],
          ['draft', 'Drafts'],
        ]"
        :key="val"
        @click="filter = val as typeof filter"
        :style="{
          padding: '5px 12px',
          borderRadius: '99px',
          fontSize: '12px',
          fontFamily: 'var(--font-ui)',
          fontWeight: '500',
          cursor: 'pointer',
          border: filter === val ? '1px solid var(--border-md)' : '1px solid transparent',
          background: filter === val ? 'var(--surface)' : 'transparent',
          boxShadow: filter === val ? 'var(--sh-sm)' : 'none',
          color: filter === val ? 'var(--text)' : 'var(--muted)',
        }"
      >
        {{ label }}
        <span
          style="
            font-family: var(--font-mono);
            font-size: 10px;
            color: var(--dimmed);
            margin-left: 5px;
          "
        >{{ counts[val as keyof typeof counts] }}</span>
      </button>
    </div>

    <!-- Table -->
    <div style="flex: 1; overflow: auto; padding: 20px 28px">
      <!-- Loading -->
      <div
        v-if="loading"
        style="padding: 48px 0; text-align: center; color: var(--dimmed); font-size: 13px"
      >
        Loading…
      </div>

      <!-- Empty -->
      <div
        v-else-if="filtered.length === 0"
        style="padding: 64px 0; text-align: center"
      >
        <div style="font-size: 14px; color: var(--muted); margin-bottom: 10px">
          No entries yet
        </div>
        <button
          @click="router.push('/entries/new')"
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
          Create first entry →
        </button>
      </div>

      <!-- Table -->
      <div
        v-else
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
                Title
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
                Status
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
                Date
              </th>
              <th
                style="padding: 10px 16px; border-bottom: 1px solid var(--border); width: 80px"
              />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(entry, idx) in filtered"
              :key="entry.id"
              @click="router.push(`/entries/${entry.id}`)"
              style="cursor: pointer; transition: background 150ms ease"
              :style="{
                borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
              }"
              @mouseover="(e) => ((e.currentTarget as HTMLElement).style.background = '#fafaf8')"
              @mouseleave="
                (e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')
              "
            >
              <!-- Title + tags -->
              <td style="padding: 13px 16px; max-width: 400px">
                <div
                  style="
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--text);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-bottom: 4px;
                  "
                >
                  {{ entry.title || 'Untitled' }}
                </div>
                <div style="display: flex; gap: 4px; flex-wrap: wrap">
                  <TagPill
                    v-for="tag in entry.tags"
                    :key="tag"
                    :tag="tag"
                  />
                </div>
              </td>

              <!-- Status -->
              <td style="padding: 13px 16px; white-space: nowrap">
                <StatusBadge :status="entry.publishedAt ? 'published' : 'draft'" />
              </td>

              <!-- Date -->
              <td style="padding: 13px 16px; white-space: nowrap">
                <span style="font-family: var(--font-mono); font-size: 11px; color: var(--dimmed)">
                  {{ formatDate(entry.updatedAt) }}
                </span>
              </td>

              <!-- Actions -->
              <td
                style="padding: 13px 16px; text-align: right"
                @click.stop
              >
                <div
                  v-if="confirmDeleteId === entry.id"
                  style="display: flex; gap: 6px; justify-content: flex-end; align-items: center"
                >
                  <span style="font-size: 12px; color: var(--muted)">Delete?</span>
                  <button
                    @click="handleDelete(entry.id)"
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
                  <!-- Edit -->
                  <button
                    @click.stop="router.push(`/entries/${entry.id}`)"
                    title="Edit"
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
                  <!-- More / delete -->
                  <button
                    @click.stop="confirmDeleteId = entry.id"
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
    </div>
  </AppLayout>
</template>
