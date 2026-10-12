// ÚNICO LUGAR DEL PROYECTO QUE LEE import.meta.env
import {
  CALLES_URL_TESELAS_POR_DEFECTO,
  SATELITE_URL_TESELAS_POR_DEFECTO,
  type BaseMapaReal,
} from './satelite'

export interface Entorno {
  urlApi: string
  usarMocks: boolean
}

type VariablesCrudas = Record<string, unknown>

function leerUsarMocks(valor: unknown): boolean {
  if (valor === 'true') return true
  if (valor === 'false') return false
  throw new Error(
    `VITE_USAR_MOCKS debe ser "true" o "false" (recibido: ${JSON.stringify(valor)}). Revisa tu .env.`,
  )
}

export function leerEntorno(variables: VariablesCrudas): Entorno {
  const urlApi = variables.VITE_API_URL
  if (typeof urlApi !== 'string' || urlApi.trim() === '') {
    throw new Error('Falta VITE_API_URL. Copia .env.example a .env y define la URL de la API.')
  }
  return { urlApi: urlApi.trim(), usarMocks: leerUsarMocks(variables.VITE_USAR_MOCKS) }
}

export function obtenerEntorno(): Entorno {
  return leerEntorno(import.meta.env)
}

const PROTOCOLOS_DE_PANEL = ['http:', 'https:']

// URL del panel de administración (opcional). Solo vale una dirección absoluta http o https; sin
// ella, o con cualquier otro valor, no hay panel al que ir.
export function leerUrlPanel(variables: VariablesCrudas): string | null {
  const valor = variables.VITE_URL_PANEL
  if (typeof valor !== 'string' || valor.trim() === '') return null
  try {
    const direccion = new URL(valor.trim())
    return PROTOCOLOS_DE_PANEL.includes(direccion.protocol) ? direccion.href : null
  } catch {
    return null
  }
}

export function obtenerUrlPanel(): string | null {
  return leerUrlPanel(import.meta.env)
}

export interface ConfigMapaReal {
  // Clave de Esri: sin ella no hay vista satelital (las calles no la necesitan)
  clave: string | null
  // Dirección de las teselas de cada base, con {z}, {y} y {x}
  urlsTeselas: Record<BaseMapaReal, string>
}

function textoOPorDefecto(valor: unknown, porDefecto: string): string {
  return typeof valor === 'string' && valor.trim() !== '' ? valor.trim() : porDefecto
}

// Vistas «Calles» (siempre) y «Satélite» (solo con la clave de Esri en VITE_ESRI_CLAVE).
export function leerConfigMapaReal(variables: VariablesCrudas): ConfigMapaReal {
  const clave = variables.VITE_ESRI_CLAVE
  return {
    clave: typeof clave === 'string' && clave.trim() !== '' ? clave.trim() : null,
    urlsTeselas: {
      satelite: textoOPorDefecto(variables.VITE_ESRI_URL_TESELAS, SATELITE_URL_TESELAS_POR_DEFECTO),
      calles: textoOPorDefecto(variables.VITE_URL_CALLES, CALLES_URL_TESELAS_POR_DEFECTO),
    },
  }
}

export function obtenerConfigMapaReal(): ConfigMapaReal {
  return leerConfigMapaReal(import.meta.env)
}
