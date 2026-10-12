// Cliente de la API del back: una función por ruta del contrato, con la URL del entorno.
import { obtenerEntorno, type Entorno } from '@/config/entorno'
import type { components } from './schema'

export type SectorColeccion = components['schemas']['SectorColeccion']
export type SectorFeature = components['schemas']['SectorFeature']
export type SectorPropiedades = components['schemas']['SectorPropiedades']

export type Arbol = components['schemas']['Arbol']

// El contrato 0.6.0 suma al resumen del árbol el DAP, la altura y el origen, con la misma definición
// que en la cartilla. Mientras los tipos generados siguen en la versión anterior, se tomó del tipo
// de la cartilla; al regenerar `schema.d.ts` con el contrato 0.6.0 esto se borra y los tres tipos de
// abajo vuelven a salir directo de `components['schemas']`.
type CamposDelResumenEn060 = Pick<Arbol, 'dap_cm' | 'altura_total_m' | 'origen'>
export type ArbolResumen = components['schemas']['ArbolResumen'] & CamposDelResumenEn060
export type ArbolFeature = Omit<components['schemas']['ArbolResumenFeature'], 'properties'> & {
  properties: ArbolResumen
}
export type ArbolColeccion = Omit<components['schemas']['ArbolResumenColeccion'], 'features'> & {
  features: ArbolFeature[]
}

// Rutas del contrato (relativas a VITE_API_URL)
const RUTA_SECTORES = '/sectores'
const PLANTILLA_RUTA_ARBOLES_DE_SECTOR = (sectorId: number) => `/sectores/${sectorId}/arboles`
const PLANTILLA_RUTA_ARBOL = (codigo: string) => `/arboles/${encodeURIComponent(codigo)}`

const ESTADO_OK = 200
const ESTADO_NO_ENCONTRADO = 404

export class ErrorApi extends Error {
  readonly estado: number

  constructor(ruta: string, estado: number) {
    super(`La API respondió ${estado} en ${ruta}.`)
    this.name = 'ErrorApi'
    this.estado = estado
  }
}

// La ruta pedida no existe (un sector o un árbol que no está en la base).
export class ErrorNoEncontrado extends ErrorApi {
  constructor(ruta: string) {
    super(ruta, ESTADO_NO_ENCONTRADO)
    this.name = 'ErrorNoEncontrado'
  }
}

export interface OpcionesPeticion {
  signal?: AbortSignal
  entorno?: Entorno
}

async function pedirJson<Respuesta>(ruta: string, opciones: OpcionesPeticion): Promise<Respuesta> {
  const { urlApi } = opciones.entorno ?? obtenerEntorno()
  const respuesta = await fetch(`${urlApi}${ruta}`, { signal: opciones.signal })
  if (respuesta.status === ESTADO_NO_ENCONTRADO) throw new ErrorNoEncontrado(ruta)
  if (respuesta.status !== ESTADO_OK) throw new ErrorApi(ruta, respuesta.status)
  return (await respuesta.json()) as Respuesta
}

export async function obtenerSectores(opciones: OpcionesPeticion = {}): Promise<SectorColeccion> {
  const entorno = opciones.entorno ?? obtenerEntorno()
  if (entorno.usarMocks) {
    const { sectoresMock } = await import('@/mocks')
    return sectoresMock
  }
  return pedirJson<SectorColeccion>(RUTA_SECTORES, { ...opciones, entorno })
}

export async function obtenerArbolesDeSector(
  sectorId: number,
  opciones: OpcionesPeticion = {},
): Promise<ArbolColeccion> {
  const entorno = opciones.entorno ?? obtenerEntorno()
  const ruta = PLANTILLA_RUTA_ARBOLES_DE_SECTOR(sectorId)
  if (entorno.usarMocks) {
    const { arbolesMockDelCampus } = await import('@/mocks')
    return arbolesMockDelCampus[sectorId] ?? { type: 'FeatureCollection', features: [] }
  }
  return pedirJson<ArbolColeccion>(ruta, { ...opciones, entorno })
}

export async function obtenerArbol(
  codigo: string,
  opciones: OpcionesPeticion = {},
): Promise<Arbol> {
  const entorno = opciones.entorno ?? obtenerEntorno()
  const ruta = PLANTILLA_RUTA_ARBOL(codigo)
  if (entorno.usarMocks) {
    const { arbolesMockPorCodigo } = await import('@/mocks')
    const arbol = arbolesMockPorCodigo[codigo]
    if (!arbol) throw new ErrorNoEncontrado(ruta)
    return arbol
  }
  return pedirJson<Arbol>(ruta, { ...opciones, entorno })
}
