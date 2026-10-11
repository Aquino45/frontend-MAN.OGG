import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ErrorApi,
  obtenerArbolesDeSector,
  obtenerSectores,
  type ArbolColeccion,
} from '@/api/cliente'
import { invalidarCacheCampus } from '@/compartido/cacheCampus'
import { TEXTOS_ARMAZON, URL_LICENCIA_ODBL } from '@/config/constantes'
import { arbolesMockPorSector, sectoresMock } from '@/mocks'
import { Pie } from './Pie'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerSectores: vi.fn(),
  obtenerArbolesDeSector: vi.fn(),
}))

const obtenerSectoresFalso = vi.mocked(obtenerSectores)
const obtenerArbolesFalso = vi.mocked(obtenerArbolesDeSector)
const SIN_ARBOLES: ArbolColeccion = { type: 'FeatureCollection', features: [] }

function verPie() {
  return render(
    <MemoryRouter>
      <Pie />
    </MemoryRouter>,
  )
}

// Todos los árboles del sector 1 pasan a ser de ejemplo: ningún sector queda con datos de campo.
function todosDeEjemplo(): ArbolColeccion {
  const base = arbolesMockPorSector[1]
  return {
    ...base,
    features: base.features.map((f) => ({ ...f, properties: { ...f.properties, demo: true } })),
  }
}

describe('Pie', () => {
  beforeEach(() => {
    invalidarCacheCampus()
    obtenerSectoresFalso.mockResolvedValue(sectoresMock)
    obtenerArbolesFalso.mockImplementation(
      async (sectorId) => arbolesMockPorSector[sectorId] ?? SIN_ARBOLES,
    )
  })
  afterEach(() => {
    obtenerSectoresFalso.mockReset()
    obtenerArbolesFalso.mockReset()
  })

  it('calcula la nota con los datos de la API: el sector 1 tiene campo y los demás solo ejemplo', async () => {
    verPie()
    const sectores = sectoresMock.features
    const esperada = `${sectores[0].properties.nombre} tiene datos de campo.`
    expect(await screen.findByText(new RegExp(`^${esperada}`))).toBeInTheDocument()
    expect(screen.getByText(/solo tienen datos de ejemplo\.$/)).toBeInTheDocument()
  })

  it('si todos son de ejemplo, lo dice sin nombrar sectores', async () => {
    obtenerArbolesFalso.mockImplementation(async (sectorId) =>
      sectorId === 1 ? todosDeEjemplo() : SIN_ARBOLES,
    )
    verPie()
    expect(
      await screen.findByText('Por ahora todos los sectores tienen solo datos de ejemplo.'),
    ).toBeInTheDocument()
  })

  it('mientras carga no afirma nada sobre los datos, pero sí trae el crédito', () => {
    obtenerSectoresFalso.mockReturnValue(new Promise(() => {}))
    verPie()
    expect(screen.queryByText(/datos de (campo|ejemplo)/)).not.toBeInTheDocument()
    expect(screen.getByText(new RegExp(TEXTOS_ARMAZON.creditoContorno))).toBeInTheDocument()
  })

  it('si la API falla no afirma nada y el crédito sigue', async () => {
    obtenerSectoresFalso.mockRejectedValue(new ErrorApi('/sectores', 503))
    verPie()
    await waitFor(() => expect(obtenerSectoresFalso).toHaveBeenCalled())
    await new Promise((resolver) => setTimeout(resolver, 0))
    expect(screen.queryByText(/datos de (campo|ejemplo)/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: TEXTOS_ARMAZON.nombreLicencia })).toBeInTheDocument()
  })

  it('si la API falló, un «Reintentar» de otra parte del sitio hace que el pie vuelva a pedir', async () => {
    obtenerSectoresFalso.mockRejectedValueOnce(new ErrorApi('/sectores', 503))
    verPie()
    await waitFor(() => expect(obtenerSectoresFalso).toHaveBeenCalledTimes(1))
    expect(screen.queryByText(/datos de (campo|ejemplo)/)).not.toBeInTheDocument()
    invalidarCacheCampus()
    expect(await screen.findByText(/tiene datos de campo\./)).toBeInTheDocument()
  })

  it('trae el crédito de OpenStreetMap con enlace real a la licencia ODbL', () => {
    verPie()
    const credito = screen.getByText(
      (_, elemento) =>
        elemento?.tagName === 'P' &&
        elemento.textContent ===
          `${TEXTOS_ARMAZON.creditoContorno} (${TEXTOS_ARMAZON.nombreLicencia})`,
    )
    expect(credito).toBeInTheDocument()
    const enlace = screen.getByRole('link', { name: TEXTOS_ARMAZON.nombreLicencia })
    expect(enlace).toHaveAttribute('href', URL_LICENCIA_ODBL)
    expect(URL_LICENCIA_ODBL).toMatch(/^https:\/\//)
  })

  it('es un contentinfo', () => {
    verPie()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('ningún texto fijo del código afirma qué sectores son reales', () => {
    expect(Object.keys(TEXTOS_ARMAZON)).not.toContain('notaDatos')
  })
})
