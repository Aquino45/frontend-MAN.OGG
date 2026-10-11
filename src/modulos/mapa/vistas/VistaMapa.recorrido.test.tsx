// Recorrido completo con los mocks: mapa → sector → árbol, con el estado en la URL.
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TEXTOS_CARTILLA, TEXTOS_PANEL, TEXTOS_SOBRE_ARBOL } from '@/config/constantes'
import { VistaMapa } from './VistaMapa'

const SIEMPRE_CERO = () => 0

function irA(url: string) {
  window.history.replaceState(null, '', url)
}

describe('VistaMapa: recorrido sector → árbol', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://api.prueba.invalid/v1')
    vi.stubEnv('VITE_USAR_MOCKS', 'true')
    irA('/')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    irA('/')
  })

  it('entra al sector 1, lista sus árboles y abre la cartilla demo; Esc la cierra y luego el sector', async () => {
    render(<VistaMapa aleatorio={SIEMPRE_CERO} />)
    fireEvent.click(await screen.findByRole('button', { name: /^Sector 1,/ }))
    expect(window.location.search).toBe('?sector=1')

    expect(await screen.findByRole('heading', { name: 'Sector 1' })).toBeInTheDocument()
    expect(await screen.findAllByRole('listitem')).toHaveLength(4)
    // Los 4 árboles también son puntos del mapa
    expect(
      screen.getByRole('button', { name: /^S01-A012, Huarango. Destacado/ }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^S01-A012, Huarango. Destacado/ }))
    expect(window.location.search).toBe('?sector=1&arbol=S01-A012')
    const titulo = await screen.findByRole('heading', { name: 'Huarango' })
    await waitFor(() => expect(titulo).toHaveFocus())
    // El sello de la foto y la nota al inicio de «Sobre este árbol»
    expect(screen.getAllByText(TEXTOS_CARTILLA.selloDemo)).toHaveLength(2)
    const sobreArbol = screen.getByRole('region', { name: TEXTOS_SOBRE_ARBOL.titulo })
    expect(within(sobreArbol).getByText(TEXTOS_CARTILLA.selloDemo)).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => expect(window.location.search).toBe('?sector=1'))
    expect(await screen.findAllByRole('listitem')).toHaveLength(4)

    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => expect(window.location.search).toBe(''))
    expect(screen.queryByRole('heading', { name: 'Sector 1' })).not.toBeInTheDocument()
  })

  it('«Volver a los sectores» y «← Lista del sector» deshacen cada paso', async () => {
    render(<VistaMapa aleatorio={SIEMPRE_CERO} />)
    fireEvent.click(await screen.findByRole('button', { name: /^Sector 1,/ }))
    const lista = await screen.findByRole('list')
    fireEvent.click(within(lista).getByRole('button', { name: /S01-A001/ }))
    await screen.findByRole('heading', { name: 'Molle' })

    fireEvent.click(screen.getByRole('button', { name: TEXTOS_CARTILLA.volverALista }))
    await waitFor(() => expect(window.location.search).toBe('?sector=1'))

    fireEvent.click(screen.getByRole('button', { name: new RegExp(TEXTOS_PANEL.volverASectores) }))
    await waitFor(() => expect(window.location.search).toBe(''))
  })

  it('al cerrar la cartilla el foco vuelve a la fila desde donde se abrió', async () => {
    render(<VistaMapa aleatorio={SIEMPRE_CERO} />)
    fireEvent.click(await screen.findByRole('button', { name: /^Sector 1,/ }))
    const lista = await screen.findByRole('list')
    const fila = within(lista).getByRole('button', { name: /S01-A012/ })
    fila.focus()
    fireEvent.click(fila)
    await screen.findByRole('heading', { name: 'Huarango' })

    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => {
      const filaNueva = within(screen.getByRole('list')).getByRole('button', { name: /S01-A012/ })
      expect(filaNueva).toHaveFocus()
    })
  })

  it('al cerrar la cartilla el foco vuelve al punto desde donde se abrió', async () => {
    render(<VistaMapa aleatorio={SIEMPRE_CERO} />)
    fireEvent.click(await screen.findByRole('button', { name: /^Sector 1,/ }))
    const punto = await screen.findByRole('button', { name: 'S01-A001, Molle' })
    punto.focus()
    fireEvent.click(punto)
    await screen.findByRole('heading', { name: 'Molle' })

    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'S01-A001, Molle' })).toHaveFocus(),
    )
  })

  it('el panel tiene nombre accesible: el sector con la lista y el código con la cartilla', async () => {
    render(<VistaMapa aleatorio={SIEMPRE_CERO} />)
    fireEvent.click(await screen.findByRole('button', { name: /^Sector 1,/ }))
    expect(await screen.findByRole('complementary', { name: /Sector 1/ })).toBeInTheDocument()
    fireEvent.click(await screen.findByRole('button', { name: /^S01-A012, Huarango. Destacado/ }))
    expect(await screen.findByRole('complementary', { name: 'S01-A012' })).toBeInTheDocument()
  })

  it('el panel es el mismo elemento al abrir la cartilla y al cerrarla con Esc (no repite su entrada)', async () => {
    render(<VistaMapa aleatorio={SIEMPRE_CERO} />)
    fireEvent.click(await screen.findByRole('button', { name: /^Sector 1,/ }))
    const panel = await screen.findByRole('complementary', { name: /Sector 1/ })

    fireEvent.click(await screen.findByRole('button', { name: /^S01-A012, Huarango. Destacado/ }))
    await screen.findByRole('heading', { name: 'Huarango' })
    expect(screen.getByRole('complementary', { name: 'S01-A012' })).toBe(panel)

    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => expect(window.location.search).toBe('?sector=1'))
    expect(await screen.findByRole('complementary', { name: /Sector 1/ })).toBe(panel)

    fireEvent.click(screen.getAllByRole('button', { name: /^Sector 2,/ })[0])
    expect(await screen.findByRole('complementary', { name: /Sector 2/ })).toBe(panel)
  })

  it('en el panel del sector la fila del destacado no repite el motivo; la cartilla sí lo trae', async () => {
    render(<VistaMapa aleatorio={SIEMPRE_CERO} />)
    fireEvent.click(await screen.findByRole('button', { name: /^Sector 1,/ }))
    const lista = await screen.findByRole('list')
    expect(lista).not.toHaveTextContent('ejemplar de mayor copa del sector')
    fireEvent.click(within(lista).getByRole('button', { name: /S01-A012/ }))
    await screen.findByRole('heading', { name: 'Huarango' })
    // El motivo va en la insignia del destacado y en «Sobre este árbol»
    expect(screen.getAllByText(/ejemplar de mayor copa del sector/)).toHaveLength(2)
    const sobreArbol = screen.getByRole('region', { name: TEXTOS_SOBRE_ARBOL.titulo })
    expect(within(sobreArbol).getByText(/ejemplar de mayor copa del sector/)).toBeInTheDocument()
  })

  it('una URL con sector y árbol lleva directo a la cartilla', async () => {
    irA('/?sector=1&arbol=S01-A001')
    render(<VistaMapa aleatorio={SIEMPRE_CERO} />)
    expect(await screen.findByRole('heading', { name: 'Molle' })).toBeInTheDocument()
    expect(screen.getByText(/Sector 1 · /)).toBeInTheDocument()
  })

  it('con mocks, S01-A002 y S01-A015 dicen «No encontramos el árbol» y se puede volver', async () => {
    irA('/?sector=1&arbol=S01-A002')
    render(<VistaMapa aleatorio={SIEMPRE_CERO} />)
    expect(await screen.findByRole('alert')).toHaveTextContent(
      `${TEXTOS_CARTILLA.noEncontrado} S01-A002`,
    )
    fireEvent.click(screen.getByRole('button', { name: TEXTOS_CARTILLA.volverALista }))
    await waitFor(() => expect(window.location.search).toBe('?sector=1'))
  })

  it('los sectores 2 a 5 dicen «Aún sin árboles registrados»', async () => {
    render(<VistaMapa aleatorio={SIEMPRE_CERO} />)
    fireEvent.click(await screen.findByRole('button', { name: /^Sector 2,/ }))
    expect(await screen.findByText(TEXTOS_PANEL.sinArboles)).toBeInTheDocument()
  })

  it('un sector que no existe en la URL se ignora y se ve el mapa', async () => {
    irA('/?sector=99')
    render(<VistaMapa aleatorio={SIEMPRE_CERO} />)
    expect(await screen.findAllByRole('button', { name: /^Sector \d/ })).toHaveLength(5)
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
  })
})
