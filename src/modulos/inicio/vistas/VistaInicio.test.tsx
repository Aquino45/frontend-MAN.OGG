import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ErrorApi,
  obtenerArbolesDeSector,
  obtenerSectores,
  type ArbolColeccion,
} from '@/api/cliente'
import {
  NOMBRE_CAMPUS,
  PARAMETROS_URL,
  REGION_INTERFAZ,
  RUTAS,
  TEXTOS_INICIO,
} from '@/config/constantes'
import { arbolesMockPorSector, sectoresMock } from '@/mocks'
import arbolesSector1Json from '@/mocks/sector-1-arboles.json'
import { VistaInicio } from './VistaInicio'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerSectores: vi.fn(),
  obtenerArbolesDeSector: vi.fn(),
}))

const obtenerSectoresFalso = vi.mocked(obtenerSectores)
const obtenerArbolesFalso = vi.mocked(obtenerArbolesDeSector)
const SIN_ARBOLES: ArbolColeccion = { type: 'FeatureCollection', features: [] }
const formato = new Intl.NumberFormat(REGION_INTERFAZ)

function pedirTodoConMocks() {
  obtenerSectoresFalso.mockResolvedValue(sectoresMock)
  obtenerArbolesFalso.mockImplementation(
    async (sectorId) => arbolesMockPorSector[sectorId] ?? SIN_ARBOLES,
  )
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

describe('VistaInicio', () => {
  beforeEach(() => {
    obtenerSectoresFalso.mockReset()
    obtenerArbolesFalso.mockReset()
  })
  afterEach(() => vi.clearAllMocks())

  it('cargando: se ven los esqueletos y no hay ningún dígito en sectores, cifras ni antetítulo', () => {
    obtenerSectoresFalso.mockReturnValue(new Promise(() => {}))
    const { container } = verInicio()

    expect(regionFranja().querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(regionCifras().querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(container.querySelectorAll('.inicio-cifras__esqueleto')).toHaveLength(
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
    ).toEqual([TEXTOS_INICIO.tituloFranja, TEXTOS_INICIO.tituloCifras])
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
    expect(screen.queryByText(/destacados/i)).not.toBeInTheDocument()
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
    fireEvent.click(within(regionFranja()).getByRole('button', { name: TEXTOS_INICIO.reintentar }))
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
    fireEvent.click(within(regionCifras()).getByRole('button', { name: TEXTOS_INICIO.reintentar }))
    await within(regionCifras()).findByRole('list')
    expect(obtenerArbolesFalso.mock.calls.length).toBeGreaterThan(llamadasAntes)
    expect(obtenerSectoresFalso).toHaveBeenCalledTimes(1)
  })
})
