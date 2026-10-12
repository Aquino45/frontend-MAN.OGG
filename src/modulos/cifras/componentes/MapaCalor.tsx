// Mapa de calor de los sectores: los polígonos de la API, más oscuros cuanto más hay de lo que se
// mide (árboles, CO₂ o DAP medio). Un clic (o Enter) en un sector lo elige como filtro de todo el
// tablero; otro clic lo quita. Los nombres y valores van en el mapa con tamaño de pantalla real.
import { useMemo, type KeyboardEvent } from 'react'
import type { SectorFeature } from '@/api/cliente'
import { METRICAS_MAPA_CALOR, TEXTOS_TABLERO } from '@/config/constantes'
import { formatearMedida } from '@/lib/formatear'
import { proyectarSectores } from '@/modulos/mapa'
import { useAnchoMedido } from '../hooks/useAnchoMedido'
import { formatearCo2 } from '../lib/cifrasCo2'
import { intensidad } from '../lib/escalas'
import type { MetricaMapa } from '../lib/filtrosTablero'
import {
  ANCHO_POR_DEFECTO_PX,
  INTENSIDAD_ETIQUETA_CLARA,
  INTENSIDAD_MINIMA_MAPA,
  TEXTO_MAPA_CALOR_PX,
} from '../lib/medidasGraficos'
import type { SectorDelMapa } from '../lib/tablero'
import { Aparece } from './Aparece'
import { TarjetaGrafico } from './TarjetaGrafico'

const PORCENTAJE = 100
const PASOS_DE_LA_RAMPA = [0, 0.25, 0.5, 0.75, 1]
const entero = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 })

const METRICAS: readonly { valor: MetricaMapa; texto: string }[] = [
  { valor: METRICAS_MAPA_CALOR.arboles, texto: TEXTOS_TABLERO.mapaCalor.arboles },
  { valor: METRICAS_MAPA_CALOR.co2, texto: TEXTOS_TABLERO.mapaCalor.co2 },
  { valor: METRICAS_MAPA_CALOR.dap, texto: TEXTOS_TABLERO.mapaCalor.dap },
]

function textoDeValor(valor: number | null, metrica: MetricaMapa): string {
  if (valor === null) return TEXTOS_TABLERO.mapaCalor.sinDato
  if (metrica === METRICAS_MAPA_CALOR.co2) return formatearCo2(valor, 'almacenado')
  if (metrica === METRICAS_MAPA_CALOR.dap) return formatearMedida(valor, 'dapCm') ?? ''
  return entero.format(valor)
}

const rellenoDe = (fuerza: number) =>
  `color-mix(in srgb, var(--copa-carmin) ${Math.round(fuerza * PORCENTAJE)}%, var(--color-superficie))`

const fuerzaDe = (intensidadDe: number) =>
  INTENSIDAD_MINIMA_MAPA + (1 - INTENSIDAD_MINIMA_MAPA) * intensidadDe

interface PropsMapaCalor {
  sectores: readonly SectorFeature[]
  datos: readonly SectorDelMapa[]
  metrica: MetricaMapa
  sectorElegido: number | null
  onMetrica: (metrica: MetricaMapa) => void
  onElegirSector: (sectorId: number | null) => void
  clave: string
}

export function MapaCalor({
  sectores,
  datos,
  metrica,
  sectorElegido,
  onMetrica,
  onElegirSector,
  clave,
}: PropsMapaCalor) {
  const textos = TEXTOS_TABLERO.mapaCalor
  const proyeccion = useMemo(() => proyectarSectores(sectores), [sectores])
  const [referencia, ancho] = useAnchoMedido<HTMLDivElement>(ANCHO_POR_DEFECTO_PX)
  const maximo = Math.max(0, ...datos.map((sector) => sector.valor ?? 0))
  const escalaTexto = proyeccion.ancho / ancho
  const tamanoTexto = TEXTO_MAPA_CALOR_PX * escalaTexto
  const porId = new Map(datos.map((sector) => [sector.id, sector]))

  const alElegir = (sectorId: number) =>
    onElegirSector(sectorId === sectorElegido ? null : sectorId)
  const alPulsar = (evento: KeyboardEvent, sectorId: number) => {
    if (evento.key !== 'Enter' && evento.key !== ' ') return
    evento.preventDefault()
    alElegir(sectorId)
  }

  const controles = (
    <div
      className="tablero-segmento tablero-segmento--chico"
      role="group"
      aria-label={textos.metrica}
    >
      {METRICAS.map(({ valor, texto }) => (
        <button
          key={valor}
          type="button"
          aria-pressed={metrica === valor}
          onClick={() => onMetrica(valor)}
        >
          {texto}
        </button>
      ))}
    </div>
  )

  return (
    <TarjetaGrafico
      titulo={textos.titulo}
      descripcion={textos.descripcion}
      controles={controles}
      clase="tablero-tarjeta--mapa"
      tabla={{
        grafico: textos.titulo,
        cabecera: [
          textos.columnaSector,
          METRICAS.find(({ valor }) => valor === metrica)?.texto ?? '',
          TEXTOS_TABLERO.especies.columnaCampo,
          TEXTOS_TABLERO.especies.columnaEjemplo,
        ],
        filas: datos.map((sector) => [
          sector.nombre,
          textoDeValor(sector.valor, metrica),
          String(sector.arbolesCampo),
          String(sector.arbolesEjemplo),
        ]),
      }}
    >
      <div ref={referencia} className="tablero-mapa">
        <Aparece clave={clave}>
          <svg
            viewBox={`0 0 ${proyeccion.ancho} ${proyeccion.alto}`}
            role="group"
            aria-label={textos.titulo}
            className="tablero-mapa__svg"
          >
            {proyeccion.sectores.map((proyectado) => {
              const sector = porId.get(proyectado.id)
              if (!sector) return null
              const fuerza = sector.valor === null ? 0 : intensidad(sector.valor, maximo)
              const clara = fuerza >= INTENSIDAD_ETIQUETA_CLARA
              const elegido = sector.id === sectorElegido
              const valorTexto = textoDeValor(sector.valor, metrica)
              return (
                <g
                  key={sector.id}
                  className="tablero-mapa__sector"
                  role="button"
                  tabIndex={0}
                  aria-pressed={elegido}
                  aria-label={textos.etiquetaSector
                    .replace('{sector}', sector.nombre)
                    .replace('{valor}', valorTexto)}
                  data-elegido={elegido ? 'si' : undefined}
                  data-apagado={sectorElegido !== null && !elegido ? 'si' : undefined}
                  onClick={() => alElegir(sector.id)}
                  onKeyDown={(evento) => alPulsar(evento, sector.id)}
                >
                  <path
                    d={proyectado.trazado}
                    className="tablero-mapa__forma"
                    style={{
                      fill: sector.valor === null ? undefined : rellenoDe(fuerzaDe(fuerza)),
                    }}
                    data-sin-dato={sector.valor === null ? 'si' : undefined}
                  />
                  <text
                    x={proyectado.etiqueta.x}
                    y={proyectado.etiqueta.y - tamanoTexto * 0.25}
                    className={`tablero-mapa__nombre${clara ? ' tablero-mapa__texto--claro' : ''}`}
                    style={{ fontSize: tamanoTexto }}
                  >
                    {sector.nombre}
                  </text>
                  <text
                    x={proyectado.etiqueta.x}
                    y={proyectado.etiqueta.y + tamanoTexto * 1.1}
                    className={`tablero-mapa__valor${clara ? ' tablero-mapa__texto--claro' : ''}`}
                    style={{ fontSize: tamanoTexto }}
                  >
                    {valorTexto}
                  </text>
                </g>
              )
            })}
          </svg>
        </Aparece>
        <div className="tablero-rampa" aria-hidden="true">
          <small>{textos.menos}</small>
          <div className="tablero-rampa__pasos">
            {PASOS_DE_LA_RAMPA.map((paso) => (
              <span key={paso} style={{ background: rellenoDe(fuerzaDe(paso)) }} />
            ))}
          </div>
          <small>{textos.mas}</small>
        </div>
      </div>
    </TarjetaGrafico>
  )
}
