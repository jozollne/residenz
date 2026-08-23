import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'
import type { OccupiedRange, Room } from '@/types'

export const useRoomStore = defineStore('rooms', () => {
  const rooms = ref<Room[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchRooms(onlyActive = true) {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get<Room[]>('/rooms', { params: { onlyActive } })
      rooms.value = data
    } catch (e) {
      error.value = (e as Error).message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchOccupied(roomId: number): Promise<OccupiedRange[]> {
    const { data } = await api.get<OccupiedRange[]>(`/bookings/availability/${roomId}`)
    return data
  }

  async function createRoom(payload: Partial<Room> & { featureIds?: number[] }) {
    const { data } = await api.post<Room>('/rooms', payload)
    return data
  }

  async function updateRoom(id: number, payload: Partial<Room> & { featureIds?: number[] }) {
    const { data } = await api.patch<Room>(`/rooms/${id}`, payload)
    return data
  }

  async function deleteRoom(id: number) {
    await api.delete(`/rooms/${id}`)
  }

  return { rooms, loading, error, fetchRooms, fetchOccupied, createRoom, updateRoom, deleteRoom }
})
