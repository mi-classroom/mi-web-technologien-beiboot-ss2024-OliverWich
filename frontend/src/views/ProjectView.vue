<script setup lang="ts">
defineProps({
  name: String
})


</script>

<template>
  <main id="dashboard">
    <h1 class="mb-6 text-5xl font-bold">Project {{ name }}:</h1>
  </main>
</template>
