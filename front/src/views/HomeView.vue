<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import RoomList from '@/components/RoomList.vue'

const { t } = useI18n()

function scrollToRooms() {
  document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div>
    <section class="residenz-hero">
      <div class="mx-auto">
        <h1>{{ t('hero.headline') }}</h1>
        <p>{{ t('hero.text') }}</p>
        <Button :label="t('hero.cta')" icon="pi pi-arrow-down" size="large" @click="scrollToRooms" />
      </div>
    </section>

    <RoomList />
  </div>
</template>
