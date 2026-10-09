// Cliente de la API del back: una función por ruta del contrato, con la URL del entorno.
import { obtenerEntorno, type Entorno } from '@/config/entorno'
import type { components } from './schema'

export type SectorColeccion = components['schemas']['SectorColeccion']
export type SectorFeature = components['schemas']['SectorFeature']
export type SectorPropiedades = components['schemas']['SectorPropiedades']

// Rutas del contrato (relativas a VITE_API_URL)
const RUTA_SECTORES = '/sectores'

const ESTADO_OK = 200

export class ErrorApi extends Error {
  readonly estado: number

  constructor(ruta: string, estado: number) {
    super(`La API respondió ${estado} en ${ruta}.`)
    this.name = 'ErrorApi'
    this.estado = estado
  }
}

export interface OpcionesPeticion {
  signal?: AbortSignal
  entorno?: Entorno
}

async function pedirJson<Respuesta>(ruta: string, opciones: OpcionesPeticion): Promise<Respuesta> {
  const { urlApi } = opciones.entorno ?? obtenerEntorno()
  const respuesta = await fetch(`${urlApi}${ruta}`, { signal: opciones.signal })
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
