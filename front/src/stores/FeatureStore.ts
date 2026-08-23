import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'
import type { Feature } from '@/types'

export const useFeatureStore = defineStore('features', () => {
  const features = ref<Feature[]>([])
  const loading = ref(false)

  async function fetchFeatures() {
    loading.value = true
    try {
      const { data } = await api.get<Feature[]>('/features')
      features.value = data
    } finally {
      loading.value = false
    }
  }

  async function createFeature(payload: Omit<Feature, 'id'>) {
    const { data } = await api.post<Feature>('/features', payload)
    return data
  }

  async function updateFeature(id: number, payload: Partial<Omit<Feature, 'id'>>) {
    const { data } = await api.patch<Feature>(`/features/${id}`, payload)
    return data
  }

  async function deleteFeature(id: number) {
    await api.delete(`/features/${id}`)
  }

  return { features, loading, fetchFeatures, createFeature, updateFeature, deleteFeature }
})
