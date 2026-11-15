import { useEffect, useState } from 'react'
import { NetworkProvider } from './context/NetworkContext'
import { TrustlessWorkProvider } from './provider/TrustlessWorkProvider'
import { AcceslyProvider } from 'accesly'
import { WalletProvider } from './context/WalletContext'
import { LanguageProvider } from './context/LanguageContext'
import App from './App.jsx'
import { BuyPage } from './pages/BuyPage.jsx'

// Si la URL contiene el parámetro "seller", renderizamos la página de compra
const isBuyPage = new URLSearchParams(window.location.search).has('seller')

// El tema de Accesly sigue al de Kivo (data-theme en <html>, lo cambia ThemeToggle).
function readTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export default function Root() {
  const [theme, setTheme] = useState(readTheme)
  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(readTheme()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  return (
    <NetworkProvider>
      <TrustlessWorkProvider>
        <AcceslyProvider
          appId={import.meta.env.VITE_ACCESLY_APP_ID}
          network="testnet"
          theme={theme}
        >
          {/* WalletProvider debe estar dentro de AcceslyProvider para usar useAccesly */}
          <WalletProvider>
            <LanguageProvider>
              {isBuyPage ? <BuyPage /> : <App />}
            </LanguageProvider>
          </WalletProvider>
        </AcceslyProvider>
      </TrustlessWorkProvider>
    </NetworkProvider>
  )
}
