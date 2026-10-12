// Co-marca completa: el logo del producto y el de la UPeU, con el área de resguardo de este último.
// Va en el pie y en Inicio. La regla del resguardo (la mitad del alto del logo por cada lado) es
// provisional: no se verificó con el manual de marca de la UPeU.
import './marca.estilos.css'
import { LogoNuestro } from './LogoMarca'
import { LogoUpeu } from './LogoUpeu'

export function CoMarca() {
  return (
    <div className="co-marca">
      <LogoNuestro />
      <span className="co-marca__separador" aria-hidden="true" />
      <span className="co-marca__resguardo">
        <LogoUpeu />
      </span>
    </div>
  )
}
