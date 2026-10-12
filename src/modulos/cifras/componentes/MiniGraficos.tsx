// Mini gráficos de las tarjetas de resumen. Son decorativos: el valor va escrito junto a ellos.
// Campo va relleno y ejemplo con borde punteado, igual que en los gráficos grandes.
import { escalaLineal } from '../lib/escalas'
import { MINI } from '../lib/medidasGraficos'

function Lienzo({ children }: { children: React.ReactNode }) {
  return (
    <svg
      className="mini-grafico"
      viewBox={`0 0 ${MINI.ancho} ${MINI.alto}`}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export interface ColumnaMini {
  campo: number
  ejemplo: number
  // La columna del sector elegido en el filtro
  elegida?: boolean
}

// Una columna por sector: el campo abajo y el ejemplo encima
export function MiniColumnas({ columnas }: { columnas: readonly ColumnaMini[] }) {
  const maximo = Math.max(0, ...columnas.map((columna) => columna.campo + columna.ejemplo))
  const alto = escalaLineal(0, maximo, 0, MINI.base - MINI.margen)
  return (
    <Lienzo>
      {columnas.map((columna, indice) => {
        const x = MINI.margen + indice * MINI.paso
        const altoCampo = maximo > 0 ? alto(columna.campo) : 0
        const altoEjemplo = maximo > 0 ? alto(columna.ejemplo) : 0
        return (
          <g key={indice} data-elegida={columna.elegida ? 'si' : undefined}>
            <rect
              className="mini-campo"
              x={x}
              y={MINI.base - altoCampo}
              width={MINI.columna}
              height={altoCampo}
            />
            <rect
              className="mini-ejemplo"
              x={x}
              y={MINI.base - altoCampo - altoEjemplo}
              width={MINI.columna}
              height={altoEjemplo}
            />
          </g>
        )
      })}
    </Lienzo>
  )
}

export interface BarraMini {
  valor: number
  serie: number
}

// Una barra por especie, del color de su serie
export function MiniBarras({ barras }: { barras: readonly BarraMini[] }) {
  const maximo = Math.max(0, ...barras.map((barra) => barra.valor))
  const largo = escalaLineal(0, maximo, 0, MINI.ancho - MINI.margen)
  const alto = 6
  const paso = alto + 2.5
  return (
    <Lienzo>
      {barras.map((barra, indice) => (
        <rect
          key={indice}
          className="mini-serie"
          data-serie={barra.serie}
          x={0}
          y={indice * paso}
          width={maximo > 0 ? largo(barra.valor) : 0}
          height={alto}
          rx={1}
        />
      ))}
    </Lienzo>
  )
}

export interface PuntoMini {
  dapCm: number
  ejemplo: boolean
  resaltado: boolean
}

const FILAS_DE_PUNTOS = 4

// Todos los DAP en una sola línea (los de ejemplo con borde punteado) y el mayor resaltado
export function MiniPuntosDap({ puntos }: { puntos: readonly PuntoMini[] }) {
  const maximo = Math.max(0, ...puntos.map((punto) => punto.dapCm))
  const x = escalaLineal(0, maximo, MINI.margen, MINI.ancho - MINI.margen)
  return (
    <Lienzo>
      <line
        className="mini-eje"
        x1={MINI.margen}
        x2={MINI.ancho - MINI.margen}
        y1={MINI.base}
        y2={MINI.base}
      />
      {puntos.map((punto, indice) => (
        <circle
          key={indice}
          className={
            punto.resaltado ? 'mini-resalte' : punto.ejemplo ? 'mini-punto-ejemplo' : 'mini-punto'
          }
          cx={maximo > 0 ? x(punto.dapCm) : MINI.margen}
          cy={8 + ((indice * 7) % (FILAS_DE_PUNTOS * 6))}
          r={punto.resaltado ? 3.4 : 1.8}
        />
      ))}
    </Lienzo>
  )
}

export interface ParteMini {
  valor: number
  clase: string
}

const ALTO_BARRA_MINI = 9

// Una barra partida en proporción por fila (nativas y exóticas de campo, y las de ejemplo)
export function MiniProporciones({ filas }: { filas: readonly (readonly ParteMini[])[] }) {
  const separacion = ALTO_BARRA_MINI + 5
  const arriba = (MINI.alto - (filas.length * ALTO_BARRA_MINI + (filas.length - 1) * 5)) / 2
  return (
    <Lienzo>
      {filas.map((partes, fila) => {
        const total = partes.reduce((suma, parte) => suma + parte.valor, 0)
        let x = 0
        return (
          <g key={fila}>
            {partes.map((parte, indice) => {
              const largo = total > 0 ? (parte.valor / total) * MINI.ancho : 0
              const rect = (
                <rect
                  key={indice}
                  className={parte.clase}
                  x={x}
                  y={arriba + fila * separacion}
                  width={largo}
                  height={ALTO_BARRA_MINI}
                  rx={2}
                />
              )
              x += largo
              return rect
            })}
          </g>
        )
      })}
    </Lienzo>
  )
}
