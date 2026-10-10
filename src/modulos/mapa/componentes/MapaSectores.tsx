// Mapa ilustrado: un trazado por sector, con su nombre y glifos decorativos.
// No pide datos: recibe los sectores y el estado de la interacción por props.
import { useMemo, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import type { ArbolFeature, SectorFeature } from '@/api/cliente'
import {
  MAPA_DURACION_ENTRADA_MS,
  MAPA_RADIO_PUNTO,
  MAPA_TAMANO_GLIFO,
  TEXTOS_MAPA,
} from '@/config/constantes'
import { useRecuadroAnimado } from '../hooks/useRecuadroAnimado'
import { proyectarSectores } from '../lib/proyectar'
import { nombreAccesibleSector } from '../lib/textosSector'
import { GlifoArbol, type FormaGlifo } from './GlifoArbol'
import { LeyendaMapa } from './LeyendaMapa'
import { PuntosArboles } from './PuntosArboles'

const TECLAS_SELECCION = new Set(['Enter', ' '])
const PUNTERO_TACTIL = 'touch'

interface PropsMapaSectores {
  sectores: readonly SectorFeature[]
  sectorResaltado: number | null
  sectorSeleccionado: number | null
  formasGlifos: readonly FormaGlifo[]
  onResaltar: (sectorId: number | null) => void
  onSeleccionar: (sectorId: number) => void
  // Árboles del sector seleccionado, que se dibujan como puntos al entrar en él
  arboles?: readonly ArbolFeature[]
  arbolResaltado?: string | null
  onResaltarArbol?: (codigo: string | null) => void
  onAbrirArbol?: (codigo: string) => void
}

const SIN_ARBOLES: readonly ArbolFeature[] = []
const SIN_ACCION = () => {}

export function MapaSectores({
  sectores,
  sectorResaltado,
  sectorSeleccionado,
  formasGlifos,
  onResaltar,
  onSeleccionar,
  arboles = SIN_ARBOLES,
  arbolResaltado = null,
  onResaltarArbol = SIN_ACCION,
  onAbrirArbol = SIN_ACCION,
}: PropsMapaSectores) {
  const proyeccion = useMemo(() => proyectarSectores(sectores), [sectores])
  const mapaCompleto = useMemo(
    () => ({ x: 0, y: 0, ancho: proyeccion.ancho, alto: proyeccion.alto }),
    [proyeccion],
  )
  const recuadroObjetivo =
    proyeccion.sectores.find((sector) => sector.id === sectorSeleccionado)?.recuadro ?? mapaCompleto
  const recuadro = useRecuadroAnimado(recuadroObjetivo, MAPA_DURACION_ENTRADA_MS)
  // Cuánto se acercó el mapa: los trazos de texto y los puntos se achican en la misma medida.
  const escalaZoom = recuadro.ancho / proyeccion.ancho
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
        className={[
          'mapa-sectores__svg',
          sectorActivo !== null && 'mapa-sectores__svg--con-activo',
          sectorSeleccionado !== null && 'mapa-sectores__svg--entrado',
        ]
          .filter(Boolean)
          .join(' ')}
        viewBox={`${recuadro.x} ${recuadro.y} ${recuadro.ancho} ${recuadro.alto}`}
        style={
          {
            aspectRatio: `${proyeccion.ancho} / ${proyeccion.alto}`,
            '--escala-zoom': escalaZoom,
          } as CSSProperties
        }
        role="group"
        aria-label={TEXTOS_MAPA.tituloRegion}
      >
        {proyeccion.sectores.map((proyectado, indice) => {
          const { properties } = sectores[indice]
          const clases = [
            'sector',
            properties.provisional && 'sector--provisional',
            proyectado.id === sectorActivo && 'sector--activo',
            proyectado.id === sectorSeleccionado && 'sector--seleccionado',
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
              {formasGlifos.length > 0 && proyectado.id !== sectorSeleccionado && (
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
        {sectorSeleccionado !== null && arboles.length > 0 && (
          <PuntosArboles
            arboles={arboles}
            proyectarPosicion={proyeccion.proyectarPosicion}
            radio={MAPA_RADIO_PUNTO * escalaZoom}
            codigoResaltado={arbolResaltado}
            onResaltar={onResaltarArbol}
            onAbrir={onAbrirArbol}
          />
        )}
      </svg>
      <LeyendaMapa hayProvisionales={hayProvisionales} />
    </figure>
  )
}
