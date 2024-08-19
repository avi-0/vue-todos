<script setup lang="ts">
import { type TasksStore, type Task, taskCompleted, taskCooldown } from '@/tasks'
import { useFocusWithin, useNow, useTimeAgo } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { inject } from 'vue'

const props = defineProps<{
  task: Task
}>()

const api = inject<TasksStore>('tasksstore')!

const el = ref<HTMLElement>()
const { focused } = useFocusWithin(el)

const now = useNow()
const repeatsIn = computed(() =>
  useTimeAgo(new Date(props.task.lastCompleted.getTime() + taskCooldown(props.task) * 1000), {
    showSecond: true,
    updateInterval: 1000
  })
)

const toggle = () => {
  const lastCompleted = taskCompleted(props.task, now.value) ? new Date(0) : new Date()

  api.update({
    ...props.task,
    completed: !props.task.completed && !props.task.repeatEnabled,
    lastCompleted: lastCompleted || props.task.lastCompleted
  })
  el.value!.blur()
}

const toggleRepeatable = () => {
  api.update({ ...props.task, repeatEnabled: !props.task.repeatEnabled })
}

const delete_ = () => {
  api.delete(props.task)
}

const description = ref('')
watch(
  () => props.task.description,
  () => {
    description.value = props.task.description
  },
  { immediate: true }
)

const onDescriptionChanged = (e: Event) => {
  api.update({ ...props.task, description: (e.target as HTMLInputElement).value })
}

const cooldown = computed(() => taskCooldown(props.task))

const onCooldownChanged = (e: Event) => {
  api.update({
    ...props.task,
    cooldownSeconds: Number((e.target as HTMLInputElement).value) * 86400
  })
}

const completed = computed(() => taskCompleted(props.task, now.value))
</script>

<template>
  <div
    ref="el"
    class="flex select-none flex-col gap-2 rounded-md border p-2 shadow-sm transition-all has-[:focus]:shadow-md"
    tabindex="0"
    :class="{
      'border-lime-300 bg-lime-100 outline-lime-300': completed,
      'border-gray-200 bg-white outline-gray-200': !completed
    }"
  >
    <div class="flex items-center gap-2 outline-inherit">
      <i
        class="bi icon transition-all hover:text-lime-600"
        :class="{ 'bi-square': !completed, 'bi-check-square': completed }"
        @click="toggle"
        @mousedown.prevent
      ></i>
      <input
        class="flex-1 rounded-md bg-inherit p-1 outline outline-1 outline-inherit transition-all focus:outline-lime-400"
        :class="{ 'line-through': completed }"
        v-model="description"
        @change="onDescriptionChanged"
      />
      <i class="bi icon bi-hourglass-bottom" v-if="props.task.repeatEnabled && !completed"></i>
      <template v-if="props.task.repeatEnabled && completed">
        {{ repeatsIn }}
        <i class="bi icon bi-hourglass-split"></i>
      </template>
    </div>

    <template v-if="focused">
      <div class="flex gap-2 outline-inherit">
        <i
          class="bi icon transition-all hover:text-lime-600"
          :class="{
            'bi-hourglass text-gray-400': !props.task.repeatEnabled,
            'bi-hourglass-split': props.task.repeatEnabled
          }"
          @click="toggleRepeatable"
        ></i>
        <div v-if="props.task.repeatEnabled" class="flex gap-2 outline-inherit">
          Repeats after
          <input
            :disabled="!props.task.repeatEnabled"
            type="number"
            class="w-12 rounded-md border-inherit bg-inherit px-1 text-right outline outline-1 outline-inherit transition-all focus:outline-lime-400"
            :value="Math.round(cooldown / 86400)"
            @input="onCooldownChanged"
          />
          days
        </div>
        <div v-else class="text-gray-400">Does not repeat</div>
      </div>

      <div class="flex items-center gap-2">
        <i class="bi bi-trash icon transition-all hover:text-red-600" @click="delete_"> </i>
        Delete
      </div>
    </template>
  </div>
</template>
