<script setup lang="ts">
import type { TasksStore } from '@/tasks'
import { inject } from 'vue'

const api = inject<TasksStore>('tasksstore')!

const onClick = () => api.create({ description: '' })
</script>

<template>
  <div
    class="rounded-md border border-black/15 p-2 transition-all hover:text-lime-600"
    @click="onClick"
  >
    <i class="bi bi-plus-lg icon"></i>
  </div>
</template>
