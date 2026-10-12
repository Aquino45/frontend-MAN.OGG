// Función que cambia de página dentro de una transición; null si no hay proveedor.
import { createContext } from 'react'

export type NavegarConTransicion = (destino: string) => void

export const ContextoTransicion = createContext<NavegarConTransicion | null>(null)
