import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TEXTOS_EXPLORAR } from '@/config/constantes'
import { VistaExplorar } from './VistaExplorar'

describe('VistaExplorar (provisional)', () => {
  it('tiene un solo h1 y avisa que la sección llega pronto', () => {
    render(<VistaExplorar />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: TEXTOS_EXPLORAR.titulo })).toBeVisible()
    expect(screen.getByText(TEXTOS_EXPLORAR.proximamente)).toBeInTheDocument()
  })
})
