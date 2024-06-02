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
import {get, set} from "@vueuse/core"
import {useRouter} from "vue-router"

const loading = ref(false)
const buttonText = ref('Upload and create project')
const buttonIcon = ref('mdi:upload')
const projectCreated = ref(false)
const createdProjectName = ref('')

const router = useRouter()

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
  set(projectCreated, false)
  set(buttonText, `Create project by uploading "${file.name}"`)
  set(buttonIcon, 'mdi:upload')
}

const onSubmit = form.handleSubmit(async (values) => {
  if (get(projectCreated)) {
    await router.push({name: 'project', params: {projectName: get(createdProjectName)}})
    return
  }

  set(buttonText, 'Uploading File...')
  set(buttonIcon, 'mdi:loading')
  set(loading, true)

  const projectName = await createProject(values.file)
  set(createdProjectName, projectName)

  console.info(`Project created: ${projectName}`)

  set(buttonText, 'Running pre-processing...')
  await processProject(projectName)

  set(loading, false)
  set(projectCreated, true)
  set(buttonText, 'Project created! Go and start exposing!')
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
