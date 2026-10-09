// ÚNICO LUGAR DEL PROYECTO QUE LEE import.meta.env

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
