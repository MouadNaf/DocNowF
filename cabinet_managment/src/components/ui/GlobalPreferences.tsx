import { Languages, Moon, Sun } from 'lucide-react'
import { usePreferencesStore } from '@/store/preferences.store'

export function GlobalPreferences() {
  const { theme, language, toggleTheme, toggleLanguage } = usePreferencesStore()
  return (
    <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-xl border border-gray-200 bg-white/90 p-2 shadow-md backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
      <button
        onClick={toggleTheme}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800"
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <button
        onClick={toggleLanguage}
        className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800"
        title="Switch language"
      >
        <Languages size={14} />
        {language.toUpperCase()}
      </button>
    </div>
  )
}
