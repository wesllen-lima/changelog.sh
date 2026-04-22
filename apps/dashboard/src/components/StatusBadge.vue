<script setup lang="ts">
defineProps<{ status: 'published' | 'draft' | string }>()
</script>

<template>
  <span
    :style="{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '2px 8px',
      borderRadius: '99px',
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      fontWeight: '500',
      whiteSpace: 'nowrap',
      background: status === 'published' ? 'var(--accent-bg)' : 'var(--bg2)',
      color: status === 'published' ? 'var(--accent)' : 'var(--dimmed)',
      border: status === 'published' ? 'none' : '1px solid var(--border-md)',
    }"
  >
    <span
      :style="{
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        background: status === 'published' ? 'var(--accent)' : 'var(--dimmed)',
        flexShrink: '0',
      }"
    />
    {{ status === 'published' ? 'Published' : 'Draft' }}
  </span>
</template>
