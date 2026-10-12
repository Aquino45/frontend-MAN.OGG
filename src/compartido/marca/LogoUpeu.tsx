// Logo oficial de la UPeU, tal cual (sin redibujar, recolorear ni deformar): el azul sobre el tema
// claro y el blanco sobre el oscuro. Solo se muestra el que toca (el CSS esconde el otro).
import './marca.estilos.css'
import { TEXTOS_MARCA } from '@/config/constantes'
import upeuAzul from './recursos/upeu-horizontal-azul.svg'
import upeuBlanco from './recursos/upeu-horizontal-blanco.svg'

export function LogoUpeu() {
  return (
    <span className="logo-upeu">
      <img
        className="logo-upeu__imagen logo-upeu__imagen--claro"
        src={upeuAzul}
        alt={TEXTOS_MARCA.upeu}
      />
      <img
        className="logo-upeu__imagen logo-upeu__imagen--oscuro"
        src={upeuBlanco}
        alt={TEXTOS_MARCA.upeu}
      />
    </span>
  )
}
