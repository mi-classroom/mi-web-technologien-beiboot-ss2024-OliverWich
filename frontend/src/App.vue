<script setup lang="ts">
import {RouterView} from 'vue-router'
import {Icon} from '@iconify/vue'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

</script>

<template>
  <nav class="absolute w-screen z-auto" v-if="route.name !== 'home'">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger @click="router.go(-1)" class="float-left ml-2 p-2 rounded-full border border-accent-foreground bg-accent">
          <Icon icon="bi:arrow-left" class="text-xl"/>
        </TooltipTrigger>
        <TooltipContent class="bg-transparent bg-accent">
          <p class="text-accent-foreground">Navigate back</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger @click="router.go(1)" class="float-right mr-2 p-2 rounded-full border border-accent-foreground bg-accent">
          <Icon icon="bi:arrow-right" class="text-xl"/>
        </TooltipTrigger>
        <TooltipContent class="bg-transparent bg-accent">
          <p class="text-accent-foreground">Navigate forward</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </nav>
  <RouterView/>
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
