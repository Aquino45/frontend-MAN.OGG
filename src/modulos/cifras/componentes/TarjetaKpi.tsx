// Una tarjeta del resumen: su etiqueta, uno o dos valores grandes (campo y ejemplo, nunca sumados sin
// decirlo), una nota y un mini gráfico.
import type { ReactNode } from 'react'
import { TEXTOS_TABLERO } from '@/config/constantes'

export type OrigenDeLinea = 'campo' | 'ejemplo'

export interface LineaKpi {
  // Cuando la línea es de un origen, se escribe al lado del valor
  origen?: OrigenDeLinea
  valor: ReactNode
  detalle?: ReactNode
}

interface PropsTarjetaKpi {
  etiqueta: string
  // Muestra el sello «Simulado»
  simulado?: boolean
  lineas: readonly LineaKpi[]
  nota?: ReactNode
  mini?: ReactNode
  clase?: string
}

const TEXTO_ORIGEN: Record<OrigenDeLinea, string> = {
  campo: TEXTOS_TABLERO.kpis.campo,
  ejemplo: TEXTOS_TABLERO.kpis.ejemplo,
}

export function TarjetaKpi({ etiqueta, simulado, lineas, nota, mini, clase }: PropsTarjetaKpi) {
  return (
    <div className={`tablero-kpi${clase ? ` ${clase}` : ''}`} role="group" aria-label={etiqueta}>
      <p className="tablero-kpi__etiqueta">
        <span>{etiqueta}</span>
        {simulado && <span className="tablero-sello">{TEXTOS_TABLERO.kpis.simulado}</span>}
      </p>
      <div className="tablero-kpi__lineas">
        {lineas.map((linea, indice) => (
          <p key={indice} className="tablero-kpi__linea" data-origen={linea.origen}>
            <span className="tablero-kpi__valor">{linea.valor}</span>
            {linea.origen && <small>{TEXTO_ORIGEN[linea.origen]}</small>}
            {linea.detalle && <span className="tablero-kpi__detalle">{linea.detalle}</span>}
          </p>
        ))}
      </div>
      {nota && <p className="tablero-kpi__nota">{nota}</p>}
      {mini && <div className="tablero-kpi__mini">{mini}</div>}
    </div>
  )
}
