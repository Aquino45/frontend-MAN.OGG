import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorApi } from '@/api/cliente'
import {
  PARAMETROS_URL,
  RUTAS,
  TEXTOS_CARTILLA,
  TEXTOS_DESTACADO,
  TEXTOS_ESTADOS,
  TEXTOS_EXPLORAR,
} from '@/config/constantes'
import {
  codigosVisibles,
  contador,
  esperarLista,
  filas,
  MOTIVO,
  obtenerSectoresFalso,
  prepararApi,
  reiniciarApi,
  ver,
} from './montajeExplorar'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerSectores: vi.fn(),
  obtenerArbolesDeSector: vi.fn(),
}))

describe('VistaExplorar', () => {
  beforeEach(prepararApi)
  afterEach(reiniciarApi)

  it('tiene un solo h1 y la lista usa solo el resumen: no pide el detalle de ningún árbol', async () => {
    ver()
    await esperarLista()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: TEXTOS_EXPLORAR.titulo })).toBeVisible()
    expect(screen.getAllByRole('heading', { level: 2 }).map((t) => t.textContent)).toEqual([
      TEXTOS_EXPLORAR.resultados,
    ])
  })

  it('cargando muestra el esqueleto compartido y ningún número', () => {
    obtenerSectoresFalso.mockReturnValue(new Promise(() => {}))
    const { container } = ver()
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
    expect(container.querySelector('.estado-carga--lista')).not.toBeNull()
    expect(container.textContent).not.toMatch(/\d/)
  })

  it('con error dice qué falló y Reintentar vuelve a pedir', async () => {
    obtenerSectoresFalso.mockRejectedValueOnce(new ErrorApi('/sectores', 503))
    ver()
    expect(await screen.findByRole('alert')).toHaveTextContent(TEXTOS_EXPLORAR.error)
    fireEvent.click(screen.getByRole('button', { name: TEXTOS_ESTADOS.reintentar }))
    await esperarLista()
    expect(filas()).toHaveLength(4)
  })

  it('lista todos los árboles en orden estable (sector y código) con un enlace a /mapa cada uno', async () => {
    ver()
    await esperarLista()
    const esperados = ['S01-A001', 'S01-A002', 'S02-A001', 'S02-A002'].map((codigo) => {
      const sector = Number(codigo.slice(1, 3))
      const consulta = new URLSearchParams({
        [PARAMETROS_URL.sector]: String(sector),
        [PARAMETROS_URL.arbol]: codigo,
      })
      return `${RUTAS.mapa}?${consulta.toString()}`
    })
    expect(codigosVisibles()).toEqual(esperados)
  })

  it('el contador dice «N árboles» con plural correcto y avisa con aria-live polite', async () => {
    ver()
    await esperarLista()
    expect(contador()).toHaveAttribute('aria-live', 'polite')
    expect(contador()).toHaveTextContent('4 árboles')
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'molle' } })
    await waitFor(() => expect(contador()).toHaveTextContent('1 árbol'))
    expect(contador().textContent).not.toContain('árboles')
  })

  it('cada fila muestra nombre, científico en cursiva, código, sector y estado; «Sin dato» donde falta', async () => {
    ver()
    await esperarLista()
    const fila = filas()[0]
    expect(within(fila).getByText('Molle')).toBeVisible()
    expect(within(fila).getByText('Schinus molle').tagName).toBe('EM')
    expect(fila).toHaveTextContent('S01-A001 · Sector 1')
    expect(fila).toHaveTextContent(`${TEXTOS_CARTILLA.estado}: Bueno`)
    const sinNombre = filas()[3]
    expect(sinNombre.querySelectorAll('.sin-dato').length).toBeGreaterThanOrEqual(2)
  })

  it('un destacado de ejemplo lleva estrella, «Destacado», el sello y su miniatura, pero no el motivo', async () => {
    ver()
    await esperarLista()
    const fila = filas()[2]
    expect(within(fila).getByText(TEXTOS_DESTACADO.etiqueta)).toBeVisible()
    expect(fila.querySelector('.explorar-fila__estrella')).toHaveAttribute('aria-hidden', 'true')
    expect(within(fila).getByText(TEXTOS_CARTILLA.selloDemo)).toBeVisible()
    expect(fila.querySelector('img')).toHaveAttribute('src', 'https://fotos.invalid/h.jpg')
    expect(screen.queryByText(MOTIVO)).not.toBeInTheDocument()
    // Los de campo sin destacar no llevan ninguna de las dos marcas
    expect(within(filas()[0]).queryByText(TEXTOS_DESTACADO.etiqueta)).not.toBeInTheDocument()
    expect(within(filas()[0]).queryByText(TEXTOS_CARTILLA.selloDemo)).not.toBeInTheDocument()
    expect(filas()[0].querySelector('.glifo-pixel')).not.toBeNull()
  })
})
