// Arranca antes del primer dibujo: el código del mapa y los sectores se piden a la vez, sin esperar
// a que React monte la vista. Quien los necesita después los encuentra ya pedidos.
import { RUTAS } from '@/config/constantes'
import { cargarSectores } from '@/compartido/cacheCampus'
import { precargarVistaMapa } from '@/modulos/mapa'

export function arrancarCargaTemprana(pathname: string): void {
  if (pathname !== RUTAS.mapa && pathname !== RUTAS.inicio) return
  if (pathname === RUTAS.mapa) void precargarVistaMapa()
  // El error se ve donde se use; aquí solo se adelanta la petición
  cargarSectores().catch(() => undefined)
}
