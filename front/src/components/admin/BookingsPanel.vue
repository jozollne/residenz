<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Select from 'primevue/select'
import { useBookingStore } from '@/stores/BookingStore'
import type { Booking, BookingStatus } from '@/types'

const { t } = useI18n()
const toast = useToast()
const confirm = useConfirm()
const bookingStore = useBookingStore()

const statusOptions: { label: string; value: BookingStatus }[] = [
  { label: t('status.pending'), value: 'pending' },
  { label: t('status.confirmed'), value: 'confirmed' },
  { label: t('status.cancelled'), value: 'cancelled' },
]

const severities: Record<string, 'warn' | 'success' | 'danger'> = {
  pending: 'warn',
  confirmed: 'success',
  cancelled: 'danger',
}

onMounted(() => bookingStore.fetchBookings())

function formatDate(value: string) {
  return new Date(value).toLocaleDateString()
}

async function changeStatus(booking: Booking, status: BookingStatus) {
  try {
    await bookingStore.updateStatus(booking.id, status)
    await bookingStore.fetchBookings()
    toast.add({ severity: 'success', summary: t('admin.saved'), life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: t('admin.saveError'), life: 4000 })
  }
}

function remove(booking: Booking) {
  confirm.require({
    message: t('admin.confirmDelete'),
    header: t('admin.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await bookingStore.deleteBooking(booking.id)
      await bookingStore.fetchBookings()
      toast.add({ severity: 'success', summary: t('admin.deleted'), life: 3000 })
    },
  })
}
</script>

<template>
  <DataTable
    :value="bookingStore.bookings"
    :loading="bookingStore.loading"
    paginator
    :rows="10"
    data-key="id"
    striped-rows
    responsive-layout="scroll"
  >
    <template #empty>{{ t('admin.noBookings') }}</template>

    <Column field="id" header="#" style="width: 4rem" />

    <Column :header="t('admin.guest')">
      <template #body="{ data }">
        <div class="font-medium">{{ data.firstName }} {{ data.lastName }}</div>
        <small>{{ data.email }}</small>
        <div v-if="data.company"><small>{{ data.company }}</small></div>
      </template>
    </Column>

    <Column :header="t('admin.room')">
      <template #body="{ data }">{{ data.room?.name ?? data.roomId }}</template>
    </Column>

    <Column :header="t('admin.period')">
      <template #body="{ data }">
        {{ formatDate(data.startDate) }} &ndash; {{ formatDate(data.endDate) }}
      </template>
    </Column>

    <Column :header="t('admin.status')" style="width: 12rem">
      <template #body="{ data }">
        <Tag :severity="severities[data.status]" :value="t('status.' + data.status)" />
      </template>
    </Column>

    <Column :header="t('admin.actions')" style="width: 16rem">
      <template #body="{ data }">
        <div class="flex align-items-center gap-2">
          <Select
            :model-value="data.status"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            size="small"
            @update:model-value="(value) => changeStatus(data, value)"
          />
          <Button icon="pi pi-trash" severity="danger" text rounded @click="remove(data)" />
        </div>
      </template>
    </Column>
  </DataTable>
</template>
