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
  <InputField class="bg-white p-2 outline-gray-200" v-model="description" @keyup.enter="submit" />
</template>
