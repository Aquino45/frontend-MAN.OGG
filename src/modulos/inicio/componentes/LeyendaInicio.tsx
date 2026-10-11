import { TEXTOS_INICIO } from '@/config/constantes'

// Leyenda del mapa de Inicio: relleno lleno = datos de campo; punteado = ejemplo y provisional.
export function LeyendaInicio() {
  return (
    <ul className="inicio-leyenda">
      <li className="inicio-leyenda__item">
        <span
          className="inicio-leyenda__muestra inicio-leyenda__muestra--campo"
          aria-hidden="true"
        />
        {TEXTOS_INICIO.leyendaCampo}
      </li>
      <li className="inicio-leyenda__item">
        <span
          className="inicio-leyenda__muestra inicio-leyenda__muestra--ejemplo"
          aria-hidden="true"
        />
        {TEXTOS_INICIO.leyendaEjemplo}
      </li>
    </ul>
  )
}
