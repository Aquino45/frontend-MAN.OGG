import { lazy } from 'react'

// La vista de Árboles va en su propio chunk; `precargarVistaExplorar` la trae antes de que se pida
export const precargarVistaExplorar = () => import('./vistas/VistaExplorar')
export const VistaExplorar = lazy(() =>
  precargarVistaExplorar().then((modulo) => ({ default: modulo.VistaExplorar })),
)
