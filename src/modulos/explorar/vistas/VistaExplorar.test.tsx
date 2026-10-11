import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ErrorApi,
  obtenerArbolesDeSector,
  obtenerSectores,
  type ArbolColeccion,
  type ArbolFeature,
  type ArbolResumen,
} from '@/api/cliente'
import { invalidarCacheCampus } from '@/compartido/cacheCampus'
import {
  PARAMETROS_URL,
  RUTAS,
  TEXTOS_CARTILLA,
  TEXTOS_DESTACADO,
  TEXTOS_ESTADOS,
  TEXTOS_EXPLORAR,
} from '@/config/constantes'
import { sectoresMock } from '@/mocks'
import { VistaExplorar } from './VistaExplorar'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerSectores: vi.fn(),
  obtenerArbolesDeSector: vi.fn(),
}))

const obtenerSectoresFalso = vi.mocked(obtenerSectores)
const obtenerArbolesFalso = vi.mocked(obtenerArbolesDeSector)

function feature(codigo: string, cambios: Partial<ArbolResumen> = {}): ArbolFeature {
  const propiedades: ArbolResumen = {
    codigo,
    uid: `uid-${codigo}`,
    sector: Number(codigo.slice(1, 3)),
    nombre_comun: null,
    nombre_cientifico: null,
    estado_general: null,
    foto_miniatura_url: null,
    demo: false,
    destacado: false,
    motivo_destacado: null,
    ...cambios,
  }
  return { type: 'Feature', id: codigo, geometry: null, properties: propiedades } as ArbolFeature
}

const MOTIVO = 'Ejemplar de más de cien años'
const ARBOLES_POR_SECTOR: Record<number, ArbolFeature[]> = {
  1: [
    feature('S01-A002', {
      nombre_comun: 'Palma real',
      nombre_cientifico: 'Roystonea regia',
      estado_general: 'Regular',
    }),
    feature('S01-A001', {
      nombre_comun: 'Molle',
      nombre_cientifico: 'Schinus molle',
      estado_general: 'Bueno',
    }),
  ],
  2: [
    feature('S02-A001', {
      nombre_comun: 'Huarango',
      nombre_cientifico: 'Prosopis pallida',
      estado_general: 'Regular',
      demo: true,
      destacado: true,
      motivo_destacado: MOTIVO,
      foto_miniatura_url: 'https://fotos.invalid/h.jpg',
    }),
    feature('S02-A002', { nombre_comun: 'Álamo' }),
  ],
}

function coleccion(sectorId: number): ArbolColeccion {
  return { type: 'FeatureCollection', features: ARBOLES_POR_SECTOR[sectorId] ?? [] }
}

function Sonda() {
  const { pathname, search } = useLocation()
  return <span data-testid="url">{`${pathname}${search}`}</span>
}

function ver(url: string = RUTAS.arboles) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <VistaExplorar />
      <Sonda />
    </MemoryRouter>,
  )
}

const urlActual = () => screen.getByTestId('url').textContent
const lista = () => screen.getByRole('list')
const filas = () => within(lista()).getAllByRole('listitem')
const contador = () => document.querySelector('.explorar__contador') as HTMLElement
const codigosVisibles = () =>
  filas().map((fila) => within(fila).getByRole('link').getAttribute('href'))

async function esperarLista() {
  await screen.findByRole('list')
}

describe('VistaExplorar', () => {
  beforeEach(() => {
    invalidarCacheCampus()
    obtenerSectoresFalso.mockResolvedValue(sectoresMock)
    obtenerArbolesFalso.mockImplementation(async (sectorId) => coleccion(sectorId))
  })
  afterEach(() => {
    obtenerSectoresFalso.mockReset()
    obtenerArbolesFalso.mockReset()
  })

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
    expect(contador()).toHaveTextContent('1 árbol')
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
    expect(fila.querySelector('.fila-arbol__estrella')).toHaveAttribute('aria-hidden', 'true')
    expect(within(fila).getByText(TEXTOS_CARTILLA.selloDemo)).toBeVisible()
    expect(fila.querySelector('img')).toHaveAttribute('src', 'https://fotos.invalid/h.jpg')
    expect(screen.queryByText(MOTIVO)).not.toBeInTheDocument()
    // Los de campo sin destacar no llevan ninguna de las dos marcas
    expect(within(filas()[0]).queryByText(TEXTOS_DESTACADO.etiqueta)).not.toBeInTheDocument()
    expect(within(filas()[0]).queryByText(TEXTOS_CARTILLA.selloDemo)).not.toBeInTheDocument()
    expect(filas()[0].querySelector('.glifo-pixel')).not.toBeNull()
  })

  describe('buscador', () => {
    it.each([
      ['código', 's02-a002', ['S02-A002']],
      ['nombre común', 'palma', ['S01-A002']],
      ['nombre científico', 'PROSOPIS', ['S02-A001']],
      ['sin tildes', 'alamo', ['S02-A002']],
    ])('busca por %s', async (_n, texto, esperados) => {
      ver()
      await esperarLista()
      fireEvent.change(screen.getByRole('searchbox'), { target: { value: texto } })
      expect(codigosVisibles().map((href) => href?.split('arbol=')[1])).toEqual(esperados)
    })

    it('escribir actualiza la URL', async () => {
      ver()
      await esperarLista()
      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'molle' } })
      expect(urlActual()).toBe(`${RUTAS.arboles}?q=molle`)
    })
  })

  describe('filtros', () => {
    it('las opciones de sector salen de la API y las de estado, de los valores que traen los árboles', async () => {
      ver()
      await esperarLista()
      const sector = screen.getByLabelText(TEXTOS_EXPLORAR.sector)
      const nombres = sectoresMock.features.map((s) => s.properties.nombre)
      expect(
        within(sector)
          .getAllByRole('option')
          .map((o) => o.textContent),
      ).toEqual([TEXTOS_EXPLORAR.todosSectores, ...nombres])
      const estado = screen.getByLabelText(TEXTOS_EXPLORAR.estado)
      expect(
        within(estado)
          .getAllByRole('option')
          .map((o) => o.textContent),
      ).toEqual([TEXTOS_EXPLORAR.todosEstados, 'Bueno', 'Regular'])
    })

    it('por sector', async () => {
      ver()
      await esperarLista()
      fireEvent.change(screen.getByLabelText(TEXTOS_EXPLORAR.sector), { target: { value: '2' } })
      expect(filas()).toHaveLength(2)
      expect(urlActual()).toBe(`${RUTAS.arboles}?sector=2`)
    })

    it('por estado general', async () => {
      ver()
      await esperarLista()
      fireEvent.change(screen.getByLabelText(TEXTOS_EXPLORAR.estado), {
        target: { value: 'Regular' },
      })
      expect(filas()).toHaveLength(2)
      expect(urlActual()).toBe(`${RUTAS.arboles}?estado=Regular`)
    })

    it('por destacado', async () => {
      ver()
      await esperarLista()
      fireEvent.click(screen.getByRole('checkbox', { name: TEXTOS_EXPLORAR.soloDestacados }))
      expect(filas()).toHaveLength(1)
      expect(urlActual()).toBe(`${RUTAS.arboles}?destacados=1`)
    })

    it('por origen del dato: campo y ejemplo', async () => {
      ver()
      await esperarLista()
      const origen = screen.getByLabelText(TEXTOS_EXPLORAR.origen)
      fireEvent.change(origen, { target: { value: 'ejemplo' } })
      expect(filas()).toHaveLength(1)
      expect(urlActual()).toBe(`${RUTAS.arboles}?origen=ejemplo`)
      fireEvent.change(origen, { target: { value: 'campo' } })
      expect(filas()).toHaveLength(3)
    })

    it('combinados se suman', async () => {
      ver()
      await esperarLista()
      fireEvent.change(screen.getByLabelText(TEXTOS_EXPLORAR.sector), { target: { value: '1' } })
      fireEvent.change(screen.getByLabelText(TEXTOS_EXPLORAR.estado), {
        target: { value: 'Regular' },
      })
      expect(filas()).toHaveLength(1)
      expect(urlActual()).toBe(`${RUTAS.arboles}?sector=1&estado=Regular`)
    })

    it('todos los controles tienen etiqueta visible', async () => {
      ver()
      await esperarLista()
      for (const etiqueta of [
        TEXTOS_EXPLORAR.buscar,
        TEXTOS_EXPLORAR.sector,
        TEXTOS_EXPLORAR.estado,
        TEXTOS_EXPLORAR.origen,
        TEXTOS_EXPLORAR.soloDestacados,
      ]) {
        expect(screen.getByLabelText(etiqueta)).toBeVisible()
      }
    })
  })

  describe('la URL manda', () => {
    it('abrir un enlace con filtros reproduce el estado en la lista y en los controles', async () => {
      ver(`${RUTAS.arboles}?q=a&origen=ejemplo&destacados=1&estado=Regular&sector=2`)
      await esperarLista()
      expect(filas()).toHaveLength(1)
      expect(screen.getByRole('searchbox')).toHaveValue('a')
      expect(screen.getByLabelText(TEXTOS_EXPLORAR.origen)).toHaveValue('ejemplo')
      expect(screen.getByLabelText(TEXTOS_EXPLORAR.sector)).toHaveValue('2')
      expect(screen.getByLabelText(TEXTOS_EXPLORAR.estado)).toHaveValue('Regular')
      expect(screen.getByRole('checkbox', { name: TEXTOS_EXPLORAR.soloDestacados })).toBeChecked()
    })
  })

  describe('sin resultados', () => {
    it('dice que nada coincide y «Limpiar filtros» borra todos los parámetros', async () => {
      ver()
      await esperarLista()
      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz' } })
      await waitFor(() => expect(screen.queryByRole('list')).not.toBeInTheDocument())
      expect(screen.getByText(TEXTOS_EXPLORAR.sinResultados)).toBeVisible()
      expect(contador()).toHaveTextContent('0 árboles')
      fireEvent.click(screen.getByRole('button', { name: TEXTOS_ESTADOS.limpiarFiltros }))
      expect(urlActual()).toBe(RUTAS.arboles)
      expect(filas()).toHaveLength(4)
      expect(screen.getByRole('searchbox')).toHaveValue('')
    })

    it('si de verdad no hay árboles lo dice, sin «Limpiar filtros» inventado', async () => {
      obtenerArbolesFalso.mockResolvedValue({ type: 'FeatureCollection', features: [] })
      ver()
      expect(await screen.findByText(TEXTOS_EXPLORAR.sinArboles)).toBeVisible()
      expect(screen.queryByRole('button', { name: TEXTOS_ESTADOS.limpiarFiltros })).toBeNull()
    })
  })
})
