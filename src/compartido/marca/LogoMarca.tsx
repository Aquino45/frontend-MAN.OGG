// Logo del producto: el símbolo y el wordmark («CENSO» en mayúsculas espaciadas sobre «Arbóreo»
// grande, ambos en Bricolage). La co-marca de la UPeU va aparte (LogoUpeu) y la compone quien lo usa.
import './marca.estilos.css'
import { TEXTOS_MARCA } from '@/config/constantes'
import { SimboloLogo } from './SimboloLogo'

export function Wordmark() {
  return (
    <span className="wordmark">
      <span className="wordmark__censo">{TEXTOS_MARCA.censo}</span>
      <span className="wordmark__arboreo">{TEXTOS_MARCA.arboreo}</span>
    </span>
  )
}

export function LogoNuestro() {
  return (
    <span className="logo-nuestro">
      <SimboloLogo />
      <Wordmark />
    </span>
  )
}
