// Estrella de un árbol destacado: ocupa el lugar del punto normal, con el mismo comportamiento.
import type { SVGProps } from 'react'
import { ESTRELLA_CONTORNO, ESTRELLA_LADO_GRILLA } from '@/config/constantes'
import type { Punto2D } from '../lib/proyectar'

interface PropsEstrellaArbol extends Omit<SVGProps<SVGGElement>, 'transform'> {
  centro: Punto2D
  // Lado de la estrella en unidades del viewBox actual
  tamano: number
}

export function EstrellaArbol({ centro, tamano, ...propsDelGrupo }: PropsEstrellaArbol) {
  const escala = tamano / ESTRELLA_LADO_GRILLA
  const transformacion = `translate(${centro.x - tamano / 2} ${centro.y - tamano / 2}) scale(${escala})`
  // El grupo recibe el foco, el hover y la escala al resaltar; el contorno solo se coloca y se dimensiona.
  return (
    <g {...propsDelGrupo}>
      <path d={ESTRELLA_CONTORNO} transform={transformacion} />
    </g>
  )
}
