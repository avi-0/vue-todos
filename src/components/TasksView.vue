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
    <h1 class="text-xl">Cute Todos</h1>
    <img src="/kitty.svg" class="relative top-0.5 h-6" />
    <div class="flex-1"></div>
    <a href="https://github.com/avi-0/vue-todos"
      ><i class="bi icon bi-github text-black/25 transition-all hover:text-lime-600"
    /></a>

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
