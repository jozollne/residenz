<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import RoomCard from '@/components/RoomCard.vue'
import BookingDialog from '@/components/BookingDialog.vue'
import { useRoomStore } from '@/stores/RoomStore'
import type { Room } from '@/types'

const { t } = useI18n()
const roomStore = useRoomStore()

const dialogVisible = ref(false)
const selectedRoom = ref<Room | null>(null)

onMounted(() => {
  roomStore.fetchRooms(true).catch(() => undefined)
})

function openBooking(room: Room) {
  selectedRoom.value = room
  dialogVisible.value = true
}
</script>

<template>
  <section id="rooms" class="section">
    <h2 class="section-title">{{ t('rooms.title') }}</h2>
    <p class="section-subtitle">{{ t('rooms.subtitle') }}</p>

    <div v-if="roomStore.loading" class="flex justify-content-center py-6">
      <ProgressSpinner style="width: 48px; height: 48px" />
    </div>

    <Message v-else-if="roomStore.error" severity="error">{{ t('common.error') }}</Message>

    <Message v-else-if="roomStore.rooms.length === 0" severity="info">
      {{ t('rooms.empty') }}
    </Message>

    <div v-else class="grid">
      <div v-for="room in roomStore.rooms" :key="room.id" class="col-12 md:col-6 lg:col-4 p-3">
        <RoomCard :room="room" @book="openBooking" />
      </div>
    </div>

    <BookingDialog v-model:visible="dialogVisible" :room="selectedRoom" />
  </section>
</template>
