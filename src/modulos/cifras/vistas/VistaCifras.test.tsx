import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ErrorApi,
  obtenerArbolesDeSector,
  obtenerSectores,
  type ArbolColeccion,
  type ArbolFeature,
} from '@/api/cliente'
import { invalidarCacheCampus } from '@/compartido/cacheCampus'
import { TEXTOS_CIFRAS, TEXTOS_ESTADOS, TEXTOS_TABLERO } from '@/config/constantes'
import { sectoresMock } from '@/mocks'
import { arbolDePrueba } from '../lib/fabricasDePrueba'
import { VistaCifras } from './VistaCifras'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerSectores: vi.fn(),
  obtenerArbolesDeSector: vi.fn(),
}))

const obtenerSectoresFalso = vi.mocked(obtenerSectores)
const obtenerArbolesFalso = vi.mocked(obtenerArbolesDeSector)

// Como en los datos reales: el mayor DAP de todos es de un árbol de ejemplo y el de campo es otro
const ARBOLES_POR_SECTOR: Record<number, ArbolFeature[]> = {
  1: [
    arbolDePrueba('S01-A001', {
      nombre_comun: 'Molle',
      nombre_cientifico: 'Schinus molle',
      estado_general: 'Regular',
      dap_cm: 392,
      altura_total_m: 12,
      origen: 'Nativa',
      co2_almacenado_kg: 800,
      co2_captura_anual_kg: 40,
      co2_simulado: true,
    }),
    arbolDePrueba('S01-A002', {
      nombre_comun: 'Palma real',
      nombre_cientifico: 'Roystonea regia',
      estado_general: 'Bueno',
      dap_cm: 75,
      altura_total_m: 5.5,
      origen: 'Introducida / exótica',
      co2_almacenado_kg: 200,
      co2_captura_anual_kg: 10,
      co2_simulado: true,
    }),
    arbolDePrueba('S01-A003', { nombre_cientifico: 'Roystonea regia', origen: 'Nativa' }),
  ],
  2: [
    arbolDePrueba('S02-D001', {
      demo: true,
      nombre_comun: 'Molle',
      nombre_cientifico: 'Schinus molle',
      estado_general: 'Bueno',
      dap_cm: 422,
      altura_total_m: 9,
      origen: 'Nativa',
      co2_almacenado_kg: 30_000,
      co2_captura_anual_kg: 300,
      co2_simulado: true,
    }),
    arbolDePrueba('S02-D002', {
      demo: true,
      nombre_comun: 'Huarango',
      nombre_cientifico: 'Prosopis pallida',
      estado_general: 'Malo',
      dap_cm: 110,
      altura_total_m: 5,
      origen: 'Introducida / exótica',
    }),
  ],
}

const coleccion = (sectorId: number): ArbolColeccion => ({
  type: 'FeatureCollection',
  features: ARBOLES_POR_SECTOR[sectorId] ?? [],
})

function Ubicacion() {
  return <span data-testid="ubicacion">{useLocation().search}</span>
}

function ver(ruta = '/cifras') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <VistaCifras />
      <Ubicacion />
    </MemoryRouter>,
  )
}

const busqueda = () => new URLSearchParams(screen.getByTestId('ubicacion').textContent ?? '')
const kpi = (nombre: string) => screen.getByRole('group', { name: nombre })
const esperarTablero = () => screen.findByRole('group', { name: TEXTOS_TABLERO.kpis.arboles })
const tarjeta = (titulo: string) => screen.getByRole('region', { name: titulo })

function prepararApi() {
  beforeEach(() => {
    invalidarCacheCampus()
    obtenerSectoresFalso.mockResolvedValue(sectoresMock)
    obtenerArbolesFalso.mockImplementation(async (sectorId) => coleccion(sectorId))
  })
  afterEach(() => {
    obtenerSectoresFalso.mockReset()
    obtenerArbolesFalso.mockReset()
  })
}

describe('VistaCifras: estados', () => {
  prepararApi()

  it('mientras carga muestra un esqueleto sin números, y el título siempre', () => {
    obtenerSectoresFalso.mockReturnValue(new Promise(() => {}))
    ver()
    expect(
      screen.getByRole('heading', { level: 1, name: TEXTOS_CIFRAS.titulo }),
    ).toBeInTheDocument()
    const estado = screen.getByRole('status')
    expect(estado).toHaveAttribute('aria-busy', 'true')
    expect(estado.textContent).not.toMatch(/\d/)
  })

  it('si falla la API muestra el error y Reintentar vuelve a pedir', async () => {
    obtenerSectoresFalso.mockRejectedValueOnce(new ErrorApi('/sectores', 503))
    ver()
    fireEvent.click(await screen.findByRole('button', { name: TEXTOS_ESTADOS.reintentar }))
    expect(await esperarTablero()).toBeInTheDocument()
  })

  it('sin árboles dice que aún no hay registrados', async () => {
    obtenerArbolesFalso.mockResolvedValue({ type: 'FeatureCollection', features: [] })
    ver()
    expect(await screen.findByText(TEXTOS_CIFRAS.sinArboles)).toBeInTheDocument()
  })
})

describe('VistaCifras: el tablero', () => {
  prepararApi()

  it('trae los seis resúmenes y los filtros', async () => {
    ver()
    await esperarTablero()
    const textos = TEXTOS_TABLERO.kpis
    for (const nombre of [
      textos.arboles,
      textos.especies,
      textos.co2,
      textos.captura,
      textos.mayorDap,
      textos.nativas,
    ]) {
      expect(kpi(nombre)).toBeInTheDocument()
    }
    expect(screen.getByRole('group', { name: TEXTOS_TABLERO.filtros.grupo })).toBeInTheDocument()
  })

  it('campo y ejemplo se cuentan por separado, nunca sumados', async () => {
    ver()
    await esperarTablero()
    const arboles = kpi(TEXTOS_TABLERO.kpis.arboles)
    const lineas = [...arboles.querySelectorAll('.tablero-kpi__linea')].map((l) => l.textContent)
    expect(lineas).toEqual([`3${TEXTOS_TABLERO.kpis.campo}`, `2${TEXTOS_TABLERO.kpis.ejemplo}`])
    expect(within(arboles).queryByText('5')).not.toBeInTheDocument()
  })

  it('«Mayor DAP» separa campo y ejemplo, con enlace a la cartilla de cada uno', async () => {
    ver()
    await esperarTablero()
    const mayor = kpi(TEXTOS_TABLERO.kpis.mayorDap)
    expect(within(mayor).getByRole('link', { name: /S01-A001/ })).toHaveAttribute(
      'href',
      '/mapa?sector=1&arbol=S01-A001',
    )
    expect(within(mayor).getByRole('link', { name: /S02-D001/ })).toHaveAttribute(
      'href',
      '/mapa?sector=2&arbol=S02-D001',
    )
    expect(mayor).toHaveTextContent('392')
    expect(mayor).toHaveTextContent('422')
  })

  it('«Nativas» separa campo y ejemplo', async () => {
    ver()
    await esperarTablero()
    const nativas = kpi(TEXTOS_TABLERO.kpis.nativas)
    // Campo: 2 nativas de 3 (67 %); ejemplo: 1 de 2 (50 %)
    expect(nativas).toHaveTextContent('67 %')
    expect(nativas).toHaveTextContent('50 %')
    expect(nativas).toHaveTextContent('2 de 3')
    expect(nativas).toHaveTextContent('1 de 2')
  })

  it('el CO₂ va marcado como simulado y separado en campo y ejemplo', async () => {
    ver()
    await esperarTablero()
    const co2 = kpi(TEXTOS_TABLERO.kpis.co2)
    expect(within(co2).getByText(TEXTOS_TABLERO.kpis.simulado)).toBeInTheDocument()
    expect(co2).toHaveTextContent(TEXTOS_TABLERO.kpis.campo)
    expect(co2).toHaveTextContent(TEXTOS_TABLERO.kpis.ejemplo)
  })

  it('cada gráfico trae su tabla, plegada bajo él', async () => {
    ver()
    await esperarTablero()
    for (const titulo of [
      TEXTOS_TABLERO.mapaCalor.titulo,
      TEXTOS_TABLERO.especies.titulo,
      TEXTOS_TABLERO.estado.titulo,
      TEXTOS_TABLERO.nativas.titulo,
      TEXTOS_TABLERO.dispersion.titulo,
      TEXTOS_TABLERO.histograma.titulo,
    ]) {
      const unaTarjeta = tarjeta(titulo)
      expect(unaTarjeta.querySelector('details.tablero-tabla summary')).not.toBeNull()
      expect(unaTarjeta.querySelector('table')).not.toBeNull()
    }
  })

  it('la tabla de la dispersión lista los árboles con su DAP y su altura', async () => {
    ver()
    await esperarTablero()
    const filas = [...tarjeta(TEXTOS_TABLERO.dispersion.titulo).querySelectorAll('tbody tr')].map(
      (fila) => fila.textContent,
    )
    expect(filas.some((fila) => fila?.includes('S02-D001') && fila.includes('422'))).toBe(true)
  })

  it('la dispersión pone un enlace por árbol con medidas, y el de ejemplo va marcado', async () => {
    ver()
    await esperarTablero()
    const dispersion = tarjeta(TEXTOS_TABLERO.dispersion.titulo)
    // Cuatro de los cinco árboles tienen DAP y altura
    expect(dispersion.querySelectorAll('a.tablero-punto')).toHaveLength(4)
    const deEjemplo = dispersion.querySelector('a.tablero-punto[href*="S02-D001"]')
    expect(deEjemplo).toHaveAttribute('data-ejemplo', 'si')
    expect(deEjemplo).toHaveAttribute('aria-label', expect.stringContaining('DAP 422 cm'))
    expect(dispersion.textContent).toContain('1 árbol sin DAP o sin altura no aparece')
  })

  it('el histograma cuenta campo y ejemplo aparte y avisa de los que no tienen DAP', async () => {
    ver()
    await esperarTablero()
    const histograma = tarjeta(TEXTOS_TABLERO.histograma.titulo)
    expect(histograma.textContent).toContain('1 árbol sin DAP no aparece')
    const filas = [...histograma.querySelectorAll('tbody tr')].map((fila) =>
      [...fila.querySelectorAll('th, td')].map((celda) => celda.textContent),
    )
    // Campo: 75 y 392; ejemplo: 110 y 422
    expect(filas.find((fila) => fila[0] === '50 a 100')).toEqual(['50 a 100', '1', '0'])
    expect(filas.find((fila) => fila[0] === '100 a 150')).toEqual(['100 a 150', '0', '1'])
  })
})

describe('VistaCifras: los filtros viven en la URL', () => {
  prepararApi()

  const botonDeSector = (nombre: string) =>
    within(screen.getByRole('group', { name: TEXTOS_TABLERO.filtros.sector })).getByRole('button', {
      name: nombre,
    })
  const botonDeDatos = (nombre: string) =>
    within(screen.getByRole('group', { name: TEXTOS_TABLERO.filtros.datos })).getByRole('button', {
      name: nombre,
    })

  it('lee los filtros de la URL al abrir', async () => {
    ver('/cifras?sector=2&datos=ejemplo')
    await esperarTablero()
    expect(botonDeSector('Sector 2')).toHaveAttribute('aria-pressed', 'true')
    expect(botonDeDatos(TEXTOS_TABLERO.filtros.ejemplo)).toHaveAttribute('aria-pressed', 'true')
  })

  it('un sector o un valor que no existen se ignoran', async () => {
    ver('/cifras?sector=99&datos=raro')
    await esperarTablero()
    expect(botonDeSector(TEXTOS_TABLERO.filtros.todos)).toHaveAttribute('aria-pressed', 'true')
    expect(botonDeDatos(TEXTOS_TABLERO.filtros.todos)).toHaveAttribute('aria-pressed', 'true')
  })

  it('elegir un sector lo escribe en la URL y mueve todo el tablero', async () => {
    ver()
    await esperarTablero()
    fireEvent.click(botonDeSector('Sector 2'))
    expect(busqueda().get('sector')).toBe('2')
    // Solo quedan los árboles de ejemplo del sector 2
    expect(kpi(TEXTOS_TABLERO.kpis.arboles)).not.toHaveTextContent(TEXTOS_TABLERO.kpis.campo)
    expect(kpi(TEXTOS_TABLERO.kpis.mayorDap)).toHaveTextContent('S02-D001')
    expect(kpi(TEXTOS_TABLERO.kpis.mayorDap)).not.toHaveTextContent('S01-A001')
    fireEvent.click(botonDeSector(TEXTOS_TABLERO.filtros.todos))
    expect(busqueda().has('sector')).toBe(false)
  })

  it('elegir «Campo» deja solo lo de campo, en todos los gráficos', async () => {
    ver()
    await esperarTablero()
    fireEvent.click(botonDeDatos(TEXTOS_TABLERO.filtros.campo))
    expect(busqueda().get('datos')).toBe('campo')
    expect(kpi(TEXTOS_TABLERO.kpis.arboles)).not.toHaveTextContent(TEXTOS_TABLERO.kpis.ejemplo)
    expect(kpi(TEXTOS_TABLERO.kpis.mayorDap)).not.toHaveTextContent('S02-D001')
    const apagados = tarjeta(TEXTOS_TABLERO.dispersion.titulo).querySelectorAll(
      'a.tablero-punto[data-apagado="si"]',
    )
    expect(apagados).toHaveLength(2)
    for (const punto of apagados) expect(punto).toHaveAttribute('aria-hidden', 'true')
  })

  it('un clic en un sector del mapa lo elige como filtro, y otro clic lo quita', async () => {
    ver()
    await esperarTablero()
    const mapa = tarjeta(TEXTOS_TABLERO.mapaCalor.titulo)
    fireEvent.click(within(mapa).getByRole('button', { name: /^Sector 2:/ }))
    expect(busqueda().get('sector')).toBe('2')
    fireEvent.click(within(mapa).getByRole('button', { name: /^Sector 2:/ }))
    expect(busqueda().has('sector')).toBe(false)
  })

  it('el mapa se puede usar con el teclado: Enter elige el sector', async () => {
    ver()
    await esperarTablero()
    const mapa = tarjeta(TEXTOS_TABLERO.mapaCalor.titulo)
    fireEvent.keyDown(within(mapa).getByRole('button', { name: /^Sector 1:/ }), { key: 'Enter' })
    expect(busqueda().get('sector')).toBe('1')
  })

  it('cambiar lo que mide el mapa lo escribe en la URL y no cuenta como filtro', async () => {
    ver()
    await esperarTablero()
    const mapa = tarjeta(TEXTOS_TABLERO.mapaCalor.titulo)
    fireEvent.click(within(mapa).getByRole('button', { name: TEXTOS_TABLERO.mapaCalor.dap }))
    expect(busqueda().get('metrica')).toBe('dap')
    expect(
      screen.queryByRole('button', { name: TEXTOS_TABLERO.filtros.limpiar }),
    ).not.toBeInTheDocument()
  })

  it('un clic en una especie de la dona filtra por ella y aparece para quitarla', async () => {
    ver()
    await esperarTablero()
    const dona = tarjeta(TEXTOS_TABLERO.especies.titulo)
    fireEvent.click(within(dona).getByRole('button', { name: /Schinus molle/ }))
    expect(busqueda().get('especie')).toBe('Schinus molle')
    expect(screen.getByText(/Especie: Schinus molle/)).toBeInTheDocument()
    // La dona sigue mostrando las demás especies, solo que apagadas
    expect(within(dona).getAllByRole('button').length).toBeGreaterThan(1)
    fireEvent.click(screen.getByRole('button', { name: TEXTOS_TABLERO.filtros.quitarEspecie }))
    expect(busqueda().has('especie')).toBe(false)
  })

  it('«Otras» y «sin especie» no se pueden elegir', async () => {
    ver()
    await esperarTablero()
    const dona = tarjeta(TEXTOS_TABLERO.especies.titulo)
    expect(
      within(dona).queryByRole('button', { name: TEXTOS_TABLERO.especies.otras }),
    ).not.toBeInTheDocument()
  })

  it('si ningún árbol cumple los filtros lo dice y deja quitarlos', async () => {
    ver('/cifras?sector=1&datos=ejemplo')
    expect(await screen.findByText(TEXTOS_TABLERO.filtros.sinResultados)).toBeInTheDocument()
    expect(
      screen.queryByRole('group', { name: TEXTOS_TABLERO.kpis.arboles }),
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: TEXTOS_TABLERO.filtros.limpiar })[0])
    await waitFor(() => expect(busqueda().has('sector')).toBe(false))
    expect(await esperarTablero()).toBeInTheDocument()
  })

  it('los controles de los filtros son botones nativos con aria-pressed', async () => {
    ver()
    await esperarTablero()
    const grupo = screen.getByRole('group', { name: TEXTOS_TABLERO.filtros.datos })
    for (const boton of within(grupo).getAllByRole('button')) {
      expect(boton).toHaveAttribute('aria-pressed')
      expect(boton.tagName).toBe('BUTTON')
    }
  })
})

describe('VistaCifras: CO₂', () => {
  prepararApi()

  it('el top y las barras de CO₂ siguen ahí y responden a los filtros', async () => {
    ver()
    await esperarTablero()
    expect(screen.getByText(TEXTOS_CIFRAS.co2.top.titulo)).toBeInTheDocument()
    expect(screen.getByText(TEXTOS_CIFRAS.co2.simulado)).toBeInTheDocument()
    const enlacesDelTop = () =>
      [
        ...screen
          .getByRole('list', { name: TEXTOS_CIFRAS.co2.top.descripcion })
          .querySelectorAll('a'),
      ].map((enlace) => enlace.getAttribute('href') ?? '')
    expect(enlacesDelTop().some((href) => href.includes('S02-D001'))).toBe(true)
    fireEvent.click(
      within(screen.getByRole('group', { name: TEXTOS_TABLERO.filtros.datos })).getByRole(
        'button',
        { name: TEXTOS_TABLERO.filtros.campo },
      ),
    )
    expect(enlacesDelTop().some((href) => href.includes('S02-D'))).toBe(false)
  })
})
