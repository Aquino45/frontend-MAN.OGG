// Los dibujos pixel de la entrada alterna, como filas de texto: `X` es un pixel pintado y `.`, uno vacío.
// Se dibujan en SVG (componentes/SpritePixel.tsx) y toman el color del texto del contenedor.

// El corazón: marca la opción elegida y es el cursor propio dentro de la capa
export const SPRITE_CORAZON = [
  '.XX..XX.',
  'XXXXXXXX',
  'XXXXXXXX',
  '.XXXXXX.',
  '..XXXX..',
  '...XX...',
] as const

// El triángulo hacia abajo (▼) que parpadea cuando la frase espera a que la persona avance
export const SPRITE_INDICADOR = ['XXXXXXX', '.XXXXX.', '..XXX..', '...X...'] as const

export type Sprite = readonly string[]

// Cada pixel pintado como un rectángulo de 1×1 en la rejilla del sprite
export function pixelesDe(sprite: Sprite): { x: number; y: number }[] {
  return sprite.flatMap((fila, y) =>
    [...fila].flatMap((celda, x) => (celda === 'X' ? [{ x, y }] : [])),
  )
}
