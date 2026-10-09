import { describe, expect, it } from 'vitest'
import { TEMAS } from '@/config/constantes'
import { esTema, resolverTema, temaOpuesto } from './tema'

describe('reglas del tema', () => {
  it('reconoce solo los valores de TEMAS', () => {
    expect(esTema(TEMAS.claro)).toBe(true)
    expect(esTema(TEMAS.oscuro)).toBe(true)
    expect(esTema('sepia')).toBe(false)
    expect(esTema(null)).toBe(false)
  })

  it('la elección guardada manda sobre el sistema', () => {
    expect(resolverTema(TEMAS.oscuro, true)).toBe(TEMAS.oscuro)
    expect(resolverTema(TEMAS.claro, false)).toBe(TEMAS.claro)
  })

  it('sin elección válida sigue al sistema', () => {
    expect(resolverTema(null, true)).toBe(TEMAS.claro)
    expect(resolverTema('sepia', false)).toBe(TEMAS.oscuro)
  })

  it('el opuesto alterna entre los dos temas', () => {
    expect(temaOpuesto(TEMAS.claro)).toBe(TEMAS.oscuro)
    expect(temaOpuesto(TEMAS.oscuro)).toBe(TEMAS.claro)
  })
})
