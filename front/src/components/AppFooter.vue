<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="residenz-footer">
    <p class="serif" style="font-size: 1.3rem; margin: 0 0 0.5rem">{{ t('app.title') }}</p>
    <p style="margin: 0">&copy; {{ year }} &middot; {{ t('footer.rights') }}</p>
  </footer>
</template>
