// Histograma del DAP: árboles por rango de diámetro, de campo abajo y de ejemplo (borde punteado)
// encima. Los rangos no cambian al filtrar; las barras crecen o se achican desde la base.
import { TEXTOS_TABLERO } from '@/config/tablero'
import { useAnchoMedido } from '../hooks/useAnchoMedido'
import { escalaLineal, marcasRedondas } from '../lib/escalas'
import {
  ALTO_HISTOGRAMA_PX,
  ANCHO_POR_DEFECTO_PX,
  BAJADA_NUMEROS_EJE_X_HISTOGRAMA_PX,
  MARCAS_EJE_Y,
  MARGEN_EJES,
  MARGEN_TITULO_EJE_X_HISTOGRAMA_PX,
} from '../lib/medidasGraficos'
import type { HistogramaDap } from '../lib/tableroGraficos'
import { TarjetaGrafico } from './TarjetaGrafico'

const SEPARACION_BARRAS_PX = 4
const entero = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 })

export function Histograma({ histograma }: { histograma: HistogramaDap }) {
  const textos = TEXTOS_TABLERO.histograma
  const [referencia, ancho] = useAnchoMedido<HTMLDivElement>(ANCHO_POR_DEFECTO_PX)
  const alto = ALTO_HISTOGRAMA_PX
  const { rangos } = histograma
  const maximo = Math.max(0, ...rangos.map((rango) => rango.campo + rango.ejemplo))
  const eje = marcasRedondas(maximo, MARCAS_EJE_Y, true)
  const base = alto - MARGEN_EJES.abajo
  const altoUtil = base - MARGEN_EJES.arriba
  const y = escalaLineal(0, eje.tope, base, MARGEN_EJES.arriba)
  const paso = (ancho - MARGEN_EJES.izquierda - MARGEN_EJES.derecha) / rangos.length
  const sinDapTexto =
    histograma.sinDap === 0
      ? null
      : histograma.sinDap === 1
        ? textos.sinDapUno
        : textos.sinDap.replace('{n}', String(histograma.sinDap))

  return (
    <TarjetaGrafico
      titulo={textos.titulo}
      descripcion={textos.descripcion}
      tabla={{
        grafico: textos.titulo,
        cabecera: [textos.columnaRango, textos.campo, textos.ejemplo],
        filas: rangos.map((rango) => [
          textos.rango
            .replace('{desde}', String(rango.desdeCm))
            .replace('{hasta}', String(rango.hastaCm)),
          String(rango.campo),
          String(rango.ejemplo),
        ]),
      }}
    >
      <div ref={referencia} className="tablero-grafico">
        <svg
          className="tablero-histograma"
          viewBox={`0 0 ${ancho} ${alto}`}
          width={ancho}
          height={alto}
          role="img"
          aria-label={textos.titulo}
        >
          {eje.marcas.map((marca) => (
            <g key={marca}>
              <line
                className="tablero-rejilla"
                x1={MARGEN_EJES.izquierda}
                x2={ancho - MARGEN_EJES.derecha}
                y1={y(marca)}
                y2={y(marca)}
              />
              <text
                className="tablero-eje tablero-eje--fin"
                x={MARGEN_EJES.izquierda - 6}
                y={y(marca) + 4}
              >
                {entero.format(marca)}
              </text>
            </g>
          ))}
          {rangos.map((rango, indice) => {
            const x = MARGEN_EJES.izquierda + indice * paso + SEPARACION_BARRAS_PX / 2
            const ancha = Math.max(1, paso - SEPARACION_BARRAS_PX)
            const fraccionCampo = eje.tope > 0 ? rango.campo / eje.tope : 0
            const fraccionEjemplo = eje.tope > 0 ? rango.ejemplo / eje.tope : 0
            return (
              <g key={rango.desdeCm}>
                <rect
                  className="tablero-barra"
                  x={x}
                  y={MARGEN_EJES.arriba}
                  width={ancha}
                  height={altoUtil}
                  style={{ transform: `scaleY(${fraccionCampo})` }}
                />
                <rect
                  className="tablero-barra tablero-barra--ejemplo"
                  x={x}
                  y={MARGEN_EJES.arriba}
                  width={ancha}
                  height={altoUtil}
                  style={{
                    transform: `translateY(${-fraccionCampo * altoUtil}px) scaleY(${fraccionEjemplo})`,
                  }}
                />
                <text
                  className="tablero-eje tablero-eje--medio"
                  x={x + ancha / 2}
                  y={base + BAJADA_NUMEROS_EJE_X_HISTOGRAMA_PX}
                >
                  {rango.desdeCm}
                </text>
              </g>
            )
          })}
          <text
            className="tablero-eje tablero-eje--medio"
            x={(MARGEN_EJES.izquierda + ancho - MARGEN_EJES.derecha) / 2}
            y={alto - MARGEN_TITULO_EJE_X_HISTOGRAMA_PX}
          >
            {textos.ejeX}
          </text>
        </svg>
      </div>
      <ul className="tablero-apoyo">
        <li className="tablero-apoyo__item">
          <i className="tablero-barra-muestra" aria-hidden="true" />
          {TEXTOS_TABLERO.filtros.campo}
        </li>
        <li className="tablero-apoyo__item">
          <i className="tablero-barra-muestra" data-ejemplo="si" aria-hidden="true" />
          {textos.ejemplo}
        </li>
      </ul>
      {sinDapTexto && <p className="tablero-nota">{sinDapTexto}</p>}
    </TarjetaGrafico>
  )
}
