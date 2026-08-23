import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'
import type { Booking, BookingStatus } from '@/types'

export interface BookingPayload {
  roomId: number
  startDate: string
  endDate: string
  firstName: string
  lastName: string
  email: string
  company?: string
  vatId?: string
  billingAddress: string
  message?: string
  acceptedAgbs: boolean
}

export const useBookingStore = defineStore('bookings', () => {
  const bookings = ref<Booking[]>([])
  const loading = ref(false)

  async function fetchBookings() {
    loading.value = true
    try {
      const { data } = await api.get<Booking[]>('/bookings')
      bookings.value = data
    } finally {
      loading.value = false
    }
  }

  async function createBooking(payload: BookingPayload) {
    const { data } = await api.post<Booking>('/bookings', payload)
    return data
  }

  async function updateStatus(id: number, status: BookingStatus) {
    const { data } = await api.patch<Booking>(`/bookings/${id}`, { status })
    return data
  }

  async function deleteBooking(id: number) {
    await api.delete(`/bookings/${id}`)
  }

  return { bookings, loading, fetchBookings, createBooking, updateStatus, deleteBooking }
})
