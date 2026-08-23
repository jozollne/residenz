import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'

import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import './assets/main.css'

import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { reportError } from './api/client'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.app-dark',
      cssLayer: { name: 'primevue', order: 'primeflex, primevue' },
    },
  },
})
app.use(ToastService)
app.use(ConfirmationService)
app.directive('tooltip', Tooltip)

app.config.errorHandler = (err, instance, info) => {
  const error = err as Error
  reportError({
    message: error?.message ?? String(err),
    stack: error?.stack,
    component: instance?.$options?.name ?? 'unknown',
    meta: { info },
  })
}

window.addEventListener('unhandledrejection', (event) => {
  reportError({
    message: `Unhandled rejection: ${event.reason?.message ?? String(event.reason)}`,
    stack: event.reason?.stack,
    component: 'window',
  })
})

app.mount('#app')
