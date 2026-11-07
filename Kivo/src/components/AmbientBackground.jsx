import { lazy, Suspense, useEffect, useState } from 'react'

// Three.js va en su propio chunk y se carga cuando el navegador queda libre:
// el hero y los textos pintan primero.
const EscrowScene = lazy(() => import('./EscrowScene'))

/** Capa fija detrás de todo: aurora CSS (lejos) + escena de custodia (cerca). */
export default function AmbientBackground() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 1500 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(() => setReady(true), 400)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="amb-root" aria-hidden="true">
      <div className="amb-aurora" />
      {ready && (
        <Suspense fallback={null}>
          <EscrowScene />
        </Suspense>
      )}
      <div className="amb-vignette" />
    </div>
  )
}
