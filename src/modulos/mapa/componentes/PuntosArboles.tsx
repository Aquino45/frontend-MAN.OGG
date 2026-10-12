// Un punto por árbol con ubicación, en su posición real dentro del sector. No pide datos.
// Los destacados se dibujan como estrella, más grande y por encima de los demás puntos.
import { useEffect, useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { ArbolFeature } from '@/api/cliente'
import { MAPA_ESCALA_ESTRELLA, MAPA_PASOS_CASCADA, TEXTOS_PANEL } from '@/config/constantes'
import type { Punto2D } from '../lib/proyectar'
import { nombreAccesibleArbol } from '../lib/textosArbol'
import { EstrellaArbol } from './EstrellaArbol'

const TECLAS_APERTURA = new Set(['Enter', ' '])

// Sectores cuyos puntos ya hicieron su cascada en esta carga de la página
const sectoresConCascada = new Set<number>()

interface PropsPuntosArboles {
  // Sector al que pertenecen los puntos: la cascada es la primera vez que se entra en él
  sectorId: number
  arboles: readonly ArbolFeature[]
  proyectarPosicion: (posicion: readonly [number, number]) => Punto2D
  // Radio de cada punto en unidades del mapa completo; el zoom lo achica por CSS (--escala-zoom)
  radio: number
  codigoResaltado: string | null
  onResaltar: (codigo: string | null) => void
  onAbrir: (codigo: string) => void
}

export function PuntosArboles({
  sectorId,
  arboles,
  proyectarPosicion,
  radio,
  codigoResaltado,
  onResaltar,
  onAbrir,
}: PropsPuntosArboles) {
  const [conCascada] = useState(() => !sectoresConCascada.has(sectorId))
  useEffect(() => {
    sectoresConCascada.add(sectorId)
  }, [sectorId])

  const alPulsarTecla = (evento: KeyboardEvent, codigo: string) => {
    if (!TECLAS_APERTURA.has(evento.key)) return
    evento.preventDefault()
    onAbrir(codigo)
  }

  // En SVG lo último que se dibuja queda encima: los destacados van al final.
  const destacadosAlFinal = [
    ...arboles.filter((arbol) => !arbol.properties.destacado),
    ...arboles.filter((arbol) => arbol.properties.destacado),
  ]

  return (
    <g className="puntos-arboles" data-cascada={conCascada}>
      {destacadosAlFinal.map((arbol, indice) => {
        if (arbol.geometry === null) return null
        const { codigo, demo, destacado } = arbol.properties
        const [lon, lat] = arbol.geometry.coordinates
        const centro = proyectarPosicion([lon, lat])
        const clases = [
          'punto-arbol',
          destacado && 'punto-arbol--destacado',
          demo && 'punto-arbol--demo',
          codigo === codigoResaltado && 'punto-arbol--resaltado',
        ].filter(Boolean)
        const propsComunes = {
          className: clases.join(' '),
          role: 'button',
          tabIndex: 0,
          'data-codigo': codigo,
          style: { '--indice': Math.min(indice, MAPA_PASOS_CASCADA) } as CSSProperties,
          'aria-label': nombreAccesibleArbol(arbol.properties, TEXTOS_PANEL.sinNombreComun),
          onPointerEnter: () => onResaltar(codigo),
          onPointerLeave: () => onResaltar(null),
          onFocus: () => onResaltar(codigo),
          onBlur: () => onResaltar(null),
          onClick: () => onAbrir(codigo),
          onKeyDown: (evento: KeyboardEvent) => alPulsarTecla(evento, codigo),
        }
        if (destacado) {
          return (
            <EstrellaArbol
              key={codigo}
              {...propsComunes}
              centro={centro}
              tamano={radio * 2 * MAPA_ESCALA_ESTRELLA}
            />
          )
        }
        return <circle key={codigo} {...propsComunes} cx={centro.x} cy={centro.y} r={radio} />
      })}
    </g>
  )
}
