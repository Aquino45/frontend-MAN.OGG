import { describe, expect, it } from 'vitest'
import { ARBOL_ANIMADO as G } from '@/config/constantes'
import {
  CICLO_REPOSO_MS,
  DURACION_CRECIMIENTO_MS,
  inicioDePiezaMs,
  planCuadro,
  planHoja,
  planPiezaChica,
  planPiezaEntera,
  planSacudida,
  secuenciaReposo,
  zigzag,
  type EspecificacionHoja,
} from './guionArbol'
import { COPAS_REPOSO, ORDEN_CRECIMIENTO } from './piezasArbol'

// Valor de la opacidad de un plan en un instante del ciclo (los saltos duplican el offset: el
// último valor con ese offset manda)
function opacidadEn(fotogramas: Keyframe[], instante: number): number {
  let valor = Number(fotogramas[0].opacity)
  for (const fotograma of fotogramas) {
    if (Number(fotograma.offset) <= instante) valor = Number(fotograma.opacity)
  }
  return valor
}

describe('crecimiento', () => {
  it('termina en 1,6 s o menos y el escalonado va de 80 a 120 ms', () => {
    expect(DURACION_CRECIMIENTO_MS).toBeLessThanOrEqual(1600)
    expect(G.escalonPiezaMs).toBeGreaterThanOrEqual(80)
    expect(G.escalonPiezaMs).toBeLessThanOrEqual(120)
  })

  it('las piezas brotan en el orden pedido', () => {
    expect([...ORDEN_CRECIMIENTO]).toEqual([
      'raices',
      'tronco',
      'ramas',
      'atras',
      'frente',
      'brillos',
      'nube',
    ])
    expect(inicioDePiezaMs('raices')).toBe(0)
    expect(inicioDePiezaMs('nube')).toBe(6 * G.escalonPiezaMs)
  })

  it('cada pieza brota en 2 cuadros: la chica y después la entera, en saltos', () => {
    const chica = planPiezaChica(240)
    const entera = planPiezaEntera(240)
    expect(chica.opciones.delay).toBe(240)
    expect(chica.opciones.duration).toBe(G.broteMs)
    expect(chica.opciones.easing).toBe('steps(1, end)')
    expect(entera.opciones.duration).toBe(240 + G.broteMs)
    expect(entera.opciones.easing).toBe('steps(1, end)')
    expect(entera.fotogramas.every((fotograma) => fotograma.opacity === 0)).toBe(true)
  })

  it('solo anima opacidad: nada de clip-path, giro ni escala', () => {
    for (const plan of [planPiezaChica(0), planPiezaEntera(0)]) {
      for (const fotograma of plan.fotogramas) {
        expect(Object.keys(fotograma)).toEqual(['opacity'])
      }
    }
  })
})

describe('reposo por cuadros', () => {
  it('cada cuadro dura de 180 a 250 ms y el base descansa más que cualquiera', () => {
    expect(G.cuadroMs).toBeGreaterThanOrEqual(180)
    expect(G.cuadroMs).toBeLessThanOrEqual(250)
    expect(G.pausaBaseMs).toBeGreaterThan(G.cuadroMs * 5)
  })

  it('la secuencia va y vuelve por los cuadros', () => {
    expect(secuenciaReposo()).toEqual([1, 2, 3, 2, 1])
    expect(CICLO_REPOSO_MS).toBe(G.pausaBaseMs + 5 * G.cuadroMs)
  })

  it('en cada instante se ve exactamente un cuadro de la copa', () => {
    const planes = Array.from({ length: COPAS_REPOSO.length + 1 }, (_, cuadro) =>
      planCuadro(cuadro),
    )
    for (let paso = 0; paso <= 1000; paso++) {
      const instante = paso / 1000
      const visibles = planes.reduce(
        (suma, plan) => suma + opacidadEn(plan.fotogramas, instante),
        0,
      )
      expect(visibles, `instante ${instante}`).toBe(1)
    }
  })

  it('los fotogramas van de menor a mayor offset y el ciclo se repite sin fin', () => {
    for (let cuadro = 0; cuadro <= COPAS_REPOSO.length; cuadro++) {
      const plan = planCuadro(cuadro)
      const offsets = plan.fotogramas.map((fotograma) => Number(fotograma.offset))
      expect(offsets[0]).toBe(0)
      expect(offsets[offsets.length - 1]).toBe(1)
      for (let i = 1; i < offsets.length; i++)
        expect(offsets[i]).toBeGreaterThanOrEqual(offsets[i - 1])
      expect(plan.opciones.iterations).toBe(Number.POSITIVE_INFINITY)
      expect(plan.opciones.duration).toBe(CICLO_REPOSO_MS)
    }
  })
})

describe('hojas', () => {
  const hoja: EspecificacionHoja = {
    x: 12,
    y: 20,
    clase: 'carmin',
    pasos: 10,
    derivaPorPaso: 0,
    retrasoMs: 0,
  }

  it('el zigzag es de 1 celda', () => {
    const lados = Array.from({ length: 8 }, (_, paso) => zigzag(paso))
    expect(lados).toEqual([0, 0, 1, 1, 0, 0, 1, 1])
  })

  it('baja de a una celda por paso, en saltos, y el último paso la quita', () => {
    const plan = planHoja(hoja)
    expect(plan.fotogramas).toHaveLength(hoja.pasos + 1)
    plan.fotogramas.forEach((fotograma, paso) => {
      expect(fotograma.transform).toMatch(new RegExp(`, ${paso}px\\)$`))
      expect(fotograma.easing).toBe('steps(1, end)')
    })
    expect(plan.fotogramas[hoja.pasos].opacity).toBe(0)
    expect(plan.opciones.duration).toBe(hoja.pasos * G.hojaPasoMs)
  })

  it('todos los desplazamientos son de celdas enteras', () => {
    const plan = planHoja({ ...hoja, derivaPorPaso: 0.5 })
    for (const fotograma of plan.fotogramas) {
      const numeros = String(fotograma.transform).match(/-?\d+(\.\d+)?/g) ?? []
      for (const numero of numeros) expect(Number.isInteger(Number(numero))).toBe(true)
    }
  })
})

describe('sacudida', () => {
  it('es de 1 celda a cada lado, en saltos y sin girar', () => {
    const plan = planSacudida()
    const desplazamientos = plan.fotogramas.map((fotograma) =>
      Number(/translate\((-?\d+)px/.exec(String(fotograma.transform))?.[1]),
    )
    expect(desplazamientos).toEqual([0, 1, -1, 1, 0])
    for (const fotograma of plan.fotogramas) {
      expect(String(fotograma.transform)).not.toMatch(/rotate|scale/)
    }
  })
})
