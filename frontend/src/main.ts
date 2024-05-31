import './assets/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import VueLazyLoad from 'vue3-lazyload'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueLazyLoad, {
    lifecycle: {
        error: (img) => {
            console.error('Could not load image', img)
        }
    }})

app.mount('#app')
