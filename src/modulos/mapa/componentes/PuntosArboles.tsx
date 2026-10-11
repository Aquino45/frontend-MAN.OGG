// Un punto por árbol con ubicación, en su posición real dentro del sector. No pide datos.
import type { KeyboardEvent } from 'react'
import type { ArbolFeature } from '@/api/cliente'
import { TEXTOS_PANEL } from '@/config/constantes'
import type { Punto2D } from '../lib/proyectar'
import { nombreAccesibleArbol } from '../lib/textosArbol'

const TECLAS_APERTURA = new Set(['Enter', ' '])

interface PropsPuntosArboles {
  arboles: readonly ArbolFeature[]
  proyectarPosicion: (posicion: readonly [number, number]) => Punto2D
  // Radio de cada punto en unidades del viewBox actual
  radio: number
  codigoResaltado: string | null
  onResaltar: (codigo: string | null) => void
  onAbrir: (codigo: string) => void
}

export function PuntosArboles({
  arboles,
  proyectarPosicion,
  radio,
  codigoResaltado,
  onResaltar,
  onAbrir,
}: PropsPuntosArboles) {
  const alPulsarTecla = (evento: KeyboardEvent, codigo: string) => {
    if (!TECLAS_APERTURA.has(evento.key)) return
    evento.preventDefault()
    onAbrir(codigo)
  }

  return (
    <g className="puntos-arboles">
      {arboles.map((arbol) => {
        if (arbol.geometry === null) return null
        const { codigo, demo } = arbol.properties
        const [lon, lat] = arbol.geometry.coordinates
        const centro = proyectarPosicion([lon, lat])
        const clases = [
          'punto-arbol',
          demo && 'punto-arbol--demo',
          codigo === codigoResaltado && 'punto-arbol--resaltado',
        ].filter(Boolean)
        return (
          <circle
            key={codigo}
            className={clases.join(' ')}
            cx={centro.x}
            cy={centro.y}
            r={radio}
            role="button"
            tabIndex={0}
            data-codigo={codigo}
            aria-label={nombreAccesibleArbol(arbol.properties, TEXTOS_PANEL.sinNombreComun)}
            onPointerEnter={() => onResaltar(codigo)}
            onPointerLeave={() => onResaltar(null)}
            onFocus={() => onResaltar(codigo)}
            onBlur={() => onResaltar(null)}
            onClick={() => onAbrir(codigo)}
            onKeyDown={(evento) => alPulsarTecla(evento, codigo)}
          />
        )
      })}
    </g>
  )
}
