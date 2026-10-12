// Los filtros del tablero viven en la URL (?sector=…&datos=…&especie=…&metrica=…): se pueden
// compartir y sobreviven a recargar la página. Cambiar un filtro reemplaza la entrada del historial,
// así «Atrás» no recorre cada clic.
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { escribirFiltros, leerFiltros, type FiltrosTablero } from '../lib/filtrosTablero'

export function useFiltrosTablero(sectoresConocidos: readonly number[]) {
  const [parametros, ponerParametros] = useSearchParams()
  // La lista cambia de identidad en cada render del padre: se compara por su contenido
  const clave = sectoresConocidos.join(',')
  const conocidos = useMemo(() => (clave === '' ? [] : clave.split(',').map(Number)), [clave])

  const filtros = useMemo(() => leerFiltros(parametros, conocidos), [parametros, conocidos])

  const cambiar = useCallback(
    (cambios: Partial<FiltrosTablero>) => {
      ponerParametros(
        (anteriores) =>
          escribirFiltros(anteriores, { ...leerFiltros(anteriores, conocidos), ...cambios }),
        { replace: true },
      )
    },
    [ponerParametros, conocidos],
  )

  return { filtros, cambiar }
}
