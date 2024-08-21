<script setup lang="ts">
import TasksView from './components/TasksView.vue'
import { createPBConnection, createTasksStore } from './store'
import { provide } from 'vue'

const conn = createPBConnection()
const store = createTasksStore(conn)

provide('tasksstore', store)
</script>

<template>
  <div class="flex h-screen flex-col items-center overflow-auto bg-lime-50 selection:bg-lime-300">
    <div class="flex h-full w-full max-w-screen-md flex-col items-stretch gap-2 p-2">
      <TasksView v-if="conn.user.value" :conn />

      <div v-else class="flex flex-1 flex-col items-center justify-center gap-2">
        <div class="flex items-center gap-2">
          <h1 class="text-2xl">Cool Todos App</h1>
          <img src="/kitty.png" class="relative top-0.5 h-8" />
        </div>

        <button
          @click="conn.signInWithGoogle"
          class="self-center rounded-md bg-lime-500 p-2 font-semibold text-white hover:bg-lime-600"
        >
          sign in with Google
        </button>
      </div>
    </div>
  </div>
</template>
