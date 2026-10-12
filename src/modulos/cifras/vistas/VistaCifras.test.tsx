import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ErrorApi,
  obtenerArbolesDeSector,
  obtenerSectores,
  type ArbolColeccion,
  type ArbolFeature,
  type ArbolResumen,
} from '@/api/cliente'
import { invalidarCacheCampus } from '@/compartido/cacheCampus'
import { SEPARADOR_MILES, TEXTOS_CIFRAS, TEXTOS_ESTADOS } from '@/config/constantes'
import { sectoresMock } from '@/mocks'
import { VistaCifras } from './VistaCifras'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerSectores: vi.fn(),
  obtenerArbolesDeSector: vi.fn(),
}))

const obtenerSectoresFalso = vi.mocked(obtenerSectores)
const obtenerArbolesFalso = vi.mocked(obtenerArbolesDeSector)

function feature(codigo: string, cambios: Partial<ArbolResumen> = {}): ArbolFeature {
  const propiedades: ArbolResumen = {
    codigo,
    uid: `uid-${codigo}`,
    sector: Number(codigo.slice(1, 3)),
    nombre_comun: null,
    nombre_cientifico: null,
    estado_general: null,
    foto_miniatura_url: null,
    demo: false,
    destacado: false,
    motivo_destacado: null,
    co2_almacenado_kg: null,
    co2_captura_anual_kg: null,
    co2_simulado: false,
    ...cambios,
  }
  return { type: 'Feature', id: codigo, geometry: null, properties: propiedades } as ArbolFeature
}

const ARBOLES_POR_SECTOR: Record<number, ArbolFeature[]> = {
  1: [
    feature('S01-A001', {
      nombre_cientifico: 'Schinus molle',
      estado_general: 'Bueno',
      co2_almacenado_kg: 800,
      co2_captura_anual_kg: 40,
      co2_simulado: true,
    }),
    feature('S01-A002', {
      nombre_cientifico: 'Schinus molle',
      estado_general: 'Regular',
      co2_almacenado_kg: 200,
      co2_captura_anual_kg: 10,
      co2_simulado: true,
    }),
    feature('S01-A003'),
  ],
  2: [
    feature('S02-A001', {
      nombre_cientifico: 'Prosopis pallida',
      estado_general: 'Regular',
      demo: true,
      destacado: true,
      co2_almacenado_kg: 30_000,
      co2_captura_anual_kg: 300,
      co2_simulado: true,
    }),
    feature('S02-A002', { demo: true }),
  ],
}

function coleccion(sectorId: number): ArbolColeccion {
  return { type: 'FeatureCollection', features: ARBOLES_POR_SECTOR[sectorId] ?? [] }
}

function ver() {
  return render(
    <MemoryRouter>
      <VistaCifras />
    </MemoryRouter>,
  )
}

// Cuatro bloques de conteos y cuatro de CO₂, cada uno con su tabla; siete son gráficos de barras (el ranking es una lista)
const TABLAS_TOTALES = 8
const GRAFICOS_DE_BARRAS = 7

const filasDe = (nombreTabla: string) =>
  [...screen.getByRole('table', { name: nombreTabla }).querySelectorAll('tbody tr')].map((fila) =>
    [...fila.querySelectorAll('th, td')].map((celda) => celda.textContent),
  )

describe('VistaCifras', () => {
  beforeEach(() => {
    invalidarCacheCampus()
    obtenerSectoresFalso.mockResolvedValue(sectoresMock)
    obtenerArbolesFalso.mockImplementation(async (sectorId) => coleccion(sectorId))
  })
  afterEach(() => {
    obtenerSectoresFalso.mockReset()
    obtenerArbolesFalso.mockReset()
  })

  it('un solo h1 y un h2 por bloque, en orden', async () => {
    ver()
    await screen.findByRole('table', { name: TEXTOS_CIFRAS.porSector.descripcion })
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(TEXTOS_CIFRAS.titulo)
    expect(screen.getAllByRole('heading', { level: 2 }).map((t) => t.textContent)).toEqual([
      TEXTOS_CIFRAS.resumen,
      TEXTOS_CIFRAS.porSector.titulo,
      TEXTOS_CIFRAS.porEstado.titulo,
      TEXTOS_CIFRAS.porEspecie.titulo,
      TEXTOS_CIFRAS.destacados.titulo,
      TEXTOS_CIFRAS.co2.titulo,
    ])
  })

  it('el resumen separa campo y ejemplo, sin ningún total que los mezcle', async () => {
    ver()
    const resumen = (await screen.findByRole('region', {
      name: TEXTOS_CIFRAS.resumen,
    })) as HTMLElement
    expect(
      within(resumen).getByText(TEXTOS_CIFRAS.arbolesDeCampo).nextElementSibling,
    ).toHaveTextContent('3')
    expect(
      within(resumen).getByText(TEXTOS_CIFRAS.arbolesDeEjemplo).nextElementSibling,
    ).toHaveTextContent('2')
    expect(within(resumen).queryByText(TEXTOS_CIFRAS.total)).not.toBeInTheDocument()
    expect(screen.getByText(TEXTOS_CIFRAS.notaSeparados)).toBeVisible()
  })

  it('las tablas traen los números calculados de los árboles de la API, campo y ejemplo aparte', async () => {
    ver()
    await screen.findByRole('table', { name: TEXTOS_CIFRAS.porSector.descripcion })
    const sectores = filasDe(TEXTOS_CIFRAS.porSector.descripcion)
    expect(sectores[0]).toEqual(['Sector 1', '3', '0', '3'])
    expect(sectores[1]).toEqual(['Sector 2', '0', '2', '2'])
    expect(sectores).toHaveLength(sectoresMock.features.length)
    expect(filasDe(TEXTOS_CIFRAS.porEstado.descripcion)).toEqual([
      ['Regular', '1', '1', '2'],
      [expect.any(String), '1', '1', '2'],
      ['Bueno', '1', '0', '1'],
    ])
    expect(filasDe(TEXTOS_CIFRAS.porEspecie.descripcion)).toEqual([
      ['Schinus molle', '2', '0', '2'],
      ['Prosopis pallida', '0', '1', '1'],
      [TEXTOS_CIFRAS.sinEspecie, '1', '1', '2'],
    ])
    expect(filasDe(TEXTOS_CIFRAS.destacados.descripcion)[1]).toEqual(['Sector 2', '0', '1', '1'])
  })

  it('cada bloque tiene un gráfico decorativo y su tabla accesible', async () => {
    const { container } = ver()
    await screen.findByRole('table', { name: TEXTOS_CIFRAS.porSector.descripcion })
    expect(screen.getAllByRole('table')).toHaveLength(TABLAS_TOTALES)
    expect(container.querySelectorAll('.cifras-grafico[aria-hidden="true"]')).toHaveLength(
      GRAFICOS_DE_BARRAS,
    )
  })

  it('el CO₂ se suma por sector con campo y ejemplo aparte y dice que es simulado', async () => {
    ver()
    await screen.findByRole('table', { name: TEXTOS_CIFRAS.co2.almacenadoPorSector.descripcion })
    expect(screen.getByText(TEXTOS_CIFRAS.co2.simulado)).toBeVisible()
    const sectores = filasDe(TEXTOS_CIFRAS.co2.almacenadoPorSector.descripcion)
    expect(sectores[0]).toEqual([
      'Sector 1',
      `1${SEPARADOR_MILES}000 kg CO₂e`,
      '0 kg CO₂e',
      `1${SEPARADOR_MILES}000 kg CO₂e`,
    ])
    expect(sectores[1]).toEqual(['Sector 2', '0 kg CO₂e', '30.0 t CO₂e', '30.0 t CO₂e'])
    expect(screen.getAllByText(TEXTOS_CIFRAS.co2.sinDato.replace('{n}', '2'))).not.toHaveLength(0)
  })

  it('el ranking enlaza a la cartilla de cada árbol', async () => {
    ver()
    const enlace = await screen.findByRole('link', {
      name: TEXTOS_CIFRAS.co2.verEnMapa.replace('{codigo}', 'S02-A001'),
    })
    expect(enlace).toHaveAttribute('href', '/mapa?sector=2&arbol=S02-A001')
  })

  it('sin valores simulados no aparece el encabezado de estimaciones simuladas', async () => {
    obtenerArbolesFalso.mockImplementation(async (sectorId) => ({
      type: 'FeatureCollection',
      features: coleccion(sectorId).features.map((arbol) =>
        feature(arbol.properties.codigo, { ...arbol.properties, co2_simulado: false }),
      ),
    }))
    ver()
    await screen.findByRole('table', { name: TEXTOS_CIFRAS.co2.almacenadoPorSector.descripcion })
    expect(screen.queryByText(TEXTOS_CIFRAS.co2.simulado)).not.toBeInTheDocument()
  })

  it('cargando muestra el esqueleto compartido y ningún número', () => {
    obtenerSectoresFalso.mockReturnValue(new Promise(() => {}))
    const { container } = ver()
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
    expect(container.textContent).not.toMatch(/\d/)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('con error dice qué falló y Reintentar vuelve a pedir', async () => {
    obtenerSectoresFalso.mockRejectedValueOnce(new ErrorApi('/sectores', 503))
    ver()
    expect(await screen.findByRole('alert')).toHaveTextContent(TEXTOS_CIFRAS.error)
    fireEvent.click(screen.getByRole('button', { name: TEXTOS_ESTADOS.reintentar }))
    expect(await screen.findAllByRole('table')).toHaveLength(TABLAS_TOTALES)
  })

  it('sin árboles muestra el estado vacío y ninguna cifra', async () => {
    obtenerArbolesFalso.mockResolvedValue({ type: 'FeatureCollection', features: [] })
    ver()
    expect(await screen.findByText(TEXTOS_CIFRAS.sinArboles)).toBeVisible()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.queryByText(TEXTOS_CIFRAS.arbolesDeCampo)).not.toBeInTheDocument()
  })
})
