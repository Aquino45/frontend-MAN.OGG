// Estado de la entrada del sitio para quien está debajo de ella (por ejemplo el árbol de Inicio,
// que espera a que termine para no competir con ella).
//   sin-entrada: no hay entrada (se llegó navegando)
//   en-curso:    la entrada todavía se ve
//   terminada:   la entrada ya dejó ver la página
import { createContext, useContext } from 'react'

export type EstadoEntrada = 'sin-entrada' | 'en-curso' | 'terminada'

export const ContextoEntrada = createContext<EstadoEntrada>('sin-entrada')

export function useEstadoEntrada(): EstadoEntrada {
  return useContext(ContextoEntrada)
}

export function useEntradaTerminada(): boolean {
  return useEstadoEntrada() !== 'en-curso'
}
