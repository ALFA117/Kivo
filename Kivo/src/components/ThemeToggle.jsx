import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

const KEY = 'kivo-theme'
const LABELS = {
  es: ['Cambiar a modo claro', 'Cambiar a modo oscuro'],
  en: ['Switch to light mode', 'Switch to dark mode'],
  pt: ['Mudar para modo claro', 'Mudar para modo escuro'],
}

/** Noche ↔ día. Sin elección guardada sigue al sistema (script en index.html). */
export default function ThemeToggle() {
  const { lang } = useLanguage()
  const [theme, setTheme] = useState('dark')
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
  }, [])

  const flip = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try { localStorage.setItem(KEY, next) } catch { /* modo privado */ }
    setTheme(next)
  }

  const [toLight, toDark] = LABELS[lang] || LABELS.es
  const label = theme === 'dark' ? toLight : toDark

  return (
    <button type="button" className="btn-theme" onClick={flip} aria-label={label} title={label}>
      {theme === 'dark' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" /></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      )}
    </button>
  )
}
