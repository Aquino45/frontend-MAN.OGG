import { lazy } from 'react'

// La vista de Cifras va en su propio chunk; `precargarVistaCifras` la trae antes de que se pida
export const precargarVistaCifras = () => import('./vistas/VistaCifras')
export const VistaCifras = lazy(() =>
  precargarVistaCifras().then((modulo) => ({ default: modulo.VistaCifras })),
)
