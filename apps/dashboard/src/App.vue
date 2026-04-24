<script setup lang="ts">
import { RouterView } from 'vue-router'
import Toast from './components/Toast.vue'
import CommandPalette from './components/CommandPalette.vue'
</script>

<template>
  <RouterView />
  <Toast />
  <CommandPalette />
</template>
