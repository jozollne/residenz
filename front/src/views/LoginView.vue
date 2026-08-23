<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useAuthStore } from '@/stores/AuthStore'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref<string | null>(null)

async function submit() {
  if (!username.value || !password.value) return
  loading.value = true
  errorMessage.value = null
  try {
    await auth.login(username.value, password.value)
    const redirect = (route.query.redirect as string) || '/admin'
    router.push(redirect)
  } catch {
    errorMessage.value = t('login.error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-shell">
    <Card style="width: 26rem; max-width: 95vw">
      <template #title>
        <span class="serif">{{ t('login.title') }}</span>
      </template>
      <template #subtitle>{{ t('login.subtitle') }}</template>
      <template #content>
        <form class="flex flex-column gap-3" @submit.prevent="submit">
          <div>
            <label class="block mb-2 font-medium">{{ t('login.username') }}</label>
            <InputText v-model="username" fluid autocomplete="username" />
          </div>
          <div>
            <label class="block mb-2 font-medium">{{ t('login.password') }}</label>
            <Password
              v-model="password"
              fluid
              toggle-mask
              :feedback="false"
              input-class="w-full"
              autocomplete="current-password"
            />
          </div>
          <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>
          <Button type="submit" :label="t('login.submit')" icon="pi pi-sign-in" :loading="loading" />
        </form>
      </template>
    </Card>
  </div>
</template>
