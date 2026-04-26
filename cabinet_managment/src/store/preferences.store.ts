import { create } from 'zustand'

type Theme = 'light' | 'dark'
type Language = 'fr' | 'en' | 'ar'

type PreferencesState = {
  theme: Theme
  language: Language
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
}

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem('app_theme', theme)
}

const applyLanguage = (language: Language) => {
  document.documentElement.lang = language
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  localStorage.setItem('app_language', language)
}

const savedTheme = (localStorage.getItem('app_theme') as Theme | null) ?? 'light'
const savedLanguage = (localStorage.getItem('app_language') as Language | null) ?? 'fr'
applyTheme(savedTheme)
applyLanguage(savedLanguage)

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  theme: savedTheme,
  language: savedLanguage,
  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    set({ theme: next })
  },
  setLanguage: (language) => {
    applyLanguage(language)
    set({ language })
  },
  toggleLanguage: () => {
    const current = get().language
    const next: Language = current === 'fr' ? 'en' : current === 'en' ? 'ar' : 'fr'
    applyLanguage(next)
    set({ language: next })
  },
}))
