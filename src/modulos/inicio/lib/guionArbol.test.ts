import { describe, expect, it } from 'vitest'
import { ARBOL_ANIMADO as G } from '@/config/constantes'
import {
  CLAVE_DESTELLO,
  CLAVE_PARPADEO,
  CLAVE_RESPIRA,
  claveFila,
  claveTronco,
  duracionTotalCrecimiento,
  fotogramasHoja,
  fotogramasSacudida,
  planCrecimiento,
  planReposo,
  transformInclinacion,
  type PlanAnimacion,
} from './guionArbol'
import { FILAS_COPA, PASOS_TRONCO, SUELO_HOJA_Y } from './rejillaArbol'

const PROPIEDADES_PERMITIDAS = new Set(['transform', 'opacity', 'clipPath', 'offset'])

function propiedadesUsadas(planes: PlanAnimacion[], extra: Keyframe[] = []): string[] {
  const fotogramas = [...planes.flatMap(({ fotogramas }) => fotogramas), ...extra]
  return [...new Set(fotogramas.flatMap((fotograma) => Object.keys(fotograma)))]
}

describe('crecimiento del árbol', () => {
  const plan = planCrecimiento()
  const porClave = new Map(plan.map((paso) => [paso.clave, paso]))

  it('dura como máximo 1,6 s', () => {
    expect(duracionTotalCrecimiento()).toBeLessThanOrEqual(1600)
  })

  it('el tronco sube en pasos, de la base hacia arriba', () => {
    const retrasos = Array.from({ length: PASOS_TRONCO }, (_, paso) =>
      Number(porClave.get(claveTronco(paso))?.opciones.delay),
    )
    expect(retrasos).toEqual([...retrasos].sort((a, b) => a - b))
    expect(new Set(retrasos).size).toBe(PASOS_TRONCO)
  })

  it('la copa se arma de abajo hacia arriba con un escalonado de 30 a 80 ms', () => {
    const retrasos = FILAS_COPA.map(({ y }) => Number(porClave.get(claveFila(y))?.opciones.delay))
    for (let y = 1; y < retrasos.length; y++) {
      const diferencia = retrasos[y - 1] - retrasos[y]
      expect(diferencia).toBeGreaterThanOrEqual(30)
      expect(diferencia).toBeLessThanOrEqual(80)
    }
  })

  it('la copa empieza cuando el tronco ya casi llegó arriba', () => {
    const ultimoTronco = porClave.get(claveTronco(PASOS_TRONCO - 1))?.opciones
    const primeraFila = porClave.get(claveFila(FILAS_COPA.length - 1))?.opciones
    expect(Number(primeraFila?.delay)).toBeGreaterThanOrEqual(Number(ultimoTronco?.delay))
  })

  it('solo anima transform, opacity y clip-path', () => {
    for (const propiedad of propiedadesUsadas(plan)) {
      expect(PROPIEDADES_PERMITIDAS.has(propiedad), propiedad).toBe(true)
    }
  })
})

describe('reposo del árbol', () => {
  it('completo: mecido de cada fila, respiración, barrido de luz y parpadeo', () => {
    const claves = planReposo(true).map(({ clave }) => clave)
    for (const { y } of FILAS_COPA) expect(claves).toContain(claveFila(y))
    expect(claves).toEqual(expect.arrayContaining([CLAVE_RESPIRA, CLAVE_DESTELLO, CLAVE_PARPADEO]))
  })

  it('simple (red de seguridad): solo el mecido', () => {
    const claves = planReposo(false).map(({ clave }) => clave)
    expect(claves).toHaveLength(FILAS_COPA.length)
    expect(claves.every((clave) => clave.startsWith('fila-'))).toBe(true)
  })

  it('el mecido mueve más la punta que la base y nunca más de una celda', () => {
    const mecido = planReposo(false)
    const amplitud = (y: number) => {
      const fotograma = mecido.find(({ clave }) => clave === claveFila(y))?.fotogramas[1]
      return Math.abs(parseFloat(String(fotograma?.transform).replace('translateX(', '')))
    }
    expect(amplitud(0)).toBeCloseTo(G.meceoCeldas)
    expect(amplitud(FILAS_COPA.length - 1)).toBeCloseTo(G.meceoCeldas * G.meceoMinimoProporcion)
  })

  it('los ciclos son de 4 a 6 s en el mecido y de 10 s en el barrido', () => {
    const ciclo = ({ opciones }: PlanAnimacion) =>
      Number(opciones.duration) * 2 + (Number(opciones.endDelay) || 0)
    const mecido = planReposo(true).find(({ clave }) => clave === claveFila(0))
    expect(ciclo(mecido!)).toBe(G.meceoSentidoMs * 2)
    const barrido = planReposo(true).find(({ clave }) => clave === CLAVE_DESTELLO)
    expect(Number(barrido?.opciones.duration) + Number(barrido?.opciones.endDelay)).toBe(
      G.barridoCicloMs,
    )
  })

  it('solo anima transform, opacity y clip-path', () => {
    const extra = [
      ...fotogramasSacudida(),
      ...fotogramasHoja({ x: 3, y: 11, deriva: 0, duracionMs: 1, vaiven: true }),
    ]
    for (const propiedad of propiedadesUsadas(planReposo(true), extra)) {
      expect(PROPIEDADES_PERMITIDAS.has(propiedad), propiedad).toBe(true)
    }
  })
})

describe('hojas y respuesta', () => {
  it('una hoja suelta cae hasta el suelo y se desvanece', () => {
    const fotogramas = fotogramasHoja({ x: 3, y: 11, deriva: 0, duracionMs: 1, vaiven: true })
    const ultimo = fotogramas[fotogramas.length - 1]
    expect(ultimo.opacity).toBe(0)
    expect(ultimo.transform).toContain(`${SUELO_HOJA_Y - 11}px`)
  })

  it('una hoja de la ráfaga se desvía hacia su lado', () => {
    const fotogramas = fotogramasHoja({ x: 12, y: 12, deriva: 6, duracionMs: 1, vaiven: false })
    expect(fotogramas[fotogramas.length - 1].transform).toContain('translate(6px')
  })

  it('la inclinación llega a su máximo en los extremos y es simétrica', () => {
    expect(transformInclinacion(0)).toContain('rotate(0deg)')
    expect(transformInclinacion(1)).toContain(`rotate(${G.inclinacionGrados}deg)`)
    expect(transformInclinacion(-1)).toContain(`rotate(${-G.inclinacionGrados}deg)`)
  })
})
