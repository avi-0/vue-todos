<script setup lang="ts">
const model = defineModel<string | number>()
</script>
<template>
  <input
    class="rounded-md border-inherit bg-inherit px-2 outline outline-1 outline-inherit transition-all focus:outline-lime-400"
    v-model="model"
  />
</template>
