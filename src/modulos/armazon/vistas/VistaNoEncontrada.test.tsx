import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { RUTAS, TEXTOS_ARMAZON } from '@/config/constantes'
import { VistaNoEncontrada } from './VistaNoEncontrada'

describe('VistaNoEncontrada', () => {
  it('tiene un solo h1 con el texto de página no encontrada', () => {
    render(
      <MemoryRouter initialEntries={['/no-existe']}>
        <VistaNoEncontrada />
      </MemoryRouter>,
    )
    const titulos = screen.getAllByRole('heading', { level: 1 })
    expect(titulos).toHaveLength(1)
    expect(titulos[0]).toHaveTextContent(TEXTOS_ARMAZON.tituloNoEncontrada)
    expect(screen.getByText(TEXTOS_ARMAZON.fraseNoEncontrada)).toBeInTheDocument()
  })

  it('trae un enlace a Inicio', () => {
    render(
      <MemoryRouter initialEntries={['/no-existe']}>
        <VistaNoEncontrada />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: TEXTOS_ARMAZON.volverAlInicio })).toHaveAttribute(
      'href',
      RUTAS.inicio,
    )
  })
})
