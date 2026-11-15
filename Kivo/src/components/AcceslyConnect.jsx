import { ConnectButton } from 'accesly'
import { useLanguage } from '../context/LanguageContext'

/**
 * Envoltura del ConnectButton de Accesly. La librería pinta su botón con estilos
 * en línea (gradiente morado, halo y texto fijo en inglés); el contenedor permite
 * que App.css lo alinee con la paleta de Kivo y muestre la etiqueta traducida.
 */
export function AcceslyConnect({ block = false }) {
  const { t } = useLanguage()
  const label = t.demo?.accesly || 'Accesly'
  return (
    <span
      className={`accesly-slot${block ? ' accesly-slot--block' : ''}`}
      style={{ '--accesly-label': JSON.stringify(label) }}
      title={label}
    >
      <ConnectButton />
    </span>
  )
}
