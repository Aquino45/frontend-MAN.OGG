import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TEXTOS_CIFRAS } from '@/config/constantes'
import { TEXTOS_TABLERO } from '@/config/tablero'
import { busqueda, esperarTablero, kpi, prepararApi, tarjeta, ver } from './montajeCifras'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerSectores: vi.fn(),
  obtenerArbolesDeSector: vi.fn(),
}))

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
    fireEvent.click(within(mapa).getByRole('button', { name: /^Sector 2 / }))
    expect(busqueda().get('sector')).toBe('2')
    fireEvent.click(within(mapa).getByRole('button', { name: /^Sector 2 / }))
    expect(busqueda().has('sector')).toBe(false)
  })

  it('el mapa se puede usar con el teclado: Enter elige el sector', async () => {
    ver()
    await esperarTablero()
    const mapa = tarjeta(TEXTOS_TABLERO.mapaCalor.titulo)
    fireEvent.keyDown(within(mapa).getByRole('button', { name: /^Sector 1 / }), { key: 'Enter' })
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

  it('si el clic en el mapa deja la página sin resultados, el foco pasa a «Quitar los filtros»', async () => {
    ver('/cifras?datos=ejemplo')
    await esperarTablero()
    const mapa = tarjeta(TEXTOS_TABLERO.mapaCalor.titulo)
    const sector1 = within(mapa).getByRole('button', { name: /^Sector 1 / })
    sector1.focus()
    fireEvent.click(sector1)
    const quitar = await screen.findByText(TEXTOS_TABLERO.filtros.sinResultados)
    expect(quitar).toBeInTheDocument()
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getAllByRole('button', { name: TEXTOS_TABLERO.filtros.limpiar }).at(-1),
      ),
    )
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
