import { describe, expect, it } from 'vitest'
import { pixelesDe, SPRITE_CORAZON, SPRITE_INDICADOR } from './sprites'

describe('sprites de la entrada alterna', () => {
  it('cada sprite es una rejilla rectangular con solo X y puntos', () => {
    for (const sprite of [SPRITE_CORAZON, SPRITE_INDICADOR]) {
      expect(new Set(sprite.map((fila) => fila.length)).size).toBe(1)
      sprite.forEach((fila) => expect(fila).toMatch(/^[X.]+$/))
    }
  })

  it('pixelesDe da una coordenada por cada X', () => {
    expect(pixelesDe(['X.', '.X'])).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ])
    expect(pixelesDe(SPRITE_INDICADOR)).toHaveLength(7 + 5 + 3 + 1)
  })
})
