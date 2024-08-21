<script setup lang="ts">
import type { TasksStore } from '@/tasks'
import { inject } from 'vue'
import AddTask from './AddTask.vue'
import type { PBConnection } from '@/store'
import TaskComponent from './TaskComponent.vue'

const props = defineProps<{
  conn: PBConnection
}>()

const store = inject<TasksStore>('tasksstore')!
</script>

<template>
  <div class="flex items-center gap-2">
    <h1 class="text-xl">Cool Todos App</h1>
    <img src="/kitty.png" class="relative top-0.5 h-6" />
    <div class="flex-1"></div>
    <button
      class="rounded-md bg-lime-500 p-2 font-semibold text-white hover:bg-lime-600"
      @click="props.conn.logOut"
    >
      log out
    </button>
  </div>

  <AddTask />

  <TransitionGroup>
    <TaskComponent v-for="task in store.tasks.value" :key="task.id" :task="task" />
  </TransitionGroup>
</template>
