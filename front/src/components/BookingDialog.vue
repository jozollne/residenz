<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import DatePicker from 'primevue/datepicker'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useBookingStore } from '@/stores/BookingStore'
import { useRoomStore } from '@/stores/RoomStore'
import { reportError } from '@/api/client'
import type { OccupiedRange, Room } from '@/types'

const props = defineProps<{ visible: boolean; room: Room | null }>()
const emit = defineEmits<{ 'update:visible': [value: boolean] }>()

const { t, locale } = useI18n()
const toast = useToast()
const bookingStore = useBookingStore()
const roomStore = useRoomStore()

const DAY_MS = 24 * 60 * 60 * 1000

const dates = ref<Date[] | null>(null)
const occupied = ref<OccupiedRange[]>([])
const submitting = ref(false)
const errorMessage = ref<string | null>(null)
const isMobile = ref(false)

const mobileQuery = window.matchMedia('(max-width: 640px)')
const syncIsMobile = () => (isMobile.value = mobileQuery.matches)

onMounted(() => {
  syncIsMobile()
  mobileQuery.addEventListener('change', syncIsMobile)
})

onUnmounted(() => mobileQuery.removeEventListener('change', syncIsMobile))

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  vatId: '',
  billingAddress: '',
  message: '',
  acceptedAgbs: false,
})

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value),
})

/** Every night that is already taken; check-out days stay selectable. */
const disabledDates = computed<Date[]>(() => {
  const result: Date[] = []
  for (const range of occupied.value) {
    const start = new Date(range.startDate)
    const end = new Date(range.endDate)
    for (let d = new Date(start); d < end; d = new Date(d.getTime() + DAY_MS)) {
      result.push(new Date(d))
    }
  }
  return result
})

const nights = computed(() => {
  const [start, end] = dates.value ?? []
  if (!start || !end) return 0
  return Math.round((end.getTime() - start.getTime()) / DAY_MS)
})

const totalPrice = computed(() => {
  if (!props.room || nights.value <= 0) return 0
  return nights.value * Number(props.room.price)
})

const minStayViolated = computed(
  () => nights.value > 0 && !!props.room && nights.value < props.room.minStay,
)

const rangeOverlapsOccupied = computed(() => {
  const [start, end] = dates.value ?? []
  if (!start || !end) return false
  return occupied.value.some((range) => {
    const rangeStart = new Date(range.startDate)
    const rangeEnd = new Date(range.endDate)
    return start < rangeEnd && end > rangeStart
  })
})

const canSubmit = computed(
  () =>
    nights.value > 0 &&
    !minStayViolated.value &&
    !rangeOverlapsOccupied.value &&
    form.value.firstName.trim() !== '' &&
    form.value.lastName.trim() !== '' &&
    /\S+@\S+\.\S+/.test(form.value.email) &&
    form.value.billingAddress.trim() !== '' &&
    form.value.acceptedAgbs,
)

function toIsoDate(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

function reset() {
  dates.value = null
  errorMessage.value = null
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    vatId: '',
    billingAddress: '',
    message: '',
    acceptedAgbs: false,
  }
}

watch(
  () => props.room,
  async (room) => {
    reset()
    occupied.value = []
    if (!room) return
    try {
      occupied.value = await roomStore.fetchOccupied(room.id)
    } catch (error) {
      reportError({
        message: `Belegungsdaten konnten nicht geladen werden: ${(error as Error).message}`,
        component: 'BookingDialog',
      })
    }
  },
)

async function submit() {
  if (!props.room || !canSubmit.value) {
    errorMessage.value = t('booking.requiredFields')
    return
  }

  const [start, end] = dates.value as [Date, Date]
  submitting.value = true
  errorMessage.value = null

  try {
    await bookingStore.createBooking({
      roomId: props.room.id,
      startDate: toIsoDate(start),
      endDate: toIsoDate(end),
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      email: form.value.email.trim(),
      company: form.value.company.trim() || undefined,
      vatId: form.value.vatId.trim() || undefined,
      billingAddress: form.value.billingAddress.trim(),
      message: form.value.message.trim() || undefined,
      acceptedAgbs: form.value.acceptedAgbs,
    })

    toast.add({ severity: 'success', summary: t('booking.success'), life: 6000 })
    dialogVisible.value = false
    reset()
  } catch (error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } }).response
    const detail = response?.data?.message
    errorMessage.value = Array.isArray(detail) ? detail.join(', ') : (detail ?? t('booking.error'))
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :dismissable-mask="true"
    :style="{ width: '46rem' }"
    :breakpoints="{ '960px': '90vw', '640px': '96vw' }"
    :header="room ? t('booking.title', { room: room.name }) : ''"
  >
    <div v-if="room" class="flex flex-column gap-3">
      <div>
        <label class="block mb-2 font-medium">{{ t('booking.period') }} *</label>
        <DatePicker
          v-model="dates"
          selection-mode="range"
          :manual-input="false"
          :min-date="new Date()"
          :disabled-dates="disabledDates"
          :number-of-months="isMobile ? 1 : 2"
          :touch-u-i="isMobile"
          date-format="dd.mm.yy"
          show-icon
          fluid
          :locale="locale"
        />
        <small class="block mt-1" style="color: var(--residenz-moss)">
          {{ t('booking.periodHint') }}
        </small>
      </div>

      <Message v-if="minStayViolated" severity="warn" :closable="false">
        {{ t('booking.minStayError') }}
      </Message>

      <div v-if="nights > 0 && !minStayViolated" class="flex justify-content-between align-items-center px-3 py-2"
           style="background: var(--residenz-sand); border-radius: 10px">
        <span>{{ nights }} {{ t('booking.nights') }}</span>
        <strong>{{ t('booking.total') }}: {{ totalPrice.toFixed(2).replace('.', ',') }} &euro;</strong>
      </div>

      <div class="grid">
        <div class="col-12 md:col-6">
          <label class="block mb-2 font-medium">{{ t('booking.firstName') }} *</label>
          <InputText v-model="form.firstName" fluid maxlength="80" />
        </div>
        <div class="col-12 md:col-6">
          <label class="block mb-2 font-medium">{{ t('booking.lastName') }} *</label>
          <InputText v-model="form.lastName" fluid maxlength="80" />
        </div>
        <div class="col-12">
          <label class="block mb-2 font-medium">{{ t('booking.email') }} *</label>
          <InputText v-model="form.email" type="email" fluid maxlength="120" />
        </div>
        <div class="col-12 md:col-6">
          <label class="block mb-2 font-medium">{{ t('booking.company') }}</label>
          <InputText v-model="form.company" fluid maxlength="150" />
        </div>
        <div class="col-12 md:col-6">
          <label class="block mb-2 font-medium">{{ t('booking.vatId') }}</label>
          <InputText v-model="form.vatId" fluid maxlength="40" />
        </div>
        <div class="col-12">
          <label class="block mb-2 font-medium">{{ t('booking.billingAddress') }} *</label>
          <Textarea v-model="form.billingAddress" rows="2" fluid maxlength="300" auto-resize />
        </div>
        <div class="col-12">
          <label class="block mb-2 font-medium">{{ t('booking.message') }}</label>
          <Textarea v-model="form.message" rows="3" fluid maxlength="2000" auto-resize />
        </div>
      </div>

      <div class="flex align-items-start gap-2">
        <Checkbox v-model="form.acceptedAgbs" input-id="agbs" binary />
        <label for="agbs" class="text-sm line-height-3">{{ t('booking.acceptAgbs') }} *</label>
      </div>

      <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>
    </div>

    <template #footer>
      <Button :label="t('booking.cancel')" text severity="secondary" @click="dialogVisible = false" />
      <Button
        :label="t('booking.submit')"
        icon="pi pi-send"
        :disabled="!canSubmit"
        :loading="submitting"
        @click="submit"
      />
    </template>
  </Dialog>
</template>
