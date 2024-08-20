<script setup lang="ts">
import type { TasksStore } from '@/tasks'
import { inject, ref } from 'vue'
import InputField from './InputField.vue'

const store = inject<TasksStore>('tasksstore')!

const description = ref('')

const submit = () => {
  store.create({ description: description.value })
  description.value = ''
}
</script>

<template>
  <div class="flex items-center justify-stretch gap-2">
    <i class="bi icon bi-plus-lg pl-2 transition-all hover:text-lime-600" @click="submit" />
    <InputField
      class="flex-1 bg-white p-2 outline-gray-200"
      v-model="description"
      @keyup.enter="submit"
      placeholder="Add task..."
    ></InputField>
  </div>
</template>
