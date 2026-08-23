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
    <div class="residenz-header__inner">
      <RouterLink to="/" class="residenz-brand">
        {{ t('app.title') }}
        <small>{{ t('app.subtitle') }}</small>
      </RouterLink>

      <nav class="residenz-nav">
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
            v-tooltip.bottom="t('nav.admin')"
            :label="t('nav.admin')"
            icon="pi pi-cog"
            text
            class="residenz-nav__button"
            :aria-label="t('nav.admin')"
            @click="router.push({ name: 'admin' })"
          />
          <Button
            v-tooltip.bottom="t('nav.logout')"
            :label="t('nav.logout')"
            icon="pi pi-sign-out"
            text
            severity="secondary"
            class="residenz-nav__button"
            :aria-label="t('nav.logout')"
            @click="logout"
          />
        </template>
        <Button
          v-else
          v-tooltip.bottom="t('nav.login')"
          :label="t('nav.login')"
          icon="pi pi-user"
          text
          severity="secondary"
          class="residenz-nav__button"
          :aria-label="t('nav.login')"
          @click="router.push({ name: 'login' })"
        />
      </nav>
    </div>
  </header>
</template>
