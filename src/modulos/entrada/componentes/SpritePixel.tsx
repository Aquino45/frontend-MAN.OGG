// Un dibujo pixel en SVG: un rectángulo por pixel pintado, con bordes nítidos. Toma el color del texto
// del contenedor (`currentColor`) y es adorno, así que va oculto a los lectores de pantalla.
import type { CSSProperties } from 'react'
import { pixelesDe, type Sprite } from '../lib/sprites'

interface PropsSpritePixel {
  sprite: Sprite
  // Alto del dibujo; el ancho sale de la proporción de la rejilla
  altoPx: number
  className?: string
  style?: CSSProperties
}

export function SpritePixel({ sprite, altoPx, className, style }: PropsSpritePixel) {
  const columnas = sprite[0].length
  const filas = sprite.length
  return (
    <svg
      className={className}
      style={style}
      viewBox={`0 0 ${columnas} ${filas}`}
      width={(altoPx * columnas) / filas}
      height={altoPx}
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {pixelesDe(sprite).map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
      ))}
    </svg>
  )
}
