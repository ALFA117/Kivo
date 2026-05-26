import { describe, it, expect } from 'vitest'
import { translations } from './translations'

const SUPPORTED_LANGS = ['es', 'en', 'pt']
const REQUIRED_SECTIONS = ['nav', 'hero', 'vision', 'problem']

describe('translations', () => {
  it('has all supported languages', () => {
    SUPPORTED_LANGS.forEach(lang => {
      expect(translations).toHaveProperty(lang)
    })
  })

  SUPPORTED_LANGS.forEach(lang => {
    describe(`${lang} translations`, () => {
      it('has all required sections', () => {
        REQUIRED_SECTIONS.forEach(section => {
          expect(translations[lang]).toHaveProperty(section)
        })
      })

      it('nav section has required keys', () => {
        const nav = translations[lang].nav
        expect(nav).toHaveProperty('ramp')
        expect(nav).toHaveProperty('myEscrows')
        expect(nav).toHaveProperty('connectFreighter')
        expect(nav).toHaveProperty('disconnectFreighter')
      })

      it('hero section has required keys', () => {
        const hero = translations[lang].hero
        expect(hero).toHaveProperty('title1')
        expect(hero).toHaveProperty('createEscrow')
        expect(hero.title1).toBeTruthy()
      })

      it('has no empty string values in nav', () => {
        Object.values(translations[lang].nav).forEach(val => {
          expect(typeof val).toBe('string')
          expect(val.length).toBeGreaterThan(0)
        })
      })
    })
  })
})
