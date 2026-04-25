<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import TagPill from '../components/TagPill.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { useEntries } from '../composables/useEntries'
import { useProjects } from '../composables/useProjects'
import { useToast } from '../composables/useToast'
import type { Entry } from '@changelog/types'

const router = useRouter()
const {
  entries,
  total,
  loading,
  fetchEntries,
  deleteEntry,
  publishEntry,
  unpublishEntry,
  duplicateEntry,
} = useEntries()
const { current } = useProjects()
const toast = useToast()

const filter = ref<'all' | 'published' | 'draft'>('all')
const search = ref('')
const confirmDeleteId = ref<string | null>(null)
let searchTimer: ReturnType<typeof setTimeout> | null = null

const filtered = computed(() =>
  filter.value === 'draft' ? entries.value.filter((e) => e.publishedAt === null) : entries.value,
)

const counts = computed(() => ({
  all: total.value,
  published: entries.value.filter((e) => e.publishedAt !== null).length,
  draft: entries.value.filter((e) => e.publishedAt === null).length,
}))

const hasMore = computed(() => entries.value.length < total.value)

function doFetch(slug: string): void {
  fetchEntries(slug, {
    publishedOnly: filter.value === 'published',
    q: search.value.trim() || undefined,
  })
}

async function loadMore(): Promise<void> {
  if (!current.value || loading.value || !hasMore.value) return
  await fetchEntries(current.value.slug, {
    publishedOnly: filter.value === 'published',
    q: search.value.trim() || undefined,
    offset: entries.value.length,
    append: true,
  })
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function handleDelete(id: string): Promise<void> {
  await deleteEntry(id)
  confirmDeleteId.value = null
  toast.success('Entry deleted')
}

async function handleTogglePublish(entry: Entry): Promise<void> {
  if (entry.publishedAt) {
    await unpublishEntry(entry.id)
    toast.info('Entry moved to drafts')
  } else {
    await publishEntry(entry.id)
    toast.success('Entry published')
  }
}

onMounted(() => {
  if (current.value) doFetch(current.value.slug)
})

watch(current, (p) => {
  if (p) doFetch(p.slug)
})

watch(filter, () => {
  if (current.value) doFetch(current.value.slug)
})

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (current.value) doFetch(current.value.slug)
  }, 300)
})

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer)
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

      <div style="display: flex; align-items: center; gap: 10px">
        <!-- Search -->
        <div style="position: relative">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style="
              position: absolute;
              left: 10px;
              top: 50%;
              transform: translateY(-50%);
              color: var(--dimmed);
              pointer-events: none;
            "
          >
            <circle
              cx="6"
              cy="6"
              r="4.5"
              stroke="currentColor"
              stroke-width="1.3"
            />
            <path
              d="M10 10l2.5 2.5"
              stroke="currentColor"
              stroke-width="1.3"
              stroke-linecap="round"
            />
          </svg>
          <input
            v-model="search"
            placeholder="Search…"
            style="
              padding: 7px 10px 7px 32px;
              border: 1px solid var(--border-md);
              border-radius: var(--r-sm);
              background: var(--bg);
              font-size: 13px;
              font-family: var(--font-ui);
              color: var(--text);
              outline: none;
              width: 180px;
              transition:
                border-color 120ms,
                box-shadow 120ms,
                width 200ms var(--ease-spring);
            "
            @focus="
              (e) => {
                const el = e.target as HTMLInputElement
                el.style.width = '220px'
                el.style.borderColor = 'var(--accent)'
                el.style.boxShadow = '0 0 0 2px var(--accent-bg)'
              }
            "
            @blur="
              (e) => {
                const el = e.target as HTMLInputElement
                el.style.width = '180px'
                el.style.borderColor = 'var(--border-md)'
                el.style.boxShadow = 'none'
              }
            "
          >
          <button
            v-if="search"
            @click="search = ''"
            style="
              position: absolute;
              right: 8px;
              top: 50%;
              transform: translateY(-50%);
              background: none;
              border: none;
              cursor: pointer;
              color: var(--dimmed);
              padding: 2px;
              line-height: 1;
            "
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M9 3L3 9M3 3l6 6"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>

        <button
          @click="router.push('/entries/new')"
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
          New entry
        </button>
      </div>
    </div>

    <!-- Filter pills -->
    <div
      style="
        padding: 10px 28px;
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
          fontWeight: filter === val ? '500' : '400',
          cursor: 'pointer',
          border: filter === val ? '1px solid var(--border-md)' : '1px solid transparent',
          background: filter === val ? 'var(--surface)' : 'transparent',
          boxShadow: filter === val ? 'var(--sh-xs)' : 'none',
          color: filter === val ? 'var(--text)' : 'var(--muted)',
          transition: 'all 120ms',
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
        >
          {{ counts[val as keyof typeof counts] }}
        </span>
      </button>
    </div>

    <!-- Content -->
    <div style="flex: 1; overflow: auto; padding: 20px 28px">
      <!-- Skeleton loading -->
      <div
        v-if="loading"
        style="
          background: var(--surface);
          border-radius: var(--r-lg);
          box-shadow: var(--sh-sm);
          overflow: hidden;
        "
      >
        <div
          v-for="i in 5"
          :key="i"
          :style="{
            padding: '16px',
            borderBottom: i < 5 ? '1px solid var(--border)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }"
        >
          <div
            class="skeleton"
            style="height: 13px; width: 40%; border-radius: 4px"
          />
          <div style="flex: 1" />
          <div
            class="skeleton"
            style="height: 20px; width: 64px; border-radius: 99px"
          />
          <div
            class="skeleton"
            style="height: 11px; width: 60px; border-radius: 4px"
          />
          <div
            class="skeleton"
            style="height: 28px; width: 56px; border-radius: var(--r-sm)"
          />
        </div>
      </div>

      <!-- Empty -->
      <div
        v-else-if="filtered.length === 0"
        style="padding: 80px 0; text-align: center; animation: fadeUp 300ms var(--ease-spring) both"
      >
        <div
          style="
            width: 44px;
            height: 44px;
            border-radius: var(--r-md);
            background: var(--bg2);
            border: 1px solid var(--border-md);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
          "
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M4 6h12M4 10h8M4 14h10"
              stroke="var(--dimmed)"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div style="font-size: 14px; font-weight: 500; color: var(--text); margin-bottom: 6px">
          {{ search ? 'No entries found' : 'No entries yet' }}
        </div>
        <div style="font-size: 13px; color: var(--muted); margin-bottom: 20px">
          {{ search ? 'Try a different search term.' : 'Write your first changelog entry.' }}
        </div>
        <button
          v-if="!search"
          @click="router.push('/entries/new')"
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
          animation: fadeUp 200ms var(--ease-spring) both;
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
              <th style="padding: 10px 16px; border-bottom: 1px solid var(--border); width: 96px" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(entry, idx) in filtered"
              :key="entry.id"
              @click="router.push(`/entries/${entry.id}`)"
              style="cursor: pointer; transition: background 80ms"
              :style="{
                borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
              }"
              @mouseover="(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg)')"
              @mouseleave="
                (e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')
              "
            >
              <!-- Title + tags -->
              <td style="padding: 13px 16px; max-width: 360px">
                <div
                  style="
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--text);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-bottom: 5px;
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
                <span
                  :title="new Date(entry.updatedAt).toLocaleString()"
                  style="font-family: var(--font-mono); font-size: 11px; color: var(--dimmed)"
                >
                  {{ relativeDate(entry.updatedAt) }}
                </span>
              </td>

              <!-- Actions -->
              <td
                style="padding: 13px 16px; text-align: right"
                @click.stop
              >
                <div
                  v-if="confirmDeleteId === entry.id"
                  style="display: flex; gap: 5px; justify-content: flex-end; align-items: center"
                >
                  <span style="font-size: 12px; color: var(--muted)">Delete?</span>
                  <button
                    @click="handleDelete(entry.id)"
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
                  style="display: flex; gap: 2px; justify-content: flex-end"
                >
                  <!-- Publish toggle -->
                  <button
                    @click.stop="handleTogglePublish(entry)"
                    :title="entry.publishedAt ? 'Unpublish' : 'Publish'"
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
                      <circle
                        cx="6.5"
                        cy="6.5"
                        r="5.5"
                        stroke="currentColor"
                        stroke-width="1.2"
                      />
                      <circle
                        cx="6.5"
                        cy="6.5"
                        r="2.5"
                        :fill="entry.publishedAt ? 'var(--accent)' : 'none'"
                        :stroke="entry.publishedAt ? 'none' : 'currentColor'"
                        stroke-width="1.2"
                      />
                    </svg>
                  </button>
                  <!-- Duplicate -->
                  <button
                    @click.stop="duplicateEntry(entry.id)"
                    title="Duplicate"
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
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <rect
                        x="4"
                        y="4"
                        width="8"
                        height="8"
                        rx="1.5"
                        stroke="currentColor"
                        stroke-width="1.2"
                      />
                      <path
                        d="M2 10V3a1 1 0 011-1h7"
                        stroke="currentColor"
                        stroke-width="1.2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
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
                  <!-- Delete -->
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

      <!-- Load more -->
      <div
        v-if="hasMore && !loading"
        style="margin-top: 14px; display: flex; justify-content: center"
      >
        <button
          @click="loadMore"
          style="
            padding: 7px 18px;
            border: 1px solid var(--border-md);
            border-radius: var(--r-sm);
            background: var(--surface);
            font-size: 13px;
            font-family: var(--font-ui);
            color: var(--muted);
            cursor: pointer;
            box-shadow: var(--sh-sm);
          "
          @mouseover="
            (e) => {
              ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border-dk)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--text)'
            }
          "
          @mouseleave="
            (e) => {
              ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border-md)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--muted)'
            }
          "
        >
          Load more
          <span
            style="
              font-family: var(--font-mono);
              font-size: 11px;
              margin-left: 6px;
              color: var(--dimmed);
            "
          >
            {{ entries.length }} / {{ total }}
          </span>
        </button>
      </div>
    </div>
  </AppLayout>
</template>
