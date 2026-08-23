import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('residenz_token'))
  const username = ref<string | null>(localStorage.getItem('residenz_username'))
  const roles = ref<string[]>(JSON.parse(localStorage.getItem('residenz_roles') || '[]'))

  function persist(newToken: string, newUsername: string, newRoles: string[]) {
    token.value = newToken
    username.value = newUsername
    roles.value = newRoles
    localStorage.setItem('residenz_token', newToken)
    localStorage.setItem('residenz_username', newUsername)
    localStorage.setItem('residenz_roles', JSON.stringify(newRoles))
  }

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password })
    persist(data.token, data.username, data.roles ?? [])
    return data
  }

  function logout() {
    token.value = null
    username.value = null
    roles.value = []
    localStorage.removeItem('residenz_token')
    localStorage.removeItem('residenz_username')
    localStorage.removeItem('residenz_roles')
  }

  async function checkToken(): Promise<boolean> {
    if (!token.value) return false
    try {
      await api.get('/auth/check-token')
      return true
    } catch {
      logout()
      return false
    }
  }

  return { token, username, roles, login, logout, checkToken }
})
