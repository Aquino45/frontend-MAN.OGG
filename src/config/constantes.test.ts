import { describe, expect, it } from 'vitest'
import {
  ATRIBUTO_TEMA,
  CORTINA_HOJAS,
  DURACION_ENTRADA_ALTERNA_MS,
  DURACION_SALIDA_ANTICIPADA_MS,
  DURACION_SALIDA_ENTRADA_MS,
  ENTRADA_ALTERNA,
  FORZAR_ENTRADA,
  FRASES_CARGA,
  PESOS_FRASES_CARGA,
  PESOS_GLIFOS_ARBOL,
  PESOS_ENTRADA,
  SONIDO_ENTRADA_ALTERNA,
  TEMAS,
  TEXTOS_ENTRADA_ALTERNA,
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

  it('la secuencia dura unos 9 s: 8,3 s a la vista y 0,7 s de fundido final', () => {
    expect(DURACION_ENTRADA_ALTERNA_MS).toBe(8_300)
    expect(DURACION_SALIDA_ENTRADA_MS).toBe(700)
    expect(DURACION_ENTRADA_ALTERNA_MS + DURACION_SALIDA_ENTRADA_MS).toBe(9_000)
    expect(DURACION_SALIDA_ANTICIPADA_MS).toBeLessThan(DURACION_SALIDA_ENTRADA_MS)
  })

  it('el guion va en orden y cada momento cabe en la secuencia', () => {
    const E = ENTRADA_ALTERNA
    expect(CORTINA_HOJAS.cubrirMs).toBe(E.ilustracionDesdeMs)
    const momentos = [
      E.ilustracionDesdeMs,
      E.hojaGrandeDesdeMs,
      E.cajaDesdeMs,
      E.frase1DesdeMs,
      E.frase2DesdeMs,
      DURACION_ENTRADA_ALTERNA_MS,
    ]
    expect([...momentos].sort((a, b) => a - b)).toEqual(momentos)
    // Cada frase se escribe entera antes de que empiece la siguiente (o el final) y deja leerla
    TEXTOS_ENTRADA_ALTERNA.frases.forEach((frase, orden) => {
      const desde = orden === 0 ? E.frase1DesdeMs : E.frase2DesdeMs
      const hasta = orden === 0 ? E.frase2DesdeMs : DURACION_ENTRADA_ALTERNA_MS
      expect(desde + frase.length * E.msPorLetra).toBeLessThan(hasta - 1_000)
    })
    expect(E.cajaDesdeMs + E.cajaDuracionMs).toBeLessThanOrEqual(E.frase1DesdeMs)
  })

  it('las hojas grandes cambian de tamaño en pasos del 10 % sin pasar del 30 %', () => {
    expect(ENTRADA_ALTERNA.hojaGrandePaso).toBe(0.1)
    expect(ENTRADA_ALTERNA.hojaGrandeTope).toBe(0.3)
  })

  it('el sonido es bajo y fijo, y la huella es un SHA-256 en hexadecimal', () => {
    expect(SONIDO_ENTRADA_ALTERNA.blipVolumen).toBeLessThanOrEqual(0.1)
    expect(SONIDO_ENTRADA_ALTERNA.pistaVolumen).toBeLessThanOrEqual(0.3)
    expect(FORZAR_ENTRADA.huella).toMatch(/^[0-9a-f]{64}$/)
    expect(FORZAR_ENTRADA.ventanaMs).toBe(8_000)
    expect(FORZAR_ENTRADA.largoClave).toBe(6)
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
