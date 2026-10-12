// Leyenda de los gráficos: campo = relleno liso, ejemplo = rayado (no se distinguen solo por color).
import { TEXTOS_CIFRAS } from '@/config/constantes'

export function LeyendaCampoEjemplo() {
  return (
    <ul className="cifras-leyenda" aria-hidden="true">
      <li className="cifras-leyenda__item">
        <span className="cifras-leyenda__muestra cifras-leyenda__muestra--campo" />
        {TEXTOS_CIFRAS.campo}
      </li>
      <li className="cifras-leyenda__item">
        <span className="cifras-leyenda__muestra cifras-leyenda__muestra--ejemplo" />
        {TEXTOS_CIFRAS.ejemplo}
      </li>
    </ul>
  )
}
