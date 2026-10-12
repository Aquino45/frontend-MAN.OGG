import { describe, expect, it } from 'vitest'
import { CORTINA_HOJAS as D } from '@/config/constantes'
import { disenarCortina } from './disenoCortina'
import { HOJAS_DE_CORTINA, LADO_HOJA_EN_CELDAS } from './hojasCortina'

const PANTALLAS: readonly [number, number][] = [
  [360, 800],
  [320, 480],
  [768, 1024],
  [1440, 900],
  [1920, 1080],
  [3840, 2160],
]

describe('disenarCortina', () => {
  it.each(PANTALLAS)('en %i x %i no pasa del tope de hojas', (ancho, alto) => {
    expect(disenarCortina(ancho, alto).hojas.length).toBeLessThanOrEqual(D.hojasMax)
  })

  it.each(PANTALLAS)(
    'en %i x %i las hojas cubren casi toda la pantalla y llegan a los cuatro bordes',
    (ancho, alto) => {
      const { hojas, ladoPx } = disenarCortina(ancho, alto)
      // Se recorren puntos de la pantalla y se cuenta cuántos caen dentro de alguna hoja
      const paso = Math.max(1, Math.floor(ladoPx / 4))
      let total = 0
      let cubiertos = 0
      for (let y = 0; y < alto; y += paso) {
        for (let x = 0; x < ancho; x += paso) {
          total += 1
          if (hojas.some((h) => x >= h.x && x < h.x + ladoPx && y >= h.y && y < h.y + ladoPx)) {
            cubiertos += 1
          }
        }
      }
      // Lo que queda entre hojas lo cubre el fondo; las hojas llegan hasta los bordes
      expect(cubiertos / total).toBeGreaterThanOrEqual(0.85)
      expect(Math.min(...hojas.map((h) => h.x))).toBe(0)
      expect(Math.min(...hojas.map((h) => h.y))).toBe(0)
      expect(Math.max(...hojas.map((h) => h.x + ladoPx))).toBeGreaterThanOrEqual(ancho)
      expect(Math.max(...hojas.map((h) => h.y + ladoPx))).toBeGreaterThanOrEqual(alto)
    },
  )

  it('la celda y el lado son de píxeles enteros y la hoja mide 5 celdas', () => {
    for (const [ancho, alto] of PANTALLAS) {
      const { celdaPx, ladoPx, hojas } = disenarCortina(ancho, alto)
      expect(Number.isInteger(celdaPx)).toBe(true)
      expect(celdaPx).toBeGreaterThanOrEqual(D.celdaMinimaPx)
      expect(ladoPx).toBe(celdaPx * D.celdasPorHoja)
      for (const hoja of hojas) {
        expect(Number.isInteger(hoja.x)).toBe(true)
        expect(Number.isInteger(hoja.y)).toBe(true)
      }
    }
  })

  it('las hojas quedan dentro de la pantalla', () => {
    for (const [ancho, alto] of PANTALLAS) {
      const { hojas, ladoPx } = disenarCortina(ancho, alto)
      for (const hoja of hojas) {
        expect(hoja.x).toBeGreaterThanOrEqual(0)
        expect(hoja.y).toBeGreaterThanOrEqual(0)
        expect(hoja.x + ladoPx).toBeLessThanOrEqual(Math.max(ancho, ladoPx))
        expect(hoja.y + ladoPx).toBeLessThanOrEqual(Math.max(alto, ladoPx))
      }
    }
  })

  it('el escalonado no pasa del tope y la última hoja asienta antes de que termine la cortina', () => {
    for (const [ancho, alto] of PANTALLAS) {
      const { hojas } = disenarCortina(ancho, alto)
      const ultimo = Math.max(...hojas.map((h) => h.retrasoMs))
      expect(ultimo).toBeLessThanOrEqual(D.retrasoMaximoHojaMs)
      expect(ultimo + D.caidaHojaMs).toBeLessThanOrEqual(D.cubrirMs)
      expect(Math.min(...hojas.map((h) => h.retrasoMs))).toBe(0)
    }
  })

  it('es reproducible: el mismo tamaño da la misma cortina (nada de azar)', () => {
    expect(disenarCortina(1440, 900)).toEqual(disenarCortina(1440, 900))
  })

  it('usa las tres variantes de tono y de abajo hacia arriba (las de arriba quedan encima)', () => {
    const { hojas } = disenarCortina(1440, 900)
    expect(new Set(hojas.map((h) => h.variante))).toEqual(new Set([0, 1, 2]))
    expect(hojas[0].y).toBeGreaterThanOrEqual(hojas[hojas.length - 1].y)
  })

  it('una pantalla chica igual lleva al menos una hoja', () => {
    expect(disenarCortina(10, 10).hojas.length).toBeGreaterThanOrEqual(1)
  })
})

describe('hoja pixel', () => {
  it('es de 5 x 5 celdas con letras de la paleta en cada variante', () => {
    expect(LADO_HOJA_EN_CELDAS).toBe(5)
    expect(HOJAS_DE_CORTINA).toHaveLength(3)
    for (const filas of HOJAS_DE_CORTINA) {
      expect(filas).toHaveLength(5)
      for (const fila of filas) {
        expect(fila).toHaveLength(5)
        expect(fila).toMatch(/^[.COM]+$/)
      }
    }
  })

  it('las variantes cambian los tonos pero no la forma', () => {
    const vacias = HOJAS_DE_CORTINA.map((filas) => filas.map((f) => f.replace(/[^.]/g, 'x')))
    expect(vacias[1]).toEqual(vacias[0])
    expect(vacias[2]).toEqual(vacias[0])
    expect(HOJAS_DE_CORTINA[1]).not.toEqual(HOJAS_DE_CORTINA[0])
    expect(HOJAS_DE_CORTINA[2]).not.toEqual(HOJAS_DE_CORTINA[0])
  })

  it('cada hoja tiene nervio (otro tono dentro del cuerpo) y celdas vacías en las esquinas', () => {
    for (const filas of HOJAS_DE_CORTINA) {
      const todas = filas.join('')
      expect(new Set(todas.replace(/\./g, '')).size).toBe(2)
      expect(filas[0][0]).toBe('.')
      expect(filas[4][4]).toBe('.')
    }
  })
})
