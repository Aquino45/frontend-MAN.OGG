import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  NOMBRE_PRODUCTO,
  RUTAS,
  TEXTOS_ARMAZON,
  TEXTOS_INICIO,
  TEXTOS_TEMA,
} from '@/config/constantes'
import App from './App'

const SIEMPRE_ESTANDAR = () => 0
// Valor alto del sorteo de la entrada: sirve para probar que, fuera de Inicio, la entrada no se monta
const SORTEO_ALTO = () => 0.9999

function abrir(url: string, aleatorioEntrada: () => number = SIEMPRE_ESTANDAR) {
  window.history.replaceState(null, '', url)
  return render(<App aleatorioEntrada={aleatorioEntrada} />)
}

describe('App: rutas', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://api.prueba.invalid/v1')
    vi.stubEnv('VITE_USAR_MOCKS', 'true')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    window.history.replaceState(null, '', '/')
  })

  it('en «/» muestra el h1 de la portada y la cabecera con la marca y «Inicio» activo', async () => {
    abrir('/')
    expect(NOMBRE_PRODUCTO).toBe('Censo arbóreo UPeU Lima')
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: `${TEXTOS_INICIO.tituloPortada}${TEXTOS_INICIO.tituloPortadaAcento}`,
      }),
    ).toBeInTheDocument()
    // Se espera a que Inicio termine de pedir sus datos antes de seguir.
    expect(
      await screen.findByRole('region', { name: TEXTOS_INICIO.tituloCifras }),
    ).toBeInTheDocument()
    await screen.findAllByRole('link', { name: /^Sector \d/ })
    expect(screen.getByRole('link', { name: NOMBRE_PRODUCTO })).toHaveAttribute('href', '/')
    const navegacion = screen.getByRole('navigation', { name: TEXTOS_ARMAZON.navegacionPrincipal })
    expect(within(navegacion).getByRole('link', { name: TEXTOS_ARMAZON.inicio })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(within(navegacion).getByRole('link', { name: TEXTOS_ARMAZON.mapa })).not.toHaveAttribute(
      'aria-current',
    )
    expect(
      screen.getByRole('button', {
        name: new RegExp(`${TEXTOS_TEMA.cambiarAClaro}|${TEXTOS_TEMA.cambiarAOscuro}`),
      }),
    ).toBeInTheDocument()
  })

  it('al abrir en «/» el contenido va envuelto en la entrada', () => {
    const { container } = abrir('/')
    expect(container.querySelector('.entrada')).not.toBeNull()
  })

  it('en «/mapa» muestra los 5 sectores, «Mapa» activo y sin entrada', async () => {
    const { container } = abrir('/mapa', SORTEO_ALTO)
    expect(await screen.findAllByRole('button', { name: /^Sector \d/ })).toHaveLength(5)
    const navegacion = screen.getByRole('navigation', { name: TEXTOS_ARMAZON.navegacionPrincipal })
    expect(within(navegacion).getByRole('link', { name: TEXTOS_ARMAZON.mapa })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(container.querySelector('.entrada')).toBeNull()
  })

  it('«/mapa?sector=1&arbol=S01-A001» abre la cartilla de ese árbol, sin entrada', async () => {
    const { container } = abrir('/mapa?sector=1&arbol=S01-A001')
    expect(await screen.findByRole('heading', { level: 2, name: 'Molle' })).toBeInTheDocument()
    expect(container.querySelector('.entrada')).toBeNull()
  })

  it.each(['/?sector=1', '/?arbol=S01-A001'])(
    'el enlace viejo «%s» redirige a «/mapa» conservando la consulta, sin entrada',
    async (url) => {
      const consulta = url.slice(1)
      const { container } = abrir(url, SORTEO_ALTO)
      await waitFor(() => expect(window.location.pathname).toBe(RUTAS.mapa))
      expect(window.location.search).toBe(consulta)
      expect(await screen.findAllByRole('button', { name: /^Sector \d/ })).toHaveLength(5)
      expect(container.querySelector('.entrada')).toBeNull()
    },
  )

  it('una dirección desconocida muestra la 404 con un h1 y un enlace a Inicio', () => {
    abrir('/no-existe')
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(
      screen.getByRole('heading', { level: 1, name: TEXTOS_ARMAZON.tituloNoEncontrada }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: TEXTOS_ARMAZON.volverAlInicio })).toHaveAttribute(
      'href',
      '/',
    )
  })

  it.each(['/', '/mapa', '/no-existe'])('la página «%s» tiene exactamente un h1', async (url) => {
    abrir(url)
    if (url === RUTAS.mapa) await screen.findAllByRole('button', { name: /^Sector \d/ })
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('el h1 de «/mapa» es el título de la región, solo para lectores', async () => {
    abrir('/mapa')
    await screen.findAllByRole('button', { name: /^Sector \d/ })
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('solo-lectores')
  })

  it('al pulsar «Mapa» en la navegación va a «/mapa» y muestra los sectores', async () => {
    abrir('/')
    const navegacion = screen.getByRole('navigation', { name: TEXTOS_ARMAZON.navegacionPrincipal })
    fireEvent.click(within(navegacion).getByRole('link', { name: TEXTOS_ARMAZON.mapa }))
    expect(await screen.findAllByRole('button', { name: /^Sector \d/ })).toHaveLength(5)
    expect(window.location.pathname).toBe(RUTAS.mapa)
    expect(within(navegacion).getByRole('link', { name: TEXTOS_ARMAZON.mapa })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('en «/mapa» abrir un sector y un árbol y volver atrás sigue funcionando', async () => {
    abrir('/mapa')
    fireEvent.click(await screen.findByRole('button', { name: /^Sector 1,/ }))
    expect(window.location.pathname).toBe(RUTAS.mapa)
    expect(window.location.search).toBe('?sector=1')
    expect(await screen.findByRole('heading', { level: 2, name: 'Sector 1' })).toBeInTheDocument()

    // La cabecera trae su propia lista de enlaces: se busca la del panel del sector.
    const panel = await screen.findByRole('heading', { level: 2, name: 'Sector 1' })
    const lista = await waitFor(() => {
      const encontrada = panel.closest('.panel-sector')?.querySelector('ul')
      if (!encontrada) throw new Error('Aún no carga la lista de árboles')
      return encontrada as HTMLElement
    })
    fireEvent.click(within(lista).getByRole('button', { name: /S01-A001/ }))
    expect(window.location.search).toBe('?sector=1&arbol=S01-A001')
    expect(await screen.findByRole('heading', { level: 2, name: 'Molle' })).toBeInTheDocument()

    window.history.back()
    await waitFor(() => expect(window.location.search).toBe('?sector=1'))
    await waitFor(() =>
      expect(screen.queryByRole('heading', { level: 2, name: 'Molle' })).not.toBeInTheDocument(),
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Sector 1' })).toBeInTheDocument()
    expect(window.location.pathname).toBe(RUTAS.mapa)
  })
})
