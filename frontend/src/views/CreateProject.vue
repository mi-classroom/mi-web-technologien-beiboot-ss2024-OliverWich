<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import {useForm} from "vee-validate"

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {createProject, processProject} from "@/api"
import {ref} from "vue"
import {Icon} from "@iconify/vue"
import {set} from "@vueuse/core"

const formSchema = toTypedSchema(z.object({
  file: z.instanceof(File)
}))

const form = useForm({
  validationSchema: formSchema,
})

function handleFileSelect(value: FileList | null) {
  if (!value) {
    return
  }

  const file = value?.item(0)

  if (!file) {
    return
  }

  form.setFieldValue('file', file)

  console.info('File selected:', value)
}

const loading = ref(false)
const buttonText = ref('Upload and create project')
const buttonIcon = ref('mdi:upload')

const onSubmit = form.handleSubmit(async (values) => {
  set(buttonText, 'Uploading File...')
  set(buttonIcon, 'mdi:loading')
  set(loading, true)

  const projectName = await createProject(values.file)

  console.info(`Project created: ${projectName}`)

  set(buttonText, 'Running pre-processing...')
  await processProject(projectName)

  set(loading, false)
  set(buttonText, 'Project created!')
  set(buttonIcon, 'mdi:check')
})

</script>

<template>
  <main id="create">
    <h1 class="mb-6 text-5xl font-bold">Create new project:</h1>
    <form @submit="onSubmit" class="flex flex-col justify-center align-mid">
      <FormField name="file">
        <FormItem>
          <FormLabel>Video File</FormLabel>
          <FormControl>
            <Input type="file" @change="(event: Event) => handleFileSelect((event.target as HTMLInputElement).files)" />
          </FormControl>
          <FormDescription>
            This is the video file that will be used to create the project.
            <br />
            It's name will be used as the project name.
          </FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>
      <Button type="submit" class="mt-3" :disabled="loading">
        <Icon :icon="buttonIcon" class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading}" />
        {{ buttonText }}
      </Button>
    </form>
  </main>
</template>
