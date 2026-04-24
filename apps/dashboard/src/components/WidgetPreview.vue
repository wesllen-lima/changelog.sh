<script setup lang="ts">
import { computed } from 'vue'
import type { WidgetEntry } from '@changelog/types'

const props = defineProps<{
  slug: string
  entries: WidgetEntry[]
  projectName?: string
}>()

const unread = computed(() => props.entries.length)

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  new: { bg: 'rgba(10,102,64,.15)', color: 'var(--accent)' },
  novo: { bg: 'rgba(10,102,64,.15)', color: 'var(--accent)' },
  fix: { bg: 'rgba(185,28,28,.12)', color: 'var(--red)' },
  correção: { bg: 'rgba(185,28,28,.12)', color: 'var(--red)' },
  improvement: { bg: 'rgba(29,78,216,.12)', color: 'var(--blue)' },
  melhoria: { bg: 'rgba(29,78,216,.12)', color: 'var(--blue)' },
  performance: { bg: 'rgba(146,64,14,.12)', color: 'var(--amber)' },
}

function tagMeta(tag: string): { bg: string; color: string } {
  return TAG_COLORS[tag.toLowerCase()] ?? { bg: 'var(--bg2)', color: 'var(--muted)' }
}

function relDate(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <!-- Fake host app shell -->
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
        padding: 10px 14px;
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
            width: 20px;
            height: 20px;
            border-radius: 5px;
            background: var(--bg3);
            border: 1px solid var(--border-md);
          "
        />
        <span style="font-size: 12px; font-weight: 500; color: var(--muted)">My App</span>
      </div>
      <!-- Widget trigger button with unread badge -->
      <button
        style="
          background: var(--surface);
          border: 1px solid var(--border-md);
          border-radius: var(--r-xs);
          padding: 4px 10px;
          font-size: 11px;
          font-family: var(--font-ui);
          cursor: default;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--text);
          position: relative;
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
            font-size: 9px;
            font-weight: 500;
            padding: 1px 5px;
            line-height: 1.5;
          "
        >{{ unread }}</span>
      </button>
    </div>

    <!-- Widget popover (always open) -->
    <div>
      <!-- Popover header -->
      <div
        style="
          padding: 10px 14px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg);
        "
      >
        <span style="font-family: var(--font-mono); font-size: 11px; color: var(--dimmed)">{{
          slug || 'my-app'
        }}</span>
        <span
          style="
            font-family: var(--font-mono);
            font-size: 9px;
            font-weight: 500;
            background: var(--accent-bg);
            color: var(--accent);
            border-radius: 99px;
            padding: 2px 7px;
          "
        >What's new</span>
      </div>

      <!-- Entry rows -->
      <div
        v-for="(entry, i) in entries.slice(0, 3)"
        :key="entry.id"
        :style="{
          padding: '10px 14px',
          borderBottom: i < Math.min(entries.length, 3) - 1 ? '1px solid var(--border)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--surface)',
        }"
      >
        <!-- Tag -->
        <span
          v-if="entry.tags[0]"
          :style="{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            fontWeight: '500',
            borderRadius: '99px',
            padding: '2px 7px',
            flexShrink: '0',
            background: tagMeta(entry.tags[0]).bg,
            color: tagMeta(entry.tags[0]).color,
            lineHeight: '1.5',
          }"
        >{{ entry.tags[0] }}</span>

        <!-- Title -->
        <span style="font-size: 12px; color: var(--text); flex: 1; line-height: 1.4">
          {{ entry.title }}
        </span>

        <!-- Date -->
        <span
          style="
            font-family: var(--font-mono);
            font-size: 9.5px;
            color: var(--dimmed);
            white-space: nowrap;
            flex-shrink: 0;
          "
        >{{ relDate(entry.publishedAt) }}</span>
      </div>

      <!-- Footer -->
      <div
        style="
          padding: 8px 14px;
          border-top: 1px solid var(--border);
          text-align: center;
          background: var(--bg);
        "
      >
        <span style="font-size: 11px; color: var(--accent); font-weight: 500; cursor: default">
          View full changelog →
        </span>
      </div>
    </div>
  </div>
</template>
