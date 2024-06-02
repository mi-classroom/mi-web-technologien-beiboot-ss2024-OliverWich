<script setup lang="ts">
import {Carousel, type CarouselApi, CarouselContent, CarouselItem,} from '@/components/ui/carousel'
import {Separator} from '@/components/ui/separator'
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select'
import {capitalize, ref, watch} from "vue"
import {get, set, watchOnce} from "@vueuse/core"
import {exposeProject, getProjectInfo} from "@/api"

import VueSlider, {type ProcessProp} from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'
import {toTypedSchema} from "@vee-validate/zod"
import * as z from "zod"
import {useForm} from "vee-validate"
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Icon} from "@iconify/vue"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"


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

watch(selections, (n, o) => {
  const movedIndex = n.filter(x => !o.includes(x))[0]

  console.log(movedIndex)

  if ((movedIndex !== 0 && !movedIndex) || Number.isNaN(movedIndex)) return

  carouselApi.value?.scrollTo(movedIndex)
})

function rawValuesToSelectionArrays(values: Array<number>) {
  const selections = []

  for (let index = 0; index < values.length; index += 2) {
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
    if (array[0] <= frameNumber && frameNumber <= array[1]) return true
  }

  return false
}

// Render form
const renderModes = ref([
  'mean',
  'difference',
  'darken',
  'lighten',
  'overlay',
  'clear',
  'source',
  'over',
  'in',
  'out',
  'atop',
  'dest',
  'dest-over',
  'dest-in',
  'dest-out',
  'dest-atop',
  'xor',
  'add',
  'saturate',
  'multiply',
  'screen',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'exclusion',
])

const formSchema = toTypedSchema(z.object({
  mode: z.string().default('mean'),
  fps: z.number().min(1).max(30).default(30),
}))

const form = useForm({
  validationSchema: formSchema,
})

const loading = ref(false)
const buttonText = ref('Expose!')
const buttonIcon = ref('mdi:blur')
const outputImage = ref('')

const onSubmit = form.handleSubmit(async (values) => {
  set(buttonText, 'Exposing...')
  set(buttonIcon, 'mdi:loading')
  set(loading, true)

  const selectedSections = rawValuesToSelectionArrays(selections.value)

  const projectFPS = Number(get(projectInfo, 'fps') ?? 30)

  const requestBody = {
    mode: values.mode,
    fps: values.fps,
    slices: selectedSections.map(([start, end]) => ({start: start / projectFPS, end: end / projectFPS})),
  }

  console.log(requestBody)

  const exposedImageBlob = await exposeProject(props.projectName, requestBody).catch((e) => {
    console.error(e)
    set(buttonText, 'Error!')
    set(buttonIcon, 'mdi:alert')
    set(loading, false)
    throw e
  })

  set(outputImage, URL.createObjectURL(exposedImageBlob))

  set(buttonText, 'Done! Expose again?')
  set(buttonIcon, 'mdi:check')
  set(loading, false)
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
        <CarouselItem v-for="(_, index) in projectInfo.frame_count ?? 0" :key="index" :data-frame="index"
                      class="pl-0 lg:basis-1/6 max-h-60">
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
        :process="rawValuesToSelectionArrays as ProcessProp"
    ></vue-slider>

    <Separator class="my-4"/>
    <h2 class="mb-6 text-2xl font-bold">Exposure settings:</h2>

    <form @submit="onSubmit" class="flex flex-col justify-center align-mid">
      <FormField name="mode" v-slot="{ componentField }">
        <FormItem class="grid grid-cols-[1fr_2fr]">
          <FormLabel class="flex justify-center flex-col justify-start">
            <span>Blend mode</span>
            <FormDescription>
              The blend mode to use when exposing the project into one image.
            </FormDescription>
          </FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a verified email to display"/>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="mode in renderModes" :value="mode">
                  {{ capitalize(mode) }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage/>
        </FormItem>
      </FormField>
      <FormField name="fps" v-slot="{ componentField }">
        <FormItem class="grid grid-cols-[1fr_2fr]">
          <FormLabel class="flex justify-center flex-col justify-start">
            <span>FPS</span>
            <FormDescription>
              How many frames per second should be used when exposing the project.
            </FormDescription>
          </FormLabel>
          <Input v-bind="componentField" type="number"/>
          <FormMessage/>
        </FormItem>
      </FormField>
      <Button type="submit" class="mt-3" :disabled="loading">
        <Icon :icon="buttonIcon" class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading}"/>
        {{ buttonText }}
      </Button>
    </form>

    <template  v-if="outputImage">
      <div class="mt-6">
        <h2 class="mb-6 text-2xl font-bold">Output:</h2>
        <img :src="outputImage" alt="Exposed project image" class="w-full"/>
      </div>
    </template>
  </main>
</template>
