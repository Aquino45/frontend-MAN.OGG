import { describe, expect, it } from 'vitest'
import { sectoresMock } from '@/mocks'
import { arbolesSector1Mock } from '@/mocks'
import {
  proyectarSectores,
  recuadroDe,
  puntoEnPoligono,
  puntoEtiqueta,
  type SectorGeografico,
} from './proyectar'

const OPCIONES = { ancho: 1000, margen: 20, decimales: 3, tamanoGlifo: 20, glifosPorSector: 3 }

function cuadrado(id: number, lon: number, lat: number, lado: number): SectorGeografico {
  return {
    id,
    geometry: {
      coordinates: [
        [
          [lon, lat],
          [lon + lado, lat],
          [lon + lado, lat + lado],
          [lon, lat + lado],
          [lon, lat],
        ],
      ],
    },
  }
}

// Vértices "x,y" de un trazado M…L…Z
function vertices(trazado: string) {
  return trazado
    .replace(/[MZ]/g, ' ')
    .split(/[L ]/)
    .filter(Boolean)
    .map((par) => {
      const [x, y] = par.split(',').map(Number)
      return { x, y }
    })
}

describe('proyectarSectores', () => {
  it('conserva la proporción real corrigiendo por la latitud', () => {
    const latitud = -12
    const { ancho, alto } = proyectarSectores([cuadrado(1, -76.84, latitud, 0.001)], OPCIONES)
    const proporcion = (ancho - 2 * OPCIONES.margen) / (alto - 2 * OPCIONES.margen)
    expect(proporcion).toBeCloseTo(Math.cos(((latitud + 0.0005) * Math.PI) / 180), 3)
  })

  it('deja el norte arriba y todo dentro del viewBox con su margen', () => {
    const proyeccion = proyectarSectores(sectoresMock.features, OPCIONES)
    for (const sector of proyeccion.sectores) {
      for (const { x, y } of vertices(sector.trazado)) {
        expect(x).toBeGreaterThanOrEqual(OPCIONES.margen - 0.01)
        expect(x).toBeLessThanOrEqual(proyeccion.ancho - OPCIONES.margen + 0.01)
        expect(y).toBeGreaterThanOrEqual(OPCIONES.margen - 0.01)
        expect(y).toBeLessThanOrEqual(proyeccion.alto - OPCIONES.margen + 0.01)
      }
    }
    const [abajo] = proyectarSectores(
      [cuadrado(1, 0, 0, 1), cuadrado(2, 0, 2, 1)],
      OPCIONES,
    ).sectores
    const arriba = proyectarSectores([cuadrado(1, 0, 0, 1), cuadrado(2, 0, 2, 1)], OPCIONES)
      .sectores[1]
    expect(arriba.etiqueta.y).toBeLessThan(abajo.etiqueta.y)
  })

  it('dibuja un trazado por sector con todos sus vértices, en el orden de los datos', () => {
    const proyeccion = proyectarSectores(sectoresMock.features, OPCIONES)
    expect(proyeccion.sectores.map((sector) => sector.id)).toEqual(
      sectoresMock.features.map((sector) => sector.id),
    )
    proyeccion.sectores.forEach((sector, indice) => {
      expect(sector.trazado).toMatch(/^M.*Z$/)
      expect(vertices(sector.trazado)).toHaveLength(
        sectoresMock.features[indice].geometry.coordinates[0].length,
      )
    })
  })

  it('pone la etiqueta y los glifos dentro de su sector', () => {
    for (const sector of proyectarSectores(sectoresMock.features, OPCIONES).sectores) {
      const anillo = vertices(sector.trazado)
      expect(puntoEnPoligono(sector.etiqueta, anillo)).toBe(true)
      for (const glifo of sector.glifos) expect(puntoEnPoligono(glifo, anillo)).toBe(true)
    }
  })

  it('si cambia un polígono, cambia el mapa', () => {
    const antes = proyectarSectores([cuadrado(1, 0, 0, 1), cuadrado(2, 1, 0, 1)], OPCIONES)
    const despues = proyectarSectores([cuadrado(1, 0, 0, 1), cuadrado(2, 1, 0, 2)], OPCIONES)
    expect(despues.sectores[0].trazado).not.toBe(antes.sectores[0].trazado)
    expect(despues.alto).not.toBe(antes.alto)
  })

  it('sin sectores devuelve un mapa vacío', () => {
    expect(proyectarSectores([], OPCIONES)).toMatchObject({ ancho: 1000, alto: 40, sectores: [] })
  })
})

describe('puntoEtiqueta', () => {
  it('en un polígono cóncavo (forma de U) cae dentro', () => {
    const forma = [
      { x: 0, y: 0 },
      { x: 30, y: 0 },
      { x: 30, y: 100 },
      { x: 70, y: 100 },
      { x: 70, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 110 },
      { x: 0, y: 110 },
    ]
    expect(puntoEnPoligono(puntoEtiqueta(forma), forma)).toBe(true)
  })
})

describe('puntos y recuadro de cada sector', () => {
  const proyeccion = proyectarSectores(sectoresMock.features, OPCIONES)

  it('un árbol del sector 1 cae dentro del trazado de su sector', () => {
    const sector1 = proyeccion.sectores.find((sector) => sector.id === 1)
    expect(sector1).toBeDefined()
    const anillo = vertices(sector1?.trazado ?? '')
    const conUbicacion = arbolesSector1Mock.features.filter((arbol) => arbol.geometry)
    expect(conUbicacion.length).toBeGreaterThan(0)
    for (const arbol of conUbicacion) {
      const [lon, lat] = arbol.geometry?.coordinates ?? [0, 0]
      expect(puntoEnPoligono(proyeccion.proyectarPosicion([lon, lat]), anillo)).toBe(true)
    }
  })

  it('el recuadro de cada sector lo contiene y tiene la proporción del mapa completo', () => {
    const proporcion = proyeccion.ancho / proyeccion.alto
    for (const sector of proyeccion.sectores) {
      const { x, y, ancho, alto } = sector.recuadro
      expect(ancho / alto).toBeCloseTo(proporcion, 6)
      for (const vertice of vertices(sector.trazado)) {
        expect(vertice.x).toBeGreaterThanOrEqual(x)
        expect(vertice.x).toBeLessThanOrEqual(x + ancho)
        expect(vertice.y).toBeGreaterThanOrEqual(y)
        expect(vertice.y).toBeLessThanOrEqual(y + alto)
      }
    }
  })
})

describe('recuadroDe', () => {
  const puntos = [
    { x: 10, y: 10 },
    { x: 30, y: 20 },
  ]

  it('agrega el margen y amplía el lado corto hasta la proporción pedida', () => {
    const ancho = recuadroDe(puntos, 5, 4)
    expect(ancho.ancho / ancho.alto).toBeCloseTo(4)
    expect(ancho.x + ancho.ancho / 2).toBeCloseTo(20)
    expect(ancho.y + ancho.alto / 2).toBeCloseTo(15)
    const alto = recuadroDe(puntos, 5, 0.5)
    expect(alto.ancho / alto.alto).toBeCloseTo(0.5)
    expect(alto.ancho).toBeGreaterThanOrEqual(30)
  })
})
