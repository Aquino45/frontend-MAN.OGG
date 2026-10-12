/* eslint-disable react-refresh/only-export-components -- auxiliar de pruebas, no es un módulo de la app */
// Lo que comparten los tests de la vista de Cifras: los árboles de ejemplo, el montaje y las ayudas.
import { render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import { afterEach, beforeEach, vi } from 'vitest'
import {
  obtenerArbolesDeSector,
  obtenerSectores,
  type ArbolColeccion,
  type ArbolFeature,
} from '@/api/cliente'
import { invalidarCacheCampus } from '@/compartido/cacheCampus'
import { TEXTOS_TABLERO } from '@/config/tablero'
import { sectoresMock } from '@/mocks'
import { arbolDePrueba } from '../lib/fabricasDePrueba'
import { VistaCifras } from './VistaCifras'

export const obtenerSectoresFalso = vi.mocked(obtenerSectores)
export const obtenerArbolesFalso = vi.mocked(obtenerArbolesDeSector)

// Como en los datos reales: el mayor DAP de todos es de un árbol de ejemplo y el de campo es otro
const ARBOLES_POR_SECTOR: Record<number, ArbolFeature[]> = {
  1: [
    arbolDePrueba('S01-A001', {
      nombre_comun: 'Molle',
      nombre_cientifico: 'Schinus molle',
      estado_general: 'Regular',
      dap_cm: 392,
      altura_total_m: 12,
      origen: 'Nativa',
      co2_almacenado_kg: 800,
      co2_captura_anual_kg: 40,
      co2_simulado: true,
    }),
    arbolDePrueba('S01-A002', {
      nombre_comun: 'Palma real',
      nombre_cientifico: 'Roystonea regia',
      estado_general: 'Bueno',
      dap_cm: 75,
      altura_total_m: 5.5,
      origen: 'Introducida / exótica',
      co2_almacenado_kg: 200,
      co2_captura_anual_kg: 10,
      co2_simulado: true,
    }),
    arbolDePrueba('S01-A003', { nombre_cientifico: 'Roystonea regia', origen: 'Nativa' }),
  ],
  2: [
    arbolDePrueba('S02-D001', {
      demo: true,
      nombre_comun: 'Molle',
      nombre_cientifico: 'Schinus molle',
      estado_general: 'Bueno',
      dap_cm: 422,
      altura_total_m: 9,
      origen: 'Nativa',
      co2_almacenado_kg: 30_000,
      co2_captura_anual_kg: 300,
      co2_simulado: true,
    }),
    arbolDePrueba('S02-D002', {
      demo: true,
      nombre_comun: 'Huarango',
      nombre_cientifico: 'Prosopis pallida',
      estado_general: 'Malo',
      dap_cm: 110,
      altura_total_m: 5,
      origen: 'Introducida / exótica',
    }),
  ],
}

const coleccion = (sectorId: number): ArbolColeccion => ({
  type: 'FeatureCollection',
  features: ARBOLES_POR_SECTOR[sectorId] ?? [],
})

function Ubicacion() {
  return <span data-testid="ubicacion">{useLocation().search}</span>
}

export function ver(ruta = '/cifras') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <VistaCifras />
      <Ubicacion />
    </MemoryRouter>,
  )
}

export const busqueda = () => new URLSearchParams(screen.getByTestId('ubicacion').textContent ?? '')
export const kpi = (nombre: string) => screen.getByRole('group', { name: nombre })
export const esperarTablero = () =>
  screen.findByRole('group', { name: TEXTOS_TABLERO.kpis.arboles })
export const tarjeta = (titulo: string) => screen.getByRole('region', { name: titulo })

export function prepararApi() {
  beforeEach(() => {
    invalidarCacheCampus()
    obtenerSectoresFalso.mockResolvedValue(sectoresMock)
    obtenerArbolesFalso.mockImplementation(async (sectorId) => coleccion(sectorId))
  })
  afterEach(() => {
    obtenerSectoresFalso.mockReset()
    obtenerArbolesFalso.mockReset()
  })
}
