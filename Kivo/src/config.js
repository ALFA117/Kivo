// Sin estas llaves el botón de Accesly abre un popup roto y crear/financiar custodias
// falla contra la API de Trustless Work. En ese caso la interfaz se presenta como demo.
export const LIVE_ESCROW = Boolean(
  import.meta.env.VITE_ACCESLY_APP_ID &&
  import.meta.env.VITE_TRUSTLESS_API_KEY &&
  import.meta.env.VITE_KIVO_PLATFORM_ADDRESS
)

export const REPO_URL = 'https://github.com/ALFA117/Kivo'
