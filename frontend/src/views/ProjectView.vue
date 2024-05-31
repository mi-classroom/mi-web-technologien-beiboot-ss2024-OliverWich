<script setup lang="ts">
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import {ref} from "vue"
import {watchOnce} from "@vueuse/core"
import {getProjectInfo} from "@/api"

const props = defineProps({
  projectName: {
    type: String,
    required: true,
  }
})

const projectInfo = ref<Record<string, string>>({})

getProjectInfo(props.projectName).then((data) => {
  projectInfo.value = data
})

const carouselApi = ref<CarouselApi>()
const currentlyFocussedSlide = ref(0)

function setApi(val: CarouselApi) {
  carouselApi.value = val
}

watchOnce(carouselApi, (api) => {
  if (!api)
    return

  currentlyFocussedSlide.value = api.selectedScrollSnap() + 1

  api.on('select', () => {
    currentlyFocussedSlide.value = api.selectedScrollSnap() + 1
    console.log(currentlyFocussedSlide.value)
  })
})
</script>

<template>
  <main id="project" class="w-full h-full p-16 relative">
    <h1 class="mb-6 text-5xl font-bold">Project <span class="italic underline">{{ projectName }}</span>:</h1>
    <Carousel
        class="w-full"
        :opts="{
          dragFree: true,
          align: 'start',
        }"
        @init-api="setApi"
    >
      <CarouselContent>
        <CarouselItem v-for="(_, index) in projectInfo.frame_count ?? 0" :key="index" class="pl-0 lg:basis-1/6 max-h-60">
          <img v-lazy="`/api/project/${projectName}/frame/${index}/thumbnail`" :alt="`frame ${index} of the '${projectName}' project`" class="w-full object-cover"/>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  </main>
</template>
