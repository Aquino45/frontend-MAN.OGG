import { describe, expect, it } from 'vitest'
import { repartirAngulos, trazoAnillo, trazoArco } from './trazosSvg'

describe('repartirAngulos', () => {
  it('reparte la vuelta en proporción y sin huecos', () => {
    const tramos = repartirAngulos([1, 1, 2], 0, 2 * Math.PI)
    expect(tramos[0]).toEqual({ desde: 0, hasta: Math.PI / 2 })
    expect(tramos[1].desde).toBe(tramos[0].hasta)
    expect(tramos[2].hasta).toBeCloseTo(2 * Math.PI)
  })

  it('un valor cero queda sin ángulo y si todos son cero, todos', () => {
    const tramos = repartirAngulos([0, 3], 0, Math.PI)
    expect(tramos[0].hasta - tramos[0].desde).toBe(0)
    expect(repartirAngulos([0, 0], 0, Math.PI).every((t) => t.hasta === t.desde)).toBe(true)
  })

  it('una media dona empieza donde se le diga', () => {
    const tramos = repartirAngulos([1, 1], Math.PI, Math.PI)
    expect(tramos[0].desde).toBe(Math.PI)
    expect(tramos[1].hasta).toBeCloseTo(2 * Math.PI)
  })
})

describe('trazos', () => {
  it('el anillo es un trazo cerrado con dos arcos', () => {
    const d = trazoAnillo(60, 60, 54, 34, 0, Math.PI / 2)
    expect(d.startsWith('M')).toBe(true)
    expect(d.endsWith('Z')).toBe(true)
    expect(d.match(/A/g)).toHaveLength(2)
  })

  it('usa el arco grande solo pasado media vuelta', () => {
    expect(trazoAnillo(0, 0, 10, 5, 0, 1)).toMatch(/A10 10 0 0 1/)
    expect(trazoAnillo(0, 0, 10, 5, 0, 4)).toMatch(/A10 10 0 1 1/)
    expect(trazoArco(0, 0, 10, 0, 1)).toMatch(/A10 10 0 0 1/)
    expect(trazoArco(0, 0, 10, 0, 4)).toMatch(/A10 10 0 1 1/)
  })

  it('los números llevan a lo más dos decimales', () => {
    const d = trazoArco(60, 60, 54, 0, 1.2345)
    for (const numero of d.match(/-?\d+\.\d+/g) ?? []) {
      expect(numero.split('.')[1].length).toBeLessThanOrEqual(2)
    }
  })
})
