<script setup lang="ts">
import {Carousel, type CarouselApi, CarouselContent, CarouselItem,} from '@/components/ui/carousel'
import {Separator} from '@/components/ui/separator'
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select'
import {capitalize, ref, type VNode, type VueElement, watch, watchEffect} from "vue"
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
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"


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

const frameInterval = ref(1)

// Carousel
const carouselApi = ref<CarouselApi>()

function setApi(val: CarouselApi) {
  carouselApi.value = val
}

// Slider
const slider = ref<InstanceType<typeof VueSlider>>()
const selections = ref<Array<number>>([])
const activeFrame = ref<number>(0)

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

  scrollCarouselToFrameIndex(movedIndex)
})

watch(activeFrame, (n, o) => {
  if (n === o) return

  scrollCarouselToFrameIndex(n, false)
})

function scrollCarouselToFrameIndex(frameIndex: number, updateActiveFrame = true) {
  const newFrameIndex = convertRawFrameIndexToCarouselFrameIndex(frameIndex, get(frameInterval))

  if ((newFrameIndex !== 0 && !newFrameIndex) || Number.isNaN(newFrameIndex)) return

  if (updateActiveFrame) {
    set(activeFrame, frameIndex)
  }

  carouselApi.value?.scrollTo(newFrameIndex)
}

function convertRawFrameIndexToCarouselFrameIndex(frameIndex: number, frameInterval: number): number | null {
  // Check if the original index is one of the indices we care about, considering 1-based indexing
  if (frameIndex === 1 || (frameIndex - 1) % frameInterval === 0) {
    // Calculate the new index in the sequence of items we care about
    return Math.floor((frameIndex - 1) / frameInterval) + 1;
  } else {
    // If the original index is not in the sequence we care about, return null
    return null;
  }
}

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

function frameIndexToSeconds(frameIndex: number) {
  return (frameIndex / Number(get(projectInfo, 'fps'))).toFixed(3) + 's'
}

// Action buttons
const hoveredImageIndex = ref<number | null>(null)

function showActionButtonsForFrame(frameIndex: number) {
  set(hoveredImageIndex, frameIndex)
}

function hideActionButtonsForFrame(frameIndex: number) {
  set(hoveredImageIndex, null)
}

// Focus frames
const focusFrameIndexes = ref<Array<number>>([])

const toggleFocusForFrame = (frameIndex: number) => {
  if (focusFrameIndexes.value.includes(frameIndex)) {
    set(focusFrameIndexes, get(focusFrameIndexes).filter((index) => index !== frameIndex))
  } else {
    focusFrameIndexes.value.push(frameIndex)
  }
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
  focusOpacity: z.number().min(0).max(1).default(0.5),
  focusOverlayMode: z.string().default('mean'),
  focusBlendMode: z.string().default('mean'),
}))

const form = useForm({
  validationSchema: formSchema,
})

// Calculate frame interval based on the selected FPS
watchEffect(() => {
  if (!form.values?.fps) return

  const newFrameInterval = Number(get(projectInfo, 'fps')) / (form.values?.fps ?? Number(get(projectInfo, 'fps')))

  if (!newFrameInterval || !Number.isFinite(newFrameInterval)) return

  set(frameInterval, newFrameInterval)
  get(carouselApi)?.reInit()
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

  if (get(focusFrameIndexes).length > 0) {
    requestBody.focus = {
      opacity: values.focusOpacity,
      mode: values.focusOverlayMode,
      blend: values.focusBlendMode,
      frameTimestamps: get(focusFrameIndexes).map((index) => index / projectFPS),
    }
  }

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
    <vue-slider
        ref="scrubber"
        v-if="projectInfo.frame_count"
        v-model="activeFrame"
        :max="Number(projectInfo.frame_count)"
        :duration="0"
        :drag-on-click="true"
        :rail-style="{background: 'hsl(var(--secondary))'}"
        :tooltip-style="{background: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))'}"
        :tooltip-formatter="frameIndexToSeconds"
        :process="false"
    ></vue-slider>
    <Carousel
        class="w-full"
        :opts="{
          dragFree: true,
          align: 'start',
        }"
        @init-api="setApi"
    >
      <CarouselContent>
        <template v-for="(_, index) in projectInfo.frame_count ?? 0" :key="index">
          <CarouselItem
              v-if="index % frameInterval === 0"
              :data-frame="index"
              class="pl-0 lg:basis-1/6 max-h-60 relative"
              @mouseover="showActionButtonsForFrame(index)"
              @mouseleave="hideActionButtonsForFrame(index)"
          >
            <Transition>
              <span
                  v-if="hoveredImageIndex === index"
                  class="absolute top-0 left-0 z-10 p-2 w-full flex justify-between"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button class="bg-accent text-secondary" @click="addSelectionPoint(index)">
                        <Icon icon="mdi:content-cut" class="w-4 h-4 rotate-90"/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent class="bg-transparent bg-secondary">
                      <span class="text-secondary-foreground">Add Cut here</span>
                    </TooltipContent>
                  </Tooltip>

                   <Tooltip>
                    <TooltipTrigger>
                      <Button class="bg-accent text-secondary" @click="toggleFocusForFrame(index)">
                        <Icon icon="mdi:star" class="w-4 h-4" :class="{ 'text-gold': focusFrameIndexes.includes(index)}"/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent class="bg-transparent bg-secondary">
                      <span class="text-secondary-foreground">Add as focus frame</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
            </Transition>
            <img
                v-lazy="`/api/project/${projectName}/frame/${index}/thumbnail`"
                :alt="`frame ${index} of the '${projectName}' project`"
                class="h-full object-cover border-accent"
                :class="{ 'border-2' : frameIsInSelection(index),  'rounded-sm' : !frameIsInSelection(index) }"
            />
            <Transition name="rotate">
              <Icon v-if="focusFrameIndexes.includes(index)" icon="mdi:star" class="absolute right-2 bottom-2 w-4 h-4 text-gold"/>
            </Transition>
          </CarouselItem>
        </template>
      </CarouselContent>
    </Carousel>
    <vue-slider
        ref="slider"
        v-if="projectInfo.frame_count"
        v-model="selections"
        :max="Number(projectInfo.frame_count)"
        :duration="0"
        :enable-cross="false"
        :drag-on-click="true"
        :rail-style="{background: 'hsl(var(--secondary))'}"
        :process-style="{background: 'hsl(var(--accent))'}"
        :tooltip-style="{background: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))'}"
        :tooltip-formatter="frameIndexToSeconds"
        :process="rawValuesToSelectionArrays as ProcessProp"
    ></vue-slider>

    <template v-if="focusFrameIndexes.length > 0">
      <Separator class="my-4"/>

      <h2 class="mb-6 text-2xl font-bold">Selected Focus Frames:</h2>

      <Carousel
          class="w-full"
          :opts="{
          dragFree: true,
          align: 'start',
        }"
      >
        <CarouselContent>
          <template v-for="(focusFrame) in focusFrameIndexes" :key="index">
            <CarouselItem
                class="pl-0 lg:basis-1/6 max-h-60 relative"
                :data-frame="focusFrame"
            >
              <span class="absolute top-0 left-0 z-10 p-2 w-full flex justify-between">
                <TooltipProvider>
                   <Tooltip>
                    <TooltipTrigger>
                      <Button class="bg-accent text-secondary" @click="toggleFocusForFrame(focusFrame)">
                        <Icon icon="mdi:delete-outline" class="w-4 h-4 text-destructive"/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent class="bg-transparent bg-secondary">
                      <span class="text-secondary-foreground">Remove from focus frames</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <img
                  :src="`/api/project/${projectName}/frame/${focusFrame}/thumbnail`"
                  :alt="`frame ${focusFrame} of the '${projectName}' project`"
                  class="h-full object-cover border-accent rounded-sm"
              />
            </CarouselItem>
          </template>
        </CarouselContent>
      </Carousel>

    </template>

    <Separator class="my-4"/>
    <h2 class="mb-6 text-2xl font-bold">Settings:</h2>

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
                <SelectValue placeholder="Select a blend mode to use"/>
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

      <FormField name="focusOpacity" v-slot="{ componentField }">
        <FormItem class="grid grid-cols-[1fr_2fr]">
          <FormLabel class="flex justify-center flex-col justify-start">
            <span>Focus opacity</span>
            <FormDescription>
              The opacity of the focus frames when they are overlayed on the exposed image.
            </FormDescription>
          </FormLabel>
          <Input v-bind="componentField" type="number" step=".01"/>
          <FormMessage/>
        </FormItem>
      </FormField>

      <FormField name="focusOverlayMode" v-slot="{ componentField }">
        <FormItem class="grid grid-cols-[1fr_2fr]">
          <FormLabel class="flex justify-center flex-col justify-start">
            <span>Focus overlay mode</span>
            <FormDescription>
              The blend mode to use when overlaying the focus frames on the exposed image.
            </FormDescription>
          </FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a blend mode to use"/>
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

      <FormField name="focusBlendMode" v-slot="{ componentField }">
        <FormItem class="grid grid-cols-[1fr_2fr]">
          <FormLabel class="flex justify-center flex-col justify-start">
            <span>Focus blend mode</span>
            <FormDescription>
              The blend mode to use when blending the focus frames together.
            </FormDescription>
          </FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a blend mode to use"/>
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

      <Button type="submit" class="mt-3" :disabled="loading">
        <Icon :icon="buttonIcon" class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading}"/>
        {{ buttonText }}
      </Button>
    </form>

    <template v-if="outputImage">
      <div class="mt-6">
        <h2 class="mb-6 text-2xl font-bold">Output:</h2>
        <img :src="outputImage" alt="Exposed project image" class="w-full"/>
      </div>
    </template>
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

/* This is the animation for the star icon when marking a frame as focussed */
@keyframes rotate {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-180deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.rotate-enter-active {
  animation: rotate 0.2s;
}

.rotate-leave-active {
  animation: rotate 0.2s reverse;
}
</style>
