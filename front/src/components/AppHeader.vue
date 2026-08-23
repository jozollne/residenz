<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import { setLocale, type AppLocale } from '@/i18n'
import { useAuthStore } from '@/stores/AuthStore'

const { t, locale } = useI18n()
const auth = useAuthStore()
const router = useRouter()

const localeOptions = [
  { label: 'DE', value: 'de' },
  { label: 'EN', value: 'en' },
]

const currentLocale = computed({
  get: () => locale.value as AppLocale,
  set: (value: AppLocale) => value && setLocale(value),
})

const isAdmin = computed(() => auth.roles.includes('admin'))

function logout() {
  auth.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <header class="residenz-header">
    <div class="flex align-items-center justify-content-between gap-3 px-3 py-2 mx-auto"
         style="max-width: 1180px">
      <RouterLink to="/" class="residenz-brand">
        {{ t('app.title') }}
        <small>{{ t('app.subtitle') }}</small>
      </RouterLink>

      <nav class="flex align-items-center gap-2">
        <SelectButton
          v-model="currentLocale"
          :options="localeOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          size="small"
          aria-label="Language"
        />

        <template v-if="auth.token">
          <Button
            v-if="isAdmin"
            :label="t('nav.admin')"
            icon="pi pi-cog"
            text
            @click="router.push({ name: 'admin' })"
          />
          <Button :label="t('nav.logout')" icon="pi pi-sign-out" text severity="secondary" @click="logout" />
        </template>
        <Button
          v-else
          :label="t('nav.login')"
          icon="pi pi-user"
          text
          severity="secondary"
          @click="router.push({ name: 'login' })"
        />
      </nav>
    </div>
  </header>
</template>
