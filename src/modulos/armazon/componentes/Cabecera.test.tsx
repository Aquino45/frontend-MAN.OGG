import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { NOMBRE_PRODUCTO, RUTAS, TEXTOS_ARMAZON } from '@/config/constantes'
import { Cabecera } from './Cabecera'

function verCabecera(ruta: string) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Cabecera />
    </MemoryRouter>,
  )
}

describe('Cabecera', () => {
  it('la marca enlaza a Inicio y no es un h1', () => {
    verCabecera(RUTAS.mapa)
    const marca = screen.getByRole('link', { name: NOMBRE_PRODUCTO })
    expect(marca).toHaveAttribute('href', RUTAS.inicio)
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('la navegación trae Inicio y Mapa como enlaces reales', () => {
    verCabecera(RUTAS.inicio)
    const navegacion = screen.getByRole('navigation', { name: TEXTOS_ARMAZON.navegacionPrincipal })
    expect(within(navegacion).getByRole('link', { name: TEXTOS_ARMAZON.inicio })).toHaveAttribute(
      'href',
      RUTAS.inicio,
    )
    expect(within(navegacion).getByRole('link', { name: TEXTOS_ARMAZON.mapa })).toHaveAttribute(
      'href',
      RUTAS.mapa,
    )
  })

  it('en Inicio solo Inicio lleva aria-current', () => {
    verCabecera(RUTAS.inicio)
    expect(screen.getByRole('link', { name: TEXTOS_ARMAZON.inicio })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: TEXTOS_ARMAZON.mapa })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('en el mapa solo Mapa lleva aria-current, también con consulta', () => {
    verCabecera(`${RUTAS.mapa}?sector=1&arbol=S01-0001`)
    expect(screen.getByRole('link', { name: TEXTOS_ARMAZON.mapa })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: TEXTOS_ARMAZON.inicio })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('trae el interruptor de tema', () => {
    verCabecera(RUTAS.inicio)
    expect(screen.getByRole('button', { name: /tema/i })).toBeInTheDocument()
  })
})
