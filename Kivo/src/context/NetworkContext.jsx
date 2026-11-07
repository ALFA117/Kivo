import { createContext, useContext, useState } from 'react'

const NetworkContext = createContext(null)

// Mainnet mueve USDC real. Kivo se presenta como demo en testnet, así que el
// cambio de red solo existe si el despliegue lo habilita explícitamente con
// VITE_ENABLE_MAINNET=true; sin esa variable la app se queda en testnet.
const MAINNET_ENABLED = import.meta.env.VITE_ENABLE_MAINNET === 'true'

export function NetworkProvider({ children, mainnetEnabled = MAINNET_ENABLED }) {
  const [network, setNetwork] = useState('testnet')
  const toggleNetwork = () => {
    if (!mainnetEnabled) return
    setNetwork(n => n === 'testnet' ? 'mainnet' : 'testnet')
  }

  return (
    <NetworkContext.Provider value={{ network, toggleNetwork, mainnetEnabled }}>
      {children}
    </NetworkContext.Provider>
  )
}

export const useNetwork = () => useContext(NetworkContext)
