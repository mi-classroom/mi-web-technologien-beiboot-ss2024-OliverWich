<script setup lang="ts">
import { getProjects } from '@/api'
import {ref} from "vue"

const projects = ref<Array<String>>([])

getProjects().then((data) => {
  console.log(data)
  projects.value = data as Array<String>
})
</script>

<template>
  <main id="dashboard">
    All Projects:<br>
    {{ projects }}<br>
    Choose one to go into project view.
    There you can see all frames, choose slices and fps and render.
    <br/>
    Ability to add Projects
  </main>
</template>
