import axios from 'axios'

// Dev goes through the Vite proxy, production through the Apache reverse proxy.
export const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : 'https://residenz-andreew.zollneck.de/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('residenz_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** Fire-and-forget error reporting to the backend, which forwards to Graylog. */
export function reportError(payload: {
  message: string
  stack?: string
  component?: string
  url?: string
  level?: 'error' | 'warn' | 'info' | 'debug'
  meta?: Record<string, unknown>
}): void {
  void axios
    .post(`${API_BASE_URL}/logs`, {
      level: payload.level ?? 'error',
      message: payload.message.slice(0, 2000),
      stack: payload.stack?.slice(0, 8000),
      component: payload.component,
      url: payload.url ?? window.location.pathname,
      meta: payload.meta,
    })
    .catch(() => undefined)
}
