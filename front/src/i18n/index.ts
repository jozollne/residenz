import { createI18n } from 'vue-i18n'
import de from './de'
import en from './en'

export type AppLocale = 'de' | 'en'

const stored = localStorage.getItem('residenz_locale') as AppLocale | null

export const i18n = createI18n({
  legacy: false,
  locale: stored ?? 'de',
  fallbackLocale: 'de',
  messages: { de, en },
})

export function setLocale(locale: AppLocale): void {
  i18n.global.locale.value = locale
  localStorage.setItem('residenz_locale', locale)
  document.documentElement.setAttribute('lang', locale)
}
