<script setup lang="ts">
const model = defineModel<string | number>()
const props = defineProps<{
  placeholder?: string
}>()
</script>
<template>
  <input
    class="rounded-md border-inherit bg-inherit px-2 outline outline-1 transition-all focus:outline-lime-400"
    v-model="model"
    :placeholder="props.placeholder"
  />
</template>
