<script setup lang="ts">
import {getProjects} from '@/api'
import {ref} from "vue"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Icon} from '@iconify/vue'

const projects = ref<Array<string>>([])

getProjects().then((data) => {
  projects.value = data as Array<string>
})
</script>

<template>
  <main id="dashboard">
    <h1 class="mb-6 text-5xl font-bold">All Projects:</h1>
    <div class="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
      <router-link v-for="project in projects" :to="'project/' + project">
        <Card class="w-[300px] cursor-pointer">
          <CardHeader>
            <CardTitle>{{ project }}</CardTitle>
          </CardHeader>
          <CardContent>
            <img :src="`/api/project/${project}/thumbnail`" :alt="`Thumbnail of project ${project}`"/>
          </CardContent>
        </Card>
      </router-link>
      <router-link to="/create">
        <Card class="border-dashed cursor-pointer">
          <CardHeader>
            <CardTitle class="text-center">Add a project</CardTitle>
          </CardHeader>
          <CardContent class="flex justify-center">
            <Icon icon="bi:plus-circle" class="text-3xl"/>
          </CardContent>
        </Card>
      </router-link>
    </div>
  </main>
</template>
