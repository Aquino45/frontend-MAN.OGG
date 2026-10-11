import { describe, expect, it } from 'vitest'
import {
  ATRIBUTO_TEMA,
  DURACION_ENTRADA_ALTERNA_MS,
  DURACION_SALIDA_ENTRADA_MS,
  FRASES_CARGA,
  PESOS_FRASES_CARGA,
  PESOS_GLIFOS_ARBOL,
  PESOS_ENTRADA,
  TEMAS,
} from './constantes'

describe('constantes de la entrada al mapa', () => {
  it('los pesos de las variantes son positivos', () => {
    expect(Object.keys(PESOS_ENTRADA).sort()).toEqual(['alterna', 'estandar'])
    Object.values(PESOS_ENTRADA).forEach((peso) => expect(peso).toBeGreaterThan(0))
  })

  it('la variante alterna sale con probabilidad exactamente 1 entre 999', () => {
    const total = PESOS_ENTRADA.estandar + PESOS_ENTRADA.alterna
    expect(PESOS_ENTRADA.alterna).toBe(1)
    expect(PESOS_ENTRADA.alterna / total).toBe(1 / 999)
  })

  it('la ilustración se ve 3000 ms y se desvanece en menos tiempo del que se ve', () => {
    expect(DURACION_ENTRADA_ALTERNA_MS).toBe(3000)
    expect(DURACION_SALIDA_ENTRADA_MS).toBeGreaterThan(0)
    expect(DURACION_SALIDA_ENTRADA_MS).toBeLessThan(DURACION_ENTRADA_ALTERNA_MS)
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
