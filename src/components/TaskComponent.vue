<script setup lang="ts">
import { type TasksStore, type Task, taskCompleted, taskCooldown } from '@/tasks'
import { useFocusWithin, useNow, useTimeAgo } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { inject } from 'vue'
import InputField from './InputField.vue'

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
    class="flex select-none flex-col gap-3 rounded-md border p-2 shadow-sm transition-all hover:shadow-md"
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
      <InputField
        class="flex-1 outline-inherit"
        :class="{ 'line-through': completed }"
        v-model="description"
        @change="onDescriptionChanged"
      />
      <i class="bi icon bi-hourglass-bottom" v-if="props.task.repeatEnabled && !completed"></i>
      <template v-if="props.task.repeatEnabled && completed">
        <div class="text-sm">
          {{ repeatsIn }}
        </div>
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
        <div v-if="props.task.repeatEnabled" class="flex items-baseline gap-2 outline-inherit">
          Repeats after
          <InputField
            :disabled="!props.task.repeatEnabled"
            type="number"
            class="w-12 text-right outline-inherit"
            :modelValue="Math.round(cooldown / 86400)"
            @change="onCooldownChanged"
          />
          days
        </div>
        <div v-else class="text-gray-400">Does not repeat</div>
        <div class="flex-1"></div>
        <i class="bi bi-trash icon transition-all hover:text-red-600" @click="delete_"> </i>
      </div>

      <div class="flex gap-2 outline-inherit">
        <i class="bi icon bi-snow hover transition-all hover:text-sky-600"></i>
      </div>
    </template>
  </div>
</template>
