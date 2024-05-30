<script setup lang="ts">
import { getProjects } from '@/api'
import {ref} from "vue"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import { Icon } from '@iconify/vue';

const projects = ref<Array<String>>([])

getProjects().then((data) => {
  projects.value = data as Array<String>
})
</script>

<template>
  <main id="dashboard">
    <h1 class="mb-6 text-5xl font-bold">All Projects:</h1>
    <div class="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
      <Card v-for="project in projects" class="w-[300px]">
        <CardHeader>
          <CardTitle>{{ project }}</CardTitle>
        </CardHeader>
        <CardContent>
          Information about this project, possibly a preview image.
        </CardContent>
      </Card>
      <Card class="border-dashed cursor-pointer">
        <CardHeader>
          <CardTitle class="text-center">Add a project</CardTitle>
        </CardHeader>
        <CardContent class="flex justify-center">
          <Icon icon="bi:plus-circle" class="text-3xl" />
        </CardContent>
      </Card>
    </div>
  </main>
</template>
