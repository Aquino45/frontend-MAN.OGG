// Estado compartido de las cápsulas «?» de una cartilla: cuál está abierta (solo una a la vez).
import { createContext, useContext } from 'react'
import type { Capsula } from '../lib/capsulas'

export interface ValorCapsulas {
  // Cápsulas que trajo la API, por campo
  capsulas: ReadonlyMap<string, Capsula>
  // Clave de la ayuda abierta, o null
  abierta: string | null
  // Verdadero si se abrió con clic o toque (no se cierra al sacar el cursor)
  fijada: boolean
  // Verdadero si el último cambio no se anima: un cierre con el teclado o pasar de una cápsula
  // abierta a la de al lado
  sinAnimacion: boolean
  abrir: (clave: string, fijada: boolean) => void
  cerrar: (porTeclado?: boolean) => void
}

const SIN_CAPSULAS: ValorCapsulas = {
  capsulas: new Map(),
  abierta: null,
  fijada: false,
  sinAnimacion: false,
  abrir: () => {},
  cerrar: () => {},
}

export const ContextoCapsulas = createContext<ValorCapsulas>(SIN_CAPSULAS)

export function useCapsulas(): ValorCapsulas {
  return useContext(ContextoCapsulas)
}
