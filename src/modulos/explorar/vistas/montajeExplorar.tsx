/* eslint-disable react-refresh/only-export-components -- auxiliar de pruebas, no es un módulo de la app */
// Montaje compartido de las pruebas de la página «Árboles»: datos de ejemplo, la API simulada y
// los auxiliares para mirar la lista y la URL. Cada archivo de pruebas declara su propio vi.mock
// de '@/api/cliente'.
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigate, useNavigationType } from 'react-router'
import { vi } from 'vitest'
import {
  obtenerArbolesDeSector,
  obtenerSectores,
  type ArbolColeccion,
  type ArbolFeature,
  type ArbolResumen,
} from '@/api/cliente'
import { invalidarCacheCampus } from '@/compartido/cacheCampus'
import { RUTAS } from '@/config/constantes'
import { sectoresMock } from '@/mocks'
import { VistaExplorar } from './VistaExplorar'

export const obtenerSectoresFalso = vi.mocked(obtenerSectores)
export const obtenerArbolesFalso = vi.mocked(obtenerArbolesDeSector)

export function feature(codigo: string, cambios: Partial<ArbolResumen> = {}): ArbolFeature {
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
    ...cambios,
  }
  return { type: 'Feature', id: codigo, geometry: null, properties: propiedades } as ArbolFeature
}

export const MOTIVO = 'Ejemplar de más de cien años'
const ARBOLES_POR_SECTOR: Record<number, ArbolFeature[]> = {
  1: [
    feature('S01-A002', {
      nombre_comun: 'Palma real',
      nombre_cientifico: 'Roystonea regia',
      estado_general: 'Regular',
    }),
    feature('S01-A001', {
      nombre_comun: 'Molle',
      nombre_cientifico: 'Schinus molle',
      estado_general: 'Bueno',
    }),
  ],
  2: [
    feature('S02-A001', {
      nombre_comun: 'Huarango',
      nombre_cientifico: 'Prosopis pallida',
      estado_general: 'Regular',
      demo: true,
      destacado: true,
      motivo_destacado: MOTIVO,
      foto_miniatura_url: 'https://fotos.invalid/h.jpg',
    }),
    feature('S02-A002', { nombre_comun: 'Álamo' }),
  ],
}

export function coleccion(sectorId: number): ArbolColeccion {
  return { type: 'FeatureCollection', features: ARBOLES_POR_SECTOR[sectorId] ?? [] }
}

function Sonda() {
  const { pathname, search } = useLocation()
  const navegar = useNavigate()
  const tipo = useNavigationType()
  return (
    <>
      <span data-testid="url">{`${pathname}${search}`}</span>
      <span data-testid="tipo-navegacion">{tipo}</span>
      <button type="button" onClick={() => navegar(-1)}>
        atrás-prueba
      </button>
    </>
  )
}

export function ver(url: string = RUTAS.arboles) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <VistaExplorar />
      <Sonda />
    </MemoryRouter>,
  )
}

export const urlActual = () => screen.getByTestId('url').textContent
export const tipoNavegacion = () => screen.getByTestId('tipo-navegacion').textContent
export const lista = () => screen.getByRole('list')
export const filas = () => within(lista()).getAllByRole('listitem')
export const contador = () => document.querySelector('.explorar__contador') as HTMLElement
export const codigosVisibles = () =>
  filas().map((fila) => within(fila).getByRole('link').getAttribute('href'))

export async function esperarLista() {
  await screen.findByRole('list')
}

// Deja la API simulada con los sectores del ejemplo y los árboles de `ARBOLES_POR_SECTOR`
export function prepararApi() {
  invalidarCacheCampus()
  obtenerSectoresFalso.mockResolvedValue(sectoresMock)
  obtenerArbolesFalso.mockImplementation(async (sectorId) => coleccion(sectorId))
}

export function reiniciarApi() {
  obtenerSectoresFalso.mockReset()
  obtenerArbolesFalso.mockReset()
}
