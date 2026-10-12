// Cómo le avisa Inicio a la entrada que hubo un clic en el árbol (abre la ventana en la que se puede
// forzar la variante alterna a mano). Sin proveedor, no hace nada.
import { createContext, useContext } from 'react'

export interface ControlDeEntrada {
  clicEnArbol: () => void
}

export const ContextoForzarEntrada = createContext<ControlDeEntrada>({ clicEnArbol: () => {} })

export function useForzarEntrada(): ControlDeEntrada {
  return useContext(ContextoForzarEntrada)
}
