import { describe, expect, it } from 'vitest'
import {
  ATRIBUTO_TEMA,
  CORTINA_HOJAS,
  DURACION_SALIDA_ANTICIPADA_MS,
  DURACION_SALIDA_ENTRADA_MS,
  CELEBRACION_ENTRADA,
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

  it('el fundido final dura 1,2 s y el de salir con Esc es más corto', () => {
    expect(DURACION_SALIDA_ENTRADA_MS).toBe(1_200)
    expect(DURACION_SALIDA_ANTICIPADA_MS).toBeLessThan(DURACION_SALIDA_ENTRADA_MS)
  })

  it('el guion va en orden y la primera frase empieza cuando la caja ya entró', () => {
    const E = ENTRADA_ALTERNA
    expect(CORTINA_HOJAS.cubrirMs).toBe(E.ilustracionDesdeMs)
    const momentos = [E.ilustracionDesdeMs, E.hojaGrandeDesdeMs, E.cajaDesdeMs, E.fraseDesdeMs]
    expect([...momentos].sort((a, b) => a - b)).toEqual(momentos)
    expect(E.cajaDesdeMs + E.cajaDuracionMs).toBeLessThanOrEqual(E.fraseDesdeMs)
    // Las hojas siguen cayendo durante la espera más larga posible (todas las esperas sin tocar nada)
    const peorCasoMs =
      E.fraseDesdeMs +
      (TEXTOS_ENTRADA_ALTERNA.frases.length + 1) * 60 * E.msPorLetra +
      3 * E.esperaFraseMs +
      E.esperaEleccionMs
    expect(E.hojaGrandeDesdeMs + E.hojasMaximas * E.hojaGrandeCadaMs).toBeGreaterThan(peorCasoMs)
  })

  it('cada frase espera 4 s y la elección 9 s; sin respuesta se toma NO', () => {
    expect(ENTRADA_ALTERNA.esperaFraseMs).toBe(4_000)
    expect(ENTRADA_ALTERNA.esperaEleccionMs).toBe(9_000)
    expect(TEXTOS_ENTRADA_ALTERNA.opciones).toEqual(['SÍ', 'NO'])
    expect(TEXTOS_ENTRADA_ALTERNA.opciones[TEXTOS_ENTRADA_ALTERNA.opcionPorDefecto]).toBe('NO')
    expect(TEXTOS_ENTRADA_ALTERNA.opciones[TEXTOS_ENTRADA_ALTERNA.opcionSi]).toBe('SÍ')
    expect(TEXTOS_ENTRADA_ALTERNA.frases).toHaveLength(3)
  })

  it('las teclas de avanzar y de mover no se pisan', () => {
    const E = ENTRADA_ALTERNA
    const todas = [...E.teclasAvanzar, ...E.teclasIzquierda, ...E.teclasDerecha]
    expect(new Set(todas).size).toBe(todas.length)
    todas.forEach((tecla) => expect(tecla).toBe(tecla.toLowerCase()))
  })

  it('la celebración tiene piezas de sobra y sus tiempos caben en una pantalla de cierre', () => {
    const C = CELEBRACION_ENTRADA
    expect(C.piezas).toBeGreaterThan(20)
    expect(C.ladoMinPx).toBeLessThanOrEqual(C.ladoMaxPx)
    expect(C.alcanceMin).toBeLessThanOrEqual(C.alcanceMax)
    expect(C.subidaFraccion).toBeGreaterThan(0)
    expect(C.subidaFraccion).toBeLessThan(1)
  })

  it('las hojas grandes cambian de tamaño en pasos del 10 % sin pasar del 30 %', () => {
    expect(ENTRADA_ALTERNA.hojaGrandePaso).toBe(0.1)
    expect(ENTRADA_ALTERNA.hojaGrandeTope).toBe(0.3)
  })

  it('el sonido es bajo y fijo, y la huella es un SHA-256 en hexadecimal', () => {
    expect(SONIDO_ENTRADA_ALTERNA.tipeo.volumen).toBeLessThanOrEqual(0.1)
    expect(SONIDO_ENTRADA_ALTERNA.celebracion.cornetaVolumen).toBeLessThanOrEqual(0.1)
    expect(SONIDO_ENTRADA_ALTERNA.celebracion.soniditoVolumen).toBeLessThanOrEqual(0.1)
    expect(SONIDO_ENTRADA_ALTERNA.tipeo.frecuenciaHz).toBeLessThan(400)
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
