<script setup lang="ts">
import {deleteProject, getProjects} from '@/api'
import {ref} from "vue"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Icon} from '@iconify/vue'
import {useToast} from '@/components/ui/toast/use-toast'
import {Toaster} from '@/components/ui/toast'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {Button} from "@/components/ui/button"
import {set} from "@vueuse/core"

const projects = ref<Array<string>>([])

getProjects().then((data) => {
  projects.value = data as Array<string>
})

const { toast } = useToast()
const removingProject = ref(false)
async function removeProject(event: Event, project: string) {
  console.log('Removing project', project)

  event.preventDefault()
  set(removingProject, true)

  try {
    await deleteProject(project)
  } catch (e) {
    toast({
      title: 'Failed to delete project',
      description: 'An error occurred while deleting the project',
      variant: 'destructive'
    })
    console.error(`Failed to delete project ${project}`, e)
    set(removingProject, false)
    return
  }

  const index = projects.value.indexOf(project)
  if (index > -1) {
    projects.value.splice(index, 1)
  }

  toast({
    title: 'Project deleted',
    description: `The project ${project} has been deleted`,
  })
  console.log('Project removed', project)

  set(removingProject, false)
}

const hoveredProject = ref<string | null>(null)

function showActionButtonsForProject(project: string) {
  set(hoveredProject, project)
}

function hideActionButtonsForProject() {
  set(hoveredProject, null)
}

</script>

<template>
  <main id="dashboard">
    <h1 class="mb-6 text-5xl font-bold">All Projects:</h1>
    <div class="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
      <router-link v-for="project in projects" :to="!removingProject ? 'project/' + project : ''">
        <Card class="w-[300px] cursor-pointer relative"
              @mouseover="showActionButtonsForProject(project)"
              @mouseleave="hideActionButtonsForProject()"
        >
          <CardHeader>
            <CardTitle>{{ project }}</CardTitle>
          </CardHeader>
          <CardContent>
            <img :src="`/api/project/${project}/thumbnail`" :alt="`Thumbnail of project ${project}`"/>
          </CardContent>
          <Transition>
              <span v-if="hoveredProject === project" class="absolute top-0 right-0 z-10 p-2">
                <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button class="bg-destructive text-primary hover:text-destructive" @click="removeProject($event,project)" :disabled="removingProject">
                      <Icon :icon="!removingProject ? 'mdi:trash-can-outline' : 'mdi:loading'" class="w-4 h-4" :class="{'animate-spin': removingProject}"/>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent class="bg-transparent bg-secondary">
                    <span class="text-secondary-foreground">Delete project</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              </span>
          </Transition>
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
    <Toaster/>
  </main>
</template>

<style scoped>
/* For the fade in of the action buttons Transition */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
