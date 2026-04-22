<script setup lang="ts">
import { computed } from 'vue'
import type { WidgetEntry } from '@changelog/types'

const props = defineProps<{
  slug: string
  entries: WidgetEntry[]
  projectName?: string
}>()

const unread = computed(() => props.entries.length)

const TAG_MAP: Record<string, { bg: string; color: string }> = {
  new: { bg: 'var(--accent-bg)', color: 'var(--accent)' },
  novo: { bg: 'var(--accent-bg)', color: 'var(--accent)' },
  fix: { bg: 'var(--red-bg)', color: 'var(--red)' },
  correção: { bg: 'var(--red-bg)', color: 'var(--red)' },
  improvement: { bg: 'var(--blue-bg)', color: 'var(--blue)' },
  melhoria: { bg: 'var(--blue-bg)', color: 'var(--blue)' },
  performance: { bg: 'var(--amber-bg)', color: 'var(--amber)' },
}

function tagMeta(tag: string) {
  return TAG_MAP[tag.toLowerCase()] ?? { bg: 'var(--bg2)', color: 'var(--muted)' }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

function excerpt(body: string, max = 80) {
  const plain = body.replace(/\*\*|__|`|\#+ /g, '').replace(/\n/g, ' ')
  return plain.length > max ? plain.slice(0, max) + '…' : plain
}
</script>

<template>
  <!-- Simulated host app shell -->
  <div
    style="
      background: var(--surface);
      border: 1px solid var(--border-md);
      border-radius: var(--r-lg);
      box-shadow: var(--sh-md);
      overflow: hidden;
    "
  >
    <!-- Fake app topbar -->
    <div
      style="
        padding: 12px 16px;
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--bg);
      "
    >
      <div style="display: flex; align-items: center; gap: 8px">
        <div
          style="
            width: 24px;
            height: 24px;
            border-radius: 6px;
            background: var(--bg2);
            border: 1px solid var(--border-md);
          "
        />
        <span style="font-size: 13px; font-weight: 500">My App</span>
      </div>

      <!-- Widget trigger button -->
      <div style="position: relative">
        <button
          style="
            background: var(--surface);
            border: 1px solid var(--border-md);
            border-radius: var(--r-sm);
            padding: 6px 12px;
            font-size: 12px;
            font-family: var(--font-ui);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            color: var(--text);
          "
        >
          What's new
          <span
            v-if="unread > 0"
            style="
              background: var(--accent);
              color: white;
              border-radius: 99px;
              font-family: var(--font-mono);
              font-size: 10px;
              font-weight: 500;
              padding: 1px 5px;
              border: 2px solid var(--surface);
            "
          >{{ unread }}</span>
        </button>
      </div>
    </div>

    <!-- Widget popover (always open in preview) -->
    <div style="border-top: 1px solid var(--border); background: var(--surface)">
      <!-- Popover header -->
      <div
        style="
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        "
      >
        <span style="font-size: 13px; font-weight: 500">What's new</span>
        <span
          style="
            font-family: var(--font-mono);
            font-size: 10px;
            color: var(--dimmed);
            background: var(--bg2);
            padding: 2px 7px;
            border-radius: 4px;
            border: 1px solid var(--border-md);
          "
        >{{ unread }} unread</span>
      </div>

      <!-- Entry list -->
      <div
        v-for="(entry, i) in entries.slice(0, 3)"
        :key="entry.id"
        :style="{
          padding: '12px 16px',
          borderBottom: i < Math.min(entries.length, 3) - 1 ? '1px solid var(--border)' : 'none',
        }"
      >
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px">
          <span
            v-for="tag in entry.tags.slice(0, 2)"
            :key="tag"
            :style="{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '1px 6px',
              borderRadius: '99px',
              background: tagMeta(tag).bg,
              color: tagMeta(tag).color,
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              fontWeight: '500',
            }"
          >{{ tag }}</span>
          <span
            style="
              font-family: var(--font-mono);
              font-size: 10px;
              color: var(--dimmed);
              margin-left: auto;
            "
          >
            {{ formatDate(entry.publishedAt) }}
          </span>
        </div>
        <div style="font-size: 13px; font-weight: 500; margin-bottom: 3px">
          {{ entry.title }}
        </div>
        <div style="font-size: 12px; color: var(--muted); line-height: 1.5">
          {{ excerpt(entry.body) }}
        </div>
      </div>

      <div style="padding: 10px 16px; border-top: 1px solid var(--border); text-align: center">
        <a
          :href="`/${slug}`"
          target="_blank"
          style="font-size: 12px; color: var(--accent); font-weight: 500"
        >View full changelog →</a>
      </div>
    </div>
  </div>
</template>
