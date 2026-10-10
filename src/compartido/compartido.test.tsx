import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TEXTOS_CARTILLA } from '@/config/constantes'
import { GlifoPixelArbol } from './GlifoPixelArbol'
import { SelloDemo } from './SelloDemo'
import { SinDato } from './SinDato'

describe('componentes compartidos', () => {
  it('SelloDemo dice «Dato de ejemplo»', () => {
    render(<SelloDemo />)
    expect(screen.getByText(TEXTOS_CARTILLA.selloDemo)).toBeInTheDocument()
  })

  it('SinDato dice «Sin dato»', () => {
    render(<SinDato />)
    expect(screen.getByText(TEXTOS_CARTILLA.sinDato)).toBeInTheDocument()
  })

  it('GlifoPixelArbol es decorativo y no tiene texto', () => {
    const { container } = render(<GlifoPixelArbol />)
    const dibujo = container.querySelector('svg')
    expect(dibujo).toHaveAttribute('aria-hidden', 'true')
    expect(dibujo?.textContent).toBe('')
  })
})
