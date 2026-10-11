import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ErrorApi,
  obtenerArbol,
  obtenerArbolesDeSector,
  obtenerSectores,
  type ArbolColeccion,
} from '@/api/cliente'
import { invalidarCacheCampus } from '@/compartido/cacheCampus'
import {
  CANTIDAD_DESTACADOS_INICIO,
  NOMBRE_CAMPUS,
  PARAMETROS_URL,
  REGION_INTERFAZ,
  RUTAS,
  TEXTOS_ESTADOS,
  TEXTOS_INICIO,
} from '@/config/constantes'
import { arbolDemoMock, arbolesMockPorSector, sectoresMock } from '@/mocks'
import arbolesSector1Json from '@/mocks/sector-1-arboles.json'
import { VistaInicio } from './VistaInicio'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerSectores: vi.fn(),
  obtenerArbolesDeSector: vi.fn(),
  obtenerArbol: vi.fn(),
}))

const obtenerSectoresFalso = vi.mocked(obtenerSectores)
const obtenerArbolesFalso = vi.mocked(obtenerArbolesDeSector)
const obtenerArbolFalso = vi.mocked(obtenerArbol)
const SIN_ARBOLES: ArbolColeccion = { type: 'FeatureCollection', features: [] }
const formato = new Intl.NumberFormat(REGION_INTERFAZ)

function pedirTodoConMocks() {
  obtenerSectoresFalso.mockResolvedValue(sectoresMock)
  obtenerArbolesFalso.mockImplementation(
    async (sectorId) => arbolesMockPorSector[sectorId] ?? SIN_ARBOLES,
  )
  obtenerArbolFalso.mockResolvedValue(arbolDemoMock)
}

function verInicio() {
  return render(
    <MemoryRouter>
      <VistaInicio />
    </MemoryRouter>,
  )
}

const regionFranja = () => screen.getByRole('region', { name: TEXTOS_INICIO.tituloFranja })
const regionCifras = () => screen.getByRole('region', { name: TEXTOS_INICIO.tituloCifras })
const regionDestacados = () => screen.getByRole('region', { name: TEXTOS_INICIO.tituloDestacados })

// Lo esperado se calcula leyendo el JSON del mock del sector 1, nunca a mano.
const arbolesDelMock = arbolesSector1Json.features
const deCampoEsperado = arbolesDelMock.filter((arbol) => !arbol.properties.demo).length
const deEjemploEsperado = arbolesDelMock.filter((arbol) => arbol.properties.demo).length
const especiesEsperadas = new Set(
  arbolesDelMock
    .filter((arbol) => !arbol.properties.demo)
    .map((arbol) => arbol.properties.nombre_cientifico?.trim())
    .filter(Boolean),
).size

// Los destacados esperados salen del JSON del mock, ordenados por código, con el máximo de Inicio.
const destacadosEsperados = arbolesDelMock
  .filter((arbol) => arbol.properties.destacado)
  .map((arbol) => arbol.properties.codigo)
  .sort()
  .slice(0, CANTIDAD_DESTACADOS_INICIO)

describe('VistaInicio', () => {
  beforeEach(() => {
    obtenerSectoresFalso.mockReset()
    obtenerArbolesFalso.mockReset()
    obtenerArbolFalso.mockReset()
    invalidarCacheCampus()
  })
  afterEach(() => vi.clearAllMocks())

  it('cargando: se ven los esqueletos y no hay ningún dígito en sectores, cifras ni antetítulo', () => {
    obtenerSectoresFalso.mockReturnValue(new Promise(() => {}))
    const { container } = verInicio()

    expect(regionFranja().querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(regionCifras().querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(container.querySelectorAll('.estado-carga__cifra')).toHaveLength(
      Object.keys(TEXTOS_INICIO.cifras).length,
    )
    expect(regionFranja().textContent).not.toMatch(/\d/)
    expect(regionCifras().textContent).not.toMatch(/\d/)
    expect(container.querySelector('.inicio-portada__antetitulo')?.textContent).not.toMatch(/\d/)
    expect(container.querySelector('.inicio-mapa')).toBeNull()
    expect(obtenerArbolesFalso).not.toHaveBeenCalled()
  })

  it('con sectores listos y árboles cargando, el mapa ya se ve con el total de la API y las cifras esperan', async () => {
    obtenerSectoresFalso.mockResolvedValue(sectoresMock)
    obtenerArbolesFalso.mockReturnValue(new Promise(() => {}))
    verInicio()

    const enlaces = await within(regionFranja()).findAllByRole('link', { name: /^Sector \d/ })
    expect(enlaces).toHaveLength(sectoresMock.features.length)
    expect(enlaces[0]).toHaveAccessibleName(/118 árboles/)
    expect(regionCifras().querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(regionCifras().textContent).not.toMatch(/\d/)
  })

  it('listo con los mocks: las 4 cifras y los sectores como enlaces a /mapa?sector=<id>', async () => {
    pedirTodoConMocks()
    verInicio()

    const lista = await within(regionCifras()).findByRole('list')
    const items = within(lista).getAllByRole('listitem')
    expect(items).toHaveLength(4)
    expect(items[0]).toHaveTextContent(formato.format(deCampoEsperado))
    expect(items[0]).toHaveTextContent(TEXTOS_INICIO.cifras.arbolesDeCampo.etiqueta)
    expect(items[1]).toHaveTextContent(formato.format(sectoresMock.features.length))
    expect(items[2]).toHaveTextContent(formato.format(especiesEsperadas))
    expect(items[3]).toHaveTextContent(formato.format(deEjemploEsperado))

    const enlaces = within(regionFranja()).getAllByRole('link', { name: /^Sector \d/ })
    expect(enlaces).toHaveLength(sectoresMock.features.length)
    sectoresMock.features.forEach((sector, indice) => {
      const consulta = new URLSearchParams({ [PARAMETROS_URL.sector]: String(sector.id) })
      expect(enlaces[indice]).toHaveAttribute('href', `${RUTAS.mapa}?${consulta.toString()}`)
    })
    // Con los conteos listos, el sector 1 dice cuántos son de campo y cuántos de ejemplo
    const textoSector1 = regionFranja().querySelectorAll('.inicio-sector__texto')[0]
    expect(textoSector1).toHaveTextContent(`${deCampoEsperado} ${TEXTOS_INICIO.conteoDeCampo}`)
    expect(textoSector1).toHaveTextContent(`${deEjemploEsperado} ${TEXTOS_INICIO.conteoDeEjemplo}`)
    expect(obtenerArbolesFalso).toHaveBeenCalledTimes(sectoresMock.features.length)
  })

  it('el antetítulo de la portada usa la cantidad de sectores de la API', async () => {
    pedirTodoConMocks()
    const { container } = verInicio()
    await waitFor(() =>
      expect(container.querySelector('.inicio-portada__antetitulo')).toHaveTextContent(
        `${NOMBRE_CAMPUS} · ${TEXTOS_INICIO.ciudad} · ${sectoresMock.features.length} ${TEXTOS_INICIO.sectorPlural}`,
      ),
    )
  })

  it('un solo h1 y los h2 en orden', async () => {
    pedirTodoConMocks()
    verInicio()
    await within(regionCifras()).findByRole('list')
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(
      screen.getAllByRole('heading', { level: 2 }).map((titulo) => titulo.textContent),
    ).toEqual([
      TEXTOS_INICIO.tituloFranja,
      TEXTOS_INICIO.tituloCifras,
      TEXTOS_INICIO.tituloDestacados,
    ])
  })

  it('los destacados salen de la API: una tarjeta enlace por árbol destacado, en orden estable', async () => {
    pedirTodoConMocks()
    verInicio()
    const enlaces = await within(regionDestacados()).findAllByRole('link')
    expect(destacadosEsperados.length).toBeGreaterThan(0)
    expect(enlaces).toHaveLength(destacadosEsperados.length)
    destacadosEsperados.forEach((codigo, indice) => {
      const consulta = new URLSearchParams({
        [PARAMETROS_URL.sector]: '1',
        [PARAMETROS_URL.arbol]: codigo,
      })
      expect(enlaces[indice]).toHaveAttribute('href', `${RUTAS.mapa}?${consulta.toString()}`)
    })
    // Los encabezados siguen en orden: h1, h2 y luego h3 solo dentro de las tarjetas
    expect(within(regionDestacados()).getAllByRole('heading', { level: 3 })).toHaveLength(
      destacadosEsperados.length,
    )
  })

  it('pide el detalle (DAP y altura) solo de las tarjetas mostradas', async () => {
    pedirTodoConMocks()
    verInicio()
    await within(regionDestacados()).findAllByRole('link')
    await waitFor(() => expect(obtenerArbolFalso).toHaveBeenCalledTimes(destacadosEsperados.length))
    expect(obtenerArbolFalso.mock.calls.map(([codigo]) => codigo).sort()).toEqual(
      destacadosEsperados,
    )
    expect(await within(regionDestacados()).findAllByText(/ cm$/)).toHaveLength(
      destacadosEsperados.length,
    )
  })

  it('si el detalle falla, la tarjeta sigue siendo enlace y dice «Sin dato»', async () => {
    pedirTodoConMocks()
    obtenerArbolFalso.mockRejectedValue(new ErrorApi('/arboles/x', 503))
    verInicio()
    const enlaces = await within(regionDestacados()).findAllByRole('link')
    await waitFor(() =>
      expect(
        regionDestacados().querySelectorAll('.destacado-tarjeta__medidas .sin-dato'),
      ).toHaveLength(destacadosEsperados.length * 2),
    )
    expect(enlaces).toHaveLength(destacadosEsperados.length)
  })

  it('sin árboles destacados el bloque dice que aún no hay, sin acciones', async () => {
    obtenerSectoresFalso.mockResolvedValue(sectoresMock)
    obtenerArbolesFalso.mockResolvedValue(SIN_ARBOLES)
    verInicio()
    expect(await within(regionDestacados()).findByText(TEXTOS_INICIO.sinDestacados)).toBeVisible()
    expect(within(regionDestacados()).queryByRole('button')).not.toBeInTheDocument()
  })

  it('cargando: el bloque de destacados muestra su esqueleto sin números', () => {
    obtenerSectoresFalso.mockReturnValue(new Promise(() => {}))
    verInicio()
    expect(within(regionDestacados()).getByRole('status')).toHaveAttribute('aria-busy', 'true')
    expect(regionDestacados().textContent).not.toMatch(/\d/)
  })

  it('si falla la API, los destacados muestran su error y Reintentar lo vuelve a pedir', async () => {
    obtenerSectoresFalso.mockRejectedValue(new ErrorApi('/sectores', 503))
    verInicio()
    expect(await within(regionDestacados()).findByRole('alert')).toHaveTextContent(
      TEXTOS_INICIO.errorDestacados,
    )
    pedirTodoConMocks()
    fireEvent.click(
      within(regionDestacados()).getByRole('button', { name: TEXTOS_ESTADOS.reintentar }),
    )
    expect(await within(regionDestacados()).findAllByRole('link')).toHaveLength(
      destacadosEsperados.length,
    )
  })

  it('«Ver destacados» de la portada apunta al título del bloque, aunque esté en error', async () => {
    obtenerSectoresFalso.mockRejectedValue(new ErrorApi('/sectores', 503))
    verInicio()
    await within(regionDestacados()).findByRole('alert')
    const ancla = screen.getByRole('link', { name: TEXTOS_INICIO.verDestacados })
    const titulo = within(regionDestacados()).getByRole('heading', { level: 2 })
    expect(ancla).toHaveAttribute('href', `#${titulo.id}`)
    fireEvent.click(ancla)
    expect(titulo).toHaveFocus()
  })

  it('si fallan los sectores, la portada sigue y la franja y las cifras muestran su error', async () => {
    obtenerSectoresFalso.mockRejectedValue(new ErrorApi('/sectores', 503))
    verInicio()

    expect(await within(regionFranja()).findByRole('alert')).toHaveTextContent(
      TEXTOS_INICIO.errorSectores,
    )
    expect(within(regionCifras()).getByRole('alert')).toHaveTextContent(TEXTOS_INICIO.errorCifras)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: TEXTOS_INICIO.explorarMapa })[0]).toBeInTheDocument()
    expect(obtenerArbolesFalso).not.toHaveBeenCalled()

    // Reintentar en la franja vuelve a pedir los sectores y todo se llena
    pedirTodoConMocks()
    fireEvent.click(within(regionFranja()).getByRole('button', { name: TEXTOS_ESTADOS.reintentar }))
    await within(regionCifras()).findByRole('list')
    expect(within(regionFranja()).getAllByRole('link', { name: /^Sector \d/ })).toHaveLength(
      sectoresMock.features.length,
    )
  })

  it('si fallan solo los árboles, el mapa se ve y las cifras muestran su error con Reintentar', async () => {
    obtenerSectoresFalso.mockResolvedValue(sectoresMock)
    obtenerArbolesFalso.mockRejectedValue(new ErrorApi('/sectores/1/arboles', 503))
    verInicio()

    expect(await within(regionCifras()).findByRole('alert')).toHaveTextContent(
      TEXTOS_INICIO.errorCifras,
    )
    expect(within(regionFranja()).getAllByRole('link', { name: /^Sector \d/ })).toHaveLength(
      sectoresMock.features.length,
    )
    expect(within(regionFranja()).queryByRole('alert')).not.toBeInTheDocument()
    const llamadasAntes = obtenerArbolesFalso.mock.calls.length

    pedirTodoConMocks()
    fireEvent.click(within(regionCifras()).getByRole('button', { name: TEXTOS_ESTADOS.reintentar }))
    await within(regionCifras()).findByRole('list')
    expect(obtenerArbolesFalso.mock.calls.length).toBeGreaterThan(llamadasAntes)
    expect(obtenerSectoresFalso).toHaveBeenCalledTimes(1)
  })
})
