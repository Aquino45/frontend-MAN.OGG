import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useLocation, useNavigationType } from 'react-router'
import { describe, expect, it } from 'vitest'
import { RUTAS } from '@/config/constantes'
import { useFiltrosEnUrl } from './useFiltrosEnUrl'

function montar(url: string) {
  function Envoltorio({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  }
  return renderHook(
    () => ({
      filtros: useFiltrosEnUrl(),
      ubicacion: useLocation(),
      tipo: useNavigationType(),
    }),
    { wrapper: Envoltorio },
  )
}

describe('useFiltrosEnUrl', () => {
  it('lee los filtros de la URL al montar', () => {
    const { result } = montar(`${RUTAS.arboles}?q=molle&sector=2&destacados=1`)
    expect(result.current.filtros.filtros).toMatchObject({
      busqueda: 'molle',
      sectorId: 2,
      soloDestacados: true,
    })
  })

  it('cambiar un filtro escribe la URL y agrega una entrada al historial', () => {
    const { result } = montar(RUTAS.arboles)
    act(() => result.current.filtros.cambiar({ sectorId: 3 }))
    expect(result.current.ubicacion.pathname).toBe(RUTAS.arboles)
    expect(result.current.ubicacion.search).toBe('?sector=3')
    expect(result.current.tipo).toBe('PUSH')
    expect(result.current.filtros.filtros.sectorId).toBe(3)
  })

  it('escribir en el buscador reemplaza la entrada para no llenar el historial', () => {
    const { result } = montar(RUTAS.arboles)
    act(() => result.current.filtros.cambiar({ busqueda: 'mo' }, true))
    expect(result.current.ubicacion.search).toBe('?q=mo')
    expect(result.current.tipo).toBe('REPLACE')
  })

  it('cambiar un filtro conserva los demás', () => {
    const { result } = montar(`${RUTAS.arboles}?sector=1`)
    act(() => result.current.filtros.cambiar({ origen: 'campo' }))
    expect(result.current.ubicacion.search).toBe('?sector=1&origen=campo')
  })

  it('limpiar borra todos los parámetros', () => {
    const { result } = montar(
      `${RUTAS.arboles}?q=a&sector=1&estado=Bueno&destacados=1&origen=campo`,
    )
    act(() => result.current.filtros.limpiar())
    expect(result.current.ubicacion.search).toBe('')
    expect(result.current.filtros.filtros.busqueda).toBe('')
  })
})
