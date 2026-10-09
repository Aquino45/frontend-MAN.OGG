// Indicadores visuales de la cartilla: altura (barra), copa (elipse) y DAP (valor y nota).
import type { Arbol } from '@/api/cliente'
import { SinDato } from '@/compartido/SinDato'
import { ESCALA_ALTURA_MAX_M, MEDIDAS, TEXTOS_CARTILLA } from '@/config/constantes'
import { formatearMedida } from '@/lib/formatear'
import {
  COPA_LADO,
  COPA_RADIO_ANILLO,
  COPA_RADIO_CENTRO,
  COPA_RADIO_CERO,
  formaDeCopa,
} from '../lib/copa'

interface PropsIndicadores {
  arbol: Arbol
}

const PORCENTAJE_COMPLETO = 100
const CENTRO_COPA = COPA_LADO / 2

function IndicadorAltura({ alturaM }: { alturaM: number | null }) {
  const llenado =
    alturaM === null
      ? 0
      : Math.min(Math.max(alturaM / ESCALA_ALTURA_MAX_M, 0), 1) * PORCENTAJE_COMPLETO
  const texto = formatearMedida(alturaM, 'alturaM')
  return (
    <div className="tarjeta indicador-altura">
      <span className="tarjeta__etiqueta">{TEXTOS_CARTILLA.altura}</span>
      <span className="tarjeta__valor">{texto ?? <SinDato />}</span>
      <div className="indicador-altura__pista" aria-hidden="true">
        <div className="indicador-altura__relleno" style={{ inlineSize: `${llenado}%` }} />
      </div>
    </div>
  )
}

function IndicadorCopa({ nsM, eoM }: { nsM: number | null; eoM: number | null }) {
  const forma = formaDeCopa(nsM, eoM)
  const norteSur = formatearMedida(nsM, 'copaM')
  const esteOeste = formatearMedida(eoM, 'copaM')
  const cero = forma.tipo === 'cero'
  return (
    <div className="tarjeta indicador-copa">
      {forma.tipo !== 'sinDato' && (
        <svg
          className="indicador-copa__dibujo"
          viewBox={`0 0 ${COPA_LADO} ${COPA_LADO}`}
          aria-hidden="true"
          focusable="false"
        >
          <circle
            className="indicador-copa__anillo"
            cx={CENTRO_COPA}
            cy={CENTRO_COPA}
            r={COPA_RADIO_ANILLO}
          />
          {forma.tipo === 'elipse' && (
            <ellipse
              className="indicador-copa__elipse"
              cx={CENTRO_COPA}
              cy={CENTRO_COPA}
              rx={forma.radioX}
              ry={forma.radioY}
            />
          )}
          {cero && (
            <circle
              className="indicador-copa__cero"
              cx={CENTRO_COPA}
              cy={CENTRO_COPA}
              r={COPA_RADIO_CERO}
            />
          )}
          <circle
            className="indicador-copa__centro"
            cx={CENTRO_COPA}
            cy={CENTRO_COPA}
            r={COPA_RADIO_CENTRO}
          />
        </svg>
      )}
      <div className="indicador-copa__valores">
        <span className="tarjeta__etiqueta">{TEXTOS_CARTILLA.copa}</span>
        {forma.tipo === 'sinDato' ? (
          <SinDato />
        ) : cero ? (
          <span className="indicador-copa__valor">
            0 {MEDIDAS.copaM.unidad} {TEXTOS_CARTILLA.copaCero}
          </span>
        ) : (
          <>
            <span className="indicador-copa__valor">
              {TEXTOS_CARTILLA.copaNorteSur} {norteSur ?? <SinDato />}
            </span>
            <span className="indicador-copa__valor">
              {TEXTOS_CARTILLA.copaEsteOeste} {esteOeste ?? <SinDato />}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

function IndicadorDap({ dapCm }: { dapCm: number | null }) {
  const texto = formatearMedida(dapCm, 'dapCm')
  return (
    <div className="tarjeta indicador-dap">
      <div className="indicador-dap__dato">
        <span className="tarjeta__etiqueta">{TEXTOS_CARTILLA.dap}</span>
        <span className="tarjeta__valor">{texto ?? <SinDato />}</span>
      </div>
      <span className="indicador-dap__nota">{TEXTOS_CARTILLA.notaDap}</span>
    </div>
  )
}

export function IndicadoresArbol({ arbol }: PropsIndicadores) {
  return (
    <div className="indicadores-arbol">
      <IndicadorAltura alturaM={arbol.altura_total_m} />
      <IndicadorCopa nsM={arbol.copa_ns_m} eoM={arbol.copa_eo_m} />
      <IndicadorDap dapCm={arbol.dap_cm} />
    </div>
  )
}
