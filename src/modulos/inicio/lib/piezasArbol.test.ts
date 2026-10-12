import { describe, expect, it } from 'vitest'
import { CUADROS_REPOSO, DIBUJO_ARBOL, LADO_REJILLA_ARBOL } from './dibujoArbol'
import {
  COPA_BASE,
  copasReposo,
  ORIGENES_HOJA,
  PIEZAS_CUERPO,
  type PiezaArbol,
} from './piezasArbol'

// Cada tramo del trazo es «M x y h ancho v1 h -ancho z»
function celdasDeTrazo(trazo: string): Set<string> {
  const celdas = new Set<string>()
  for (const [, x, y, ancho] of trazo.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)) {
    for (let columna = 0; columna < Number(ancho); columna++) {
      celdas.add(`${Number(x) + columna},${y}`)
    }
  }
  return celdas
}

function celdasDe(piezas: readonly PiezaArbol[]): Set<string> {
  return new Set(
    piezas.flatMap((pieza) => pieza.capas.flatMap((capa) => [...celdasDeTrazo(capa.entera)])),
  )
}

// Celdas vacías rodeadas por la copa en 3 o 4 de sus lados: pixeles «rotos» o muescas de 1 celda
function pixelesRotos(copa: Set<string>): string[] {
  const rotos: string[] = []
  for (let y = 0; y < LADO_REJILLA_ARBOL; y++) {
    for (let x = 0; x < LADO_REJILLA_ARBOL; x++) {
      if (copa.has(`${x},${y}`)) continue
      const vecinas = [`${x + 1},${y}`, `${x - 1},${y}`, `${x},${y + 1}`, `${x},${y - 1}`]
      if (vecinas.filter((vecina) => copa.has(vecina)).length >= 3) rotos.push(`${x},${y}`)
    }
  }
  return rotos
}

describe('piezas del árbol', () => {
  it('las piezas salen del cuerpo a la copa', () => {
    const claves = [...PIEZAS_CUERPO, ...COPA_BASE].map((pieza) => pieza.clave)
    expect(claves).toEqual(['raices', 'tronco', 'ramas', 'atras', 'frente', 'brillos', 'nube'])
  })

  it('los cuadros del reposo se arman una sola vez', () => {
    expect(copasReposo()).toBe(copasReposo())
    expect(copasReposo()).toHaveLength(CUADROS_REPOSO.length)
  })

  it('cada capa es un solo trazo con celdas dentro de la rejilla', () => {
    for (const pieza of [...PIEZAS_CUERPO, ...COPA_BASE, ...copasReposo().flat()]) {
      for (const capa of pieza.capas) {
        expect(capa.entera.length).toBeGreaterThan(0)
        for (const celda of celdasDeTrazo(capa.entera)) {
          const [x, y] = celda.split(',').map(Number)
          expect(x).toBeGreaterThanOrEqual(0)
          expect(y).toBeGreaterThanOrEqual(0)
          expect(x).toBeLessThan(LADO_REJILLA_ARBOL)
          expect(y).toBeLessThan(LADO_REJILLA_ARBOL)
        }
      }
    }
  })

  it('el dibujo base no tiene pixeles rotos ni muescas de 1 celda', () => {
    expect(pixelesRotos(celdasDe(COPA_BASE))).toEqual([])
  })

  it.each(CUADROS_REPOSO.map((_, indice) => indice))(
    'el cuadro %i del reposo no deja pixeles rotos ni muescas de 1 celda',
    (indice) => {
      expect(pixelesRotos(celdasDe(copasReposo()[indice]))).toEqual([])
    },
  )

  it('el reposo tiene entre 3 y 4 cuadros contando el base', () => {
    expect(copasReposo().length + 1).toBeGreaterThanOrEqual(3)
    expect(copasReposo().length + 1).toBeLessThanOrEqual(4)
  })

  it('los corrimientos de cada cuadro son de una celda y siguen las listas del dibujo', () => {
    for (const cuadro of CUADROS_REPOSO) {
      expect(cuadro.atras).toHaveLength(DIBUJO_ARBOL.atras.length)
      expect(cuadro.frente).toHaveLength(DIBUJO_ARBOL.frente.length)
      expect(cuadro.salientes).toHaveLength(DIBUJO_ARBOL.salientes.length)
      expect(cuadro.brillos).toHaveLength(DIBUJO_ARBOL.brillos.length)
      for (const [dx, dy] of [
        ...cuadro.atras,
        ...cuadro.frente,
        ...cuadro.salientes,
        ...cuadro.brillos,
        cuadro.nube,
      ]) {
        expect(Math.abs(dx)).toBeLessThanOrEqual(1)
        expect(Math.abs(dy)).toBeLessThanOrEqual(1)
      }
    }
  })

  it('el tronco queda por debajo de la copa y la nubecita es una pastilla', () => {
    const [arriba, abajo] = DIBUJO_ARBOL.nube
    expect(abajo[2] - arriba[2]).toBe(2)
    expect(abajo[1] + 1).toBe(arriba[1])
  })

  it('las hojas salen del borde de abajo de la copa', () => {
    expect(ORIGENES_HOJA.length).toBeGreaterThanOrEqual(6)
    for (const origen of ORIGENES_HOJA) expect(['carmin', 'oscuro']).toContain(origen.clase)
  })
})
