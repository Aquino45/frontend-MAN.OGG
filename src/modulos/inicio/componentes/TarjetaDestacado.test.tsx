import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import type { ArbolResumen } from '@/api/cliente'
import { PARAMETROS_URL, RUTAS, TEXTOS_CARTILLA, TEXTOS_INICIO } from '@/config/constantes'
import type { MedidasDestacado } from '../hooks/useMedidasDeDestacados'
import type { Destacado } from '../lib/destacados'
import { TarjetaDestacado } from './TarjetaDestacado'

const ARBOL: ArbolResumen = {
  codigo: 'S01-A012',
  uid: 'uid-1',
  sector: 1,
  nombre_comun: 'Huarango',
  nombre_cientifico: 'Prosopis pallida',
  estado_general: 'Regular',
  foto_miniatura_url: null,
  demo: false,
  destacado: true,
  motivo_destacado: 'Ejemplar de más de cien años en el patio central',
  co2_almacenado_kg: null,
  co2_captura_anual_kg: null,
  co2_simulado: false,
}

function verTarjeta(
  cambios: Partial<ArbolResumen> = {},
  medidas: MedidasDestacado = { estado: 'listo', dapCm: 54.5, alturaM: 9.4 },
  nombreSector: string | null = 'Sector 1',
) {
  const destacado: Destacado = { arbol: { ...ARBOL, ...cambios }, nombreSector }
  return render(
    <MemoryRouter>
      <TarjetaDestacado destacado={destacado} medidas={medidas} />
    </MemoryRouter>,
  )
}

describe('TarjetaDestacado', () => {
  it('toda la tarjeta es un enlace a /mapa con el sector y el árbol', () => {
    verTarjeta()
    const enlace = screen.getByRole('link')
    const consulta = new URLSearchParams({
      [PARAMETROS_URL.sector]: '1',
      [PARAMETROS_URL.arbol]: 'S01-A012',
    })
    expect(enlace).toHaveAttribute('href', `${RUTAS.mapa}?${consulta.toString()}`)
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(within(enlace).getByRole('heading', { level: 3, name: 'Huarango' })).toBeInTheDocument()
  })

  it('muestra nombre científico, código, sector y la estrella decorativa', () => {
    const { container } = verTarjeta()
    expect(screen.getByText('Prosopis pallida')).toBeInTheDocument()
    expect(screen.getByText('Prosopis pallida').tagName).toBe('EM')
    expect(screen.getByText(/S01-A012/)).toBeInTheDocument()
    expect(screen.getByText(/Sector 1/)).toBeInTheDocument()
    expect(container.querySelector('.destacado-tarjeta__estrella')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('sin nombre común o científico dice «Sin dato» con el componente compartido', () => {
    const { container } = verTarjeta({ nombre_comun: null, nombre_cientifico: null })
    expect(container.querySelectorAll('.sin-dato').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(TEXTOS_CARTILLA.sinDato)
  })

  it('no muestra el motivo completo: eso es solo de la cartilla', () => {
    verTarjeta()
    expect(screen.queryByText(ARBOL.motivo_destacado ?? '')).not.toBeInTheDocument()
  })

  it('un árbol de ejemplo lleva el sello «Dato de ejemplo»; uno de campo no', () => {
    verTarjeta({ demo: true })
    expect(screen.getByText(TEXTOS_CARTILLA.selloDemo)).toBeInTheDocument()
  })

  it('uno de campo no lleva sello', () => {
    verTarjeta({ demo: false })
    expect(screen.queryByText(TEXTOS_CARTILLA.selloDemo)).not.toBeInTheDocument()
  })

  it('con las medidas listas muestra DAP y altura con su unidad', () => {
    verTarjeta()
    expect(screen.getByText(TEXTOS_INICIO.destacados.dap)).toBeInTheDocument()
    expect(screen.getByText('54.5 cm')).toBeInTheDocument()
    expect(screen.getByText(TEXTOS_INICIO.destacados.altura)).toBeInTheDocument()
    expect(screen.getByText('9.4 m')).toBeInTheDocument()
  })

  it('mientras llegan las medidas muestra un esqueleto ocupado y ningún número', () => {
    const { container } = verTarjeta({}, { estado: 'cargando' })
    const fila = container.querySelector('.destacado-tarjeta__medidas')
    expect(fila).toHaveAttribute('aria-busy', 'true')
    expect(fila?.textContent).not.toMatch(/\d/)
  })

  it('si las medidas fallan dice «Sin dato» y la tarjeta sigue siendo enlace', () => {
    const { container } = verTarjeta({}, { estado: 'error' })
    const fila = container.querySelector('.destacado-tarjeta__medidas')
    expect(fila?.querySelectorAll('.sin-dato')).toHaveLength(2)
    expect(screen.getByRole('link')).toBeInTheDocument()
  })

  it('un DAP null con medidas listas también dice «Sin dato»', () => {
    const { container } = verTarjeta({}, { estado: 'listo', dapCm: null, alturaM: 9.4 })
    expect(container.querySelectorAll('.destacado-tarjeta__medidas .sin-dato')).toHaveLength(1)
  })
})
