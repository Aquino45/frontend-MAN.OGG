// Mapa ilustrado: un trazado por sector, con su nombre y glifos decorativos.
// No pide datos: recibe los sectores y el estado de la interacción por props.
import { useMemo, useRef, type KeyboardEvent, type PointerEvent } from 'react'
import type { SectorFeature } from '@/api/cliente'
import { MAPA_TAMANO_GLIFO, TEXTOS_MAPA } from '@/config/constantes'
import { proyectarSectores } from '../lib/proyectar'
import { nombreAccesibleSector } from '../lib/textosSector'
import { GlifoArbol, type FormaGlifo } from './GlifoArbol'
import { LeyendaMapa } from './LeyendaMapa'

const TECLAS_SELECCION = new Set(['Enter', ' '])
const PUNTERO_TACTIL = 'touch'

interface PropsMapaSectores {
  sectores: readonly SectorFeature[]
  sectorResaltado: number | null
  sectorSeleccionado: number | null
  formasGlifos: readonly FormaGlifo[]
  onResaltar: (sectorId: number | null) => void
  onSeleccionar: (sectorId: number) => void
}

export function MapaSectores({
  sectores,
  sectorResaltado,
  sectorSeleccionado,
  formasGlifos,
  onResaltar,
  onSeleccionar,
}: PropsMapaSectores) {
  const proyeccion = useMemo(() => proyectarSectores(sectores), [sectores])
  // Tipo del puntero que está presionando un sector; null si la interacción es por teclado.
  const punteroEnCurso = useRef<string | null>(null)
  const sectorActivo = sectorResaltado ?? sectorSeleccionado
  const hayProvisionales = sectores.some((sector) => sector.properties.provisional)

  // Reparte las formas sorteadas entre todos los glifos del mapa, en orden.
  const formasPorSector = useMemo(() => {
    let siguiente = 0
    return proyeccion.sectores.map((proyectado) =>
      proyectado.glifos.map(() => formasGlifos[siguiente++ % formasGlifos.length]),
    )
  }, [proyeccion, formasGlifos])

  const alEntrar = (evento: PointerEvent, sectorId: number) => {
    if (evento.pointerType !== PUNTERO_TACTIL) onResaltar(sectorId)
  }
  const alSalir = (evento: PointerEvent) => {
    if (evento.pointerType !== PUNTERO_TACTIL) onResaltar(null)
  }
  const alPresionar = (evento: PointerEvent) => {
    punteroEnCurso.current = evento.pointerType
  }
  const alEnfocar = (sectorId: number) => {
    if (punteroEnCurso.current === null) onResaltar(sectorId)
  }
  // En pantallas táctiles, el primer toque resalta y el segundo selecciona.
  const alHacerClick = (sectorId: number) => {
    const esPrimerToque = punteroEnCurso.current === PUNTERO_TACTIL && sectorResaltado !== sectorId
    punteroEnCurso.current = null
    if (esPrimerToque) onResaltar(sectorId)
    else onSeleccionar(sectorId)
  }
  const alPulsarTecla = (evento: KeyboardEvent, sectorId: number) => {
    if (!TECLAS_SELECCION.has(evento.key)) return
    evento.preventDefault()
    onSeleccionar(sectorId)
  }

  return (
    <figure className="mapa-sectores">
      <svg
        className={`mapa-sectores__svg${sectorActivo === null ? '' : ' mapa-sectores__svg--con-activo'}`}
        viewBox={`0 0 ${proyeccion.ancho} ${proyeccion.alto}`}
        role="group"
        aria-label={TEXTOS_MAPA.tituloRegion}
      >
        {proyeccion.sectores.map((proyectado, indice) => {
          const { properties } = sectores[indice]
          const clases = [
            'sector',
            properties.provisional && 'sector--provisional',
            proyectado.id === sectorActivo && 'sector--activo',
          ].filter(Boolean)
          return (
            <g key={proyectado.id} className={clases.join(' ')} data-sector={proyectado.id}>
              <path
                className="sector__forma"
                d={proyectado.trazado}
                role="button"
                tabIndex={0}
                aria-label={nombreAccesibleSector(properties)}
                aria-pressed={proyectado.id === sectorSeleccionado}
                onPointerEnter={(evento) => alEntrar(evento, proyectado.id)}
                onPointerLeave={alSalir}
                onPointerDown={alPresionar}
                onFocus={() => alEnfocar(proyectado.id)}
                onBlur={() => onResaltar(null)}
                onClick={() => alHacerClick(proyectado.id)}
                onKeyDown={(evento) => alPulsarTecla(evento, proyectado.id)}
              />
              {formasGlifos.length > 0 && (
                <g className="sector__glifos" aria-hidden="true">
                  {proyectado.glifos.map((centro, indiceGlifo) => (
                    <GlifoArbol
                      key={indiceGlifo}
                      forma={formasPorSector[indice][indiceGlifo]}
                      centro={centro}
                      tamano={MAPA_TAMANO_GLIFO}
                    />
                  ))}
                </g>
              )}
              <text
                className="sector__etiqueta"
                x={proyectado.etiqueta.x}
                y={proyectado.etiqueta.y}
                aria-hidden="true"
              >
                {properties.nombre}
              </text>
            </g>
          )
        })}
      </svg>
      <LeyendaMapa hayProvisionales={hayProvisionales} />
    </figure>
  )
}
