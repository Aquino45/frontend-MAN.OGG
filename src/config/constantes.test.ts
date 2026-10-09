import { describe, expect, it } from 'vitest'
import { DURACION_EASTER_EGG_MS, PROBABILIDAD_EASTER_EGG } from './constantes'

describe('constantes de negocio', () => {
  it('la probabilidad del easter egg es 1 entre 999', () => {
    expect(PROBABILIDAD_EASTER_EGG).toBe(1 / 999)
  })

  it('la duración del easter egg es 3000 ms', () => {
    expect(DURACION_EASTER_EGG_MS).toBe(3000)
  })
})
