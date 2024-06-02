<script setup lang="ts">
import {RouterView} from 'vue-router'
import {Icon} from '@iconify/vue'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

</script>

<template>
  <RouterView/>
  <nav class="absolute h-full flex flex-col justify-between pl-2 pt-2 pb-2 left-0" v-if="route.name !== 'home'">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger @click="router.go(-1)" class="z-auto float-left p-2 rounded-full border border-secondary-foreground bg-secondary">
          <Icon icon="bi:arrow-left" class="text-xl"/>
        </TooltipTrigger>
        <TooltipContent class="bg-transparent bg-secondary">
          <p class="text-secondary-foreground">Navigate back</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger @click="router.push({name: 'home'})" class="z-auto float-bottom p-2 rounded-full border border-secondary-foreground bg-secondary">
          <Icon icon="mdi:home" class="text-xl"/>
        </TooltipTrigger>
        <TooltipContent class="bg-transparent bg-secondary">
          <p class="text-secondary-foreground">Go Home</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </nav>
</template>

<style>

body {
  min-height: 100vh;
  transition: color 0.5s,
  background-color 0.5s;
  line-height: 1.6;
  font-family: Inter,
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  Roboto,
  Oxygen,
  Ubuntu,
  Cantarell,
  'Fira Sans',
  'Droid Sans',
  'Helvetica Neue',
  sans-serif;
  font-size: 15px;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex;
  place-items: center;
  place-content: center;
}
</style>
