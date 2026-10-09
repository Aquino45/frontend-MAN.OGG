import { describe, expect, it } from 'vitest'
import {
  ATRIBUTO_TEMA,
  DURACION_EASTER_EGG_MS,
  FRASES_CARGA,
  PESOS_FRASES_CARGA,
  PESOS_GLIFOS_ARBOL,
  PROBABILIDAD_EASTER_EGG,
  TEMAS,
} from './constantes'

describe('constantes de negocio', () => {
  it('la probabilidad del easter egg es 1 entre 999', () => {
    expect(PROBABILIDAD_EASTER_EGG).toBe(1 / 999)
  })

  it('la duración del easter egg es 3000 ms', () => {
    expect(DURACION_EASTER_EGG_MS).toBe(3000)
  })
})

describe('constantes del tema', () => {
  it('el atributo es un data-* y hay exactamente un tema claro y uno oscuro', () => {
    expect(ATRIBUTO_TEMA).toMatch(/^data-[a-z-]+$/)
    expect(Object.values(TEMAS).sort()).toEqual(['claro', 'oscuro'])
  })
})

describe('tablas de pesos de las variantes', () => {
  it('cada frase de carga tiene un peso positivo y viceversa', () => {
    expect(Object.keys(PESOS_FRASES_CARGA).sort()).toEqual(Object.keys(FRASES_CARGA).sort())
    Object.values(PESOS_FRASES_CARGA).forEach((peso) => expect(peso).toBeGreaterThan(0))
  })

  it('los glifos de árbol tienen pesos positivos', () => {
    expect(Object.keys(PESOS_GLIFOS_ARBOL).length).toBeGreaterThanOrEqual(2)
    Object.values(PESOS_GLIFOS_ARBOL).forEach((peso) => expect(peso).toBeGreaterThan(0))
  })
})
