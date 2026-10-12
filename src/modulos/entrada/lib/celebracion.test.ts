import { describe, expect, it } from 'vitest'
import { CELEBRACION_ENTRADA as C } from '@/config/constantes'
import { piezasDeCelebracion } from './celebracion'

const PANTALLA = { anchoPx: 1440, altoPx: 900 }

function azarFijo(semilla: number) {
  let valor = semilla
  return () => {
    valor = (valor * 16807) % 2147483647
    return valor / 2147483647
  }
}

describe('piezasDeCelebracion', () => {
  it('da la cantidad pedida, con lados dentro del rango y colores dentro de las variantes', () => {
    const piezas = piezasDeCelebracion(PANTALLA, azarFijo(3))
    expect(piezas).toHaveLength(C.piezas)
    piezas.forEach((pieza) => {
      expect(pieza.ladoPx).toBeGreaterThanOrEqual(C.ladoMinPx)
      expect(pieza.ladoPx).toBeLessThanOrEqual(C.ladoMaxPx)
      expect(pieza.color).toBeGreaterThanOrEqual(0)
      expect(pieza.color).toBeLessThan(C.variantesDeColor)
      expect(pieza.retrasoMs).toBeGreaterThanOrEqual(0)
      expect(pieza.retrasoMs).toBeLessThanOrEqual(C.retrasoMaximoMs)
    })
  })

  it('salen de las dos esquinas de abajo, alternando, y suben hacia el centro', () => {
    const piezas = piezasDeCelebracion(PANTALLA, azarFijo(5))
    piezas.forEach((pieza, indice) => {
      const izquierda = indice % 2 === 0
      expect(pieza.origenY).toBe(PANTALLA.altoPx)
      expect(
        izquierda ? pieza.origenX < PANTALLA.anchoPx / 2 : pieza.origenX > PANTALLA.anchoPx / 2,
      ).toBe(true)
      // La cima está más arriba que el origen y más cerca del centro
      expect(pieza.cimaY).toBeLessThan(pieza.origenY)
      expect(Math.abs(pieza.cimaX - PANTALLA.anchoPx / 2)).toBeLessThan(
        Math.abs(pieza.origenX - PANTALLA.anchoPx / 2),
      )
    })
  })

  it('terminan cayendo por debajo del borde de abajo y el giro no pasa del máximo', () => {
    piezasDeCelebracion(PANTALLA, azarFijo(9)).forEach((pieza) => {
      expect(pieza.caidaY).toBeGreaterThan(PANTALLA.altoPx)
      expect(Math.abs(pieza.giroGrados)).toBeLessThanOrEqual(C.giroMaxGrados)
    })
  })

  it('con el mismo azar da lo mismo, y con otro azar, algo distinto', () => {
    expect(piezasDeCelebracion(PANTALLA, azarFijo(1))).toEqual(
      piezasDeCelebracion(PANTALLA, azarFijo(1)),
    )
    expect(piezasDeCelebracion(PANTALLA, azarFijo(1))).not.toEqual(
      piezasDeCelebracion(PANTALLA, azarFijo(2)),
    )
  })
})
