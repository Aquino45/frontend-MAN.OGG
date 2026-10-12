import { lazy } from 'react'

// La vista del mapa va en su propio chunk; `precargarVistaMapa` la trae antes de que se pida
export const precargarVistaMapa = () => import('./vistas/VistaMapa')
export const VistaMapa = lazy(() =>
  precargarVistaMapa().then((modulo) => ({ default: modulo.VistaMapa })),
)
export { PROPORCION_MAPA } from './vistas/proporcionMapa'
export { proyectarSectores, type Proyeccion, type SectorProyectado } from './lib/proyectar'
export { nombreAccesibleSector, textoTotalArboles } from './lib/textosSector'
export { escribirSeleccion, tieneSeleccion } from './lib/seleccionUrl'
