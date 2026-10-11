// Mantiene los filtros de la lista en la URL: recargar o compartir el enlace reproduce el estado
// y «atrás» vuelve al filtro anterior.
import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { escribirFiltros, FILTROS_VACIOS, leerFiltros, type FiltrosExplorar } from '../lib/filtros'

export interface FiltrosEnUrl {
  filtros: FiltrosExplorar
  // `reemplazar` cambia la entrada actual del historial en lugar de agregar otra (para el buscador)
  cambiar: (cambios: Partial<FiltrosExplorar>, reemplazar?: boolean) => void
  limpiar: () => void
}

export function useFiltrosEnUrl(): FiltrosEnUrl {
  const { pathname, search } = useLocation()
  const navegar = useNavigate()
  const filtros = useMemo(() => leerFiltros(search), [search])

  const cambiar = useCallback(
    (cambios: Partial<FiltrosExplorar>, reemplazar = false) =>
      navegar(
        { pathname, search: escribirFiltros({ ...filtros, ...cambios }) },
        { replace: reemplazar },
      ),
    [navegar, pathname, filtros],
  )
  const limpiar = useCallback(
    () => navegar({ pathname, search: escribirFiltros(FILTROS_VACIOS) }),
    [navegar, pathname],
  )

  return { filtros, cambiar, limpiar }
}
