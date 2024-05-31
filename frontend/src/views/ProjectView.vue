<script setup lang="ts">
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import {ref, watch} from "vue"
import {watchOnce} from "@vueuse/core"
import {getProjectInfo} from "@/api"

import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'


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


// Carousel
const carouselApi = ref<CarouselApi>()

function setApi(val: CarouselApi) {
  carouselApi.value = val
}

// Slider
const slider = ref<InstanceType<typeof VueSlider>>()
const selections = ref([0, 0])

watchOnce(projectInfo, (info) => {
  selections.value = [0, Number(info.frame_count)]
})

function addSelectionPoint(index: number) {
  selections.value.push(index)
  selections.value.push(index + 1)
  selections.value.sort((a, b) => a - b)
  slider.value?.setValue(selections.value)
}

watch(selections, (n, o)=> {
  const movedIndex = n.filter(x => !o.includes(x))[0]

  console.log(movedIndex)

  if ((movedIndex !== 0 && !movedIndex) || Number.isNaN(movedIndex)) return

  carouselApi.value?.scrollTo(movedIndex)
})

function rawValuesToSelectionArrays(values: Array<number>) {
  const selections = []

  for (let index = 0; index < values.length; index+=2) {
    selections.push([
      values[index],
      values[index + 1]
    ])
  }

  return selections
}

function frameIsInSelection(frameNumber: number) {
  const selectionArrays = rawValuesToSelectionArrays(selections.value)

  for (const array of selectionArrays) {
    if (array[0] <= frameNumber && frameNumber <= array[1] ) return true
  }

  return false
}
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
        <CarouselItem v-for="(_, index) in projectInfo.frame_count ?? 0" :key="index" :data-frame="index" class="pl-0 lg:basis-1/6 max-h-60">
          <img
              v-lazy="`/api/project/${projectName}/frame/${index}/thumbnail`"
              :alt="`frame ${index} of the '${projectName}' project`"
              class="h-full object-cover border-accent"
              :class="{ 'border-2' : frameIsInSelection(index),  'rounded-sm' : !frameIsInSelection(index) }"
              @click="addSelectionPoint(index)"
          />
        </CarouselItem>
      </CarouselContent>
    </Carousel>
    <vue-slider
        ref="slider"
        v-if="projectInfo.frame_count"
        v-model="selections"
        :max="Number(projectInfo.frame_count)"
        :enable-cross="false"
        :drag-on-click="true"
        :process-style="{background: 'hsl(var(--accent))'}"
        :tooltip-style="{background: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))'}"
        :process="rawValuesToSelectionArrays"
    ></vue-slider>
  </main>
</template>
