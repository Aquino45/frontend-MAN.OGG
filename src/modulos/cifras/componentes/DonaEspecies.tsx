// Dona de especies: las más frecuentes, «Otras» con el resto y, si los hay, los árboles sin especie.
// Un clic en un trozo (o en su renglón de la leyenda, que es lo que se usa con el teclado) elige esa
// especie como filtro de todo el tablero; otro clic la quita. Cuenta campo y ejemplo juntos y lo dice.
import { TEXTOS_TABLERO } from '@/config/constantes'
import { repartirAngulos, trazoAnillo } from '../lib/trazosSvg'
import { LADO_DONA, RADIO_DONA, SEPARACION_TROZOS_RAD } from '../lib/medidasGraficos'
import type { FilaEspecie } from '../lib/tablero'
import { Aparece } from './Aparece'
import { TarjetaGrafico } from './TarjetaGrafico'

const PORCENTAJE = 100
const VUELTA = 2 * Math.PI
const INICIO = -Math.PI / 2
const entero = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 })

interface PropsDonaEspecies {
  filas: readonly FilaEspecie[]
  especieElegida: string | null
  onElegir: (especie: string | null) => void
  clave: string
}

export function DonaEspecies({ filas, especieElegida, onElegir, clave }: PropsDonaEspecies) {
  const textos = TEXTOS_TABLERO.especies
  const total = filas.reduce((suma, fila) => suma + fila.cantidad, 0)
  const tramos = repartirAngulos(
    filas.map((fila) => fila.cantidad),
    INICIO,
    VUELTA,
  )
  const alElegir = (fila: FilaEspecie) => {
    if (fila.clave === null) return
    onElegir(fila.clave === especieElegida ? null : fila.clave)
  }
  const porcentaje = (cantidad: number) => `${entero.format((cantidad / total) * PORCENTAJE)} %`

  return (
    <TarjetaGrafico
      titulo={textos.titulo}
      descripcion={`${textos.descripcion} · ${TEXTOS_TABLERO.kpis.campo} + ${TEXTOS_TABLERO.kpis.ejemplo}`}
      tabla={{
        grafico: textos.titulo,
        cabecera: [
          textos.columnaEspecie,
          textos.columnaArboles,
          textos.columnaCampo,
          textos.columnaEjemplo,
        ],
        filas: filas.map((fila) => [
          fila.etiqueta,
          String(fila.cantidad),
          String(fila.campo),
          String(fila.ejemplo),
        ]),
      }}
    >
      <Aparece clave={clave}>
        <div className="tablero-dona">
          <svg
            className="tablero-dona__svg"
            viewBox={`0 0 ${LADO_DONA} ${LADO_DONA}`}
            aria-hidden="true"
            focusable="false"
          >
            {filas.map((fila, indice) => {
              const { desde, hasta } = tramos[indice]
              if (hasta === desde) return null
              const hueco = filas.length > 1 ? SEPARACION_TROZOS_RAD : 0
              // Un solo trozo que cierra la vuelta no puede empezar y terminar en el mismo punto
              const fin = Math.min(hasta - hueco, desde + VUELTA - 0.001)
              return (
                <path
                  key={`${fila.clave ?? fila.etiqueta}`}
                  className="tablero-dona__trozo"
                  data-serie={fila.serie}
                  data-elegida={
                    fila.clave !== null && fila.clave === especieElegida ? 'si' : undefined
                  }
                  data-apagada={
                    especieElegida !== null && fila.clave !== especieElegida ? 'si' : undefined
                  }
                  data-filtrable={fila.clave !== null ? 'si' : undefined}
                  d={trazoAnillo(
                    LADO_DONA / 2,
                    LADO_DONA / 2,
                    RADIO_DONA.exterior,
                    RADIO_DONA.interior,
                    desde + hueco,
                    fin,
                  )}
                  onClick={() => alElegir(fila)}
                />
              )
            })}
            <text x={LADO_DONA / 2} y={LADO_DONA / 2 - 2} className="tablero-dona__total">
              {entero.format(total)}
            </text>
            <text x={LADO_DONA / 2} y={LADO_DONA / 2 + 12} className="tablero-dona__sub">
              {textos.total}
            </text>
          </svg>
          <ul className="tablero-leyenda">
            {filas.map((fila) => {
              const contenido = (
                <>
                  <i
                    className="tablero-leyenda__muestra"
                    data-serie={fila.serie}
                    aria-hidden="true"
                  />
                  <span className="tablero-leyenda__nombre">
                    <b>{fila.comun ?? fila.etiqueta}</b>
                    {fila.comun && fila.clave !== null && <em>{fila.etiqueta}</em>}
                  </span>
                  <span className="tablero-leyenda__cifra">
                    {entero.format(fila.cantidad)} · {porcentaje(fila.cantidad)}
                  </span>
                </>
              )
              return (
                <li key={`${fila.clave ?? fila.etiqueta}`}>
                  {fila.clave === null ? (
                    <div className="tablero-leyenda__fila">{contenido}</div>
                  ) : (
                    <button
                      type="button"
                      className="tablero-leyenda__fila tablero-leyenda__fila--boton"
                      aria-pressed={fila.clave === especieElegida}
                      aria-label={textos.etiquetaTrozo
                        .replace('{especie}', fila.etiqueta)
                        .replace('{n}', String(fila.cantidad))}
                      onClick={() => alElegir(fila)}
                    >
                      {contenido}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </Aparece>
    </TarjetaGrafico>
  )
}
