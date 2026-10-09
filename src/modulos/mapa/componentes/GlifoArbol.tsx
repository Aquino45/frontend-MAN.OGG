// Glifo decorativo de árbol dentro de un sector. Es adorno: no representa árboles del censo.
import type { ReactNode } from 'react'
import type { PESOS_GLIFOS_ARBOL } from '@/config/constantes'
import type { Punto2D } from '../lib/proyectar'

export type FormaGlifo = keyof typeof PESOS_GLIFOS_ARBOL

// Las formas se dibujan en una grilla de 24 × 24 y se escalan al tamaño pedido.
const LADO_GRILLA = 24

const FORMAS: Record<FormaGlifo, ReactNode> = {
  copaRedonda: (
    <>
      <rect className="glifo-arbol__tronco" x="11" y="13" width="2" height="9" />
      <circle cx="12" cy="9" r="7" />
    </>
  ),
  copaAlta: (
    <>
      <rect className="glifo-arbol__tronco" x="11" y="16" width="2" height="7" />
      <ellipse cx="12" cy="10" rx="5" ry="9" />
    </>
  ),
  palma: (
    <path
      className="glifo-arbol__trazo"
      d="M12 23V9M12 9C9 6 5 6 2 8M12 9C15 6 19 6 22 8M12 9C10 5 8 3 5 2M12 9C14 5 16 3 19 2"
    />
  ),
}

interface PropsGlifoArbol {
  forma: FormaGlifo
  centro: Punto2D
  tamano: number
}

export function GlifoArbol({ forma, centro, tamano }: PropsGlifoArbol) {
  const escala = tamano / LADO_GRILLA
  const transformacion = `translate(${centro.x - tamano / 2} ${centro.y - tamano / 2}) scale(${escala})`
  return (
    <g className="glifo-arbol" transform={transformacion} data-forma={forma}>
      {FORMAS[forma]}
    </g>
  )
}
