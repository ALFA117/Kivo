import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LanguageProvider, useLanguage } from './LanguageContext'

function LangDisplay() {
  const { lang, setLang, t } = useLanguage()
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="hero-title">{t.hero.title1}</span>
      <button onClick={() => setLang('en')}>EN</button>
      <button onClick={() => setLang('pt')}>PT</button>
    </div>
  )
}

describe('LanguageContext', () => {
  it('defaults to Spanish', () => {
    render(<LanguageProvider><LangDisplay /></LanguageProvider>)
    expect(screen.getByTestId('lang').textContent).toBe('es')
  })

  it('provides Spanish translations by default', () => {
    render(<LanguageProvider><LangDisplay /></LanguageProvider>)
    expect(screen.getByTestId('hero-title').textContent).toBeTruthy()
  })

  it('switches language when setLang is called', () => {
    render(<LanguageProvider><LangDisplay /></LanguageProvider>)
    fireEvent.click(screen.getByText('EN'))
    expect(screen.getByTestId('lang').textContent).toBe('en')
  })

  it('switches to Portuguese', () => {
    render(<LanguageProvider><LangDisplay /></LanguageProvider>)
    fireEvent.click(screen.getByText('PT'))
    expect(screen.getByTestId('lang').textContent).toBe('pt')
  })
})
