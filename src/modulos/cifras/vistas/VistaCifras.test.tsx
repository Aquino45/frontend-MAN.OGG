import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TEXTOS_CIFRAS } from '@/config/constantes'
import { VistaCifras } from './VistaCifras'

describe('VistaCifras (provisional)', () => {
  it('tiene un solo h1 y avisa que la sección llega pronto', () => {
    render(<VistaCifras />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: TEXTOS_CIFRAS.titulo })).toBeVisible()
    expect(screen.getByText(TEXTOS_CIFRAS.proximamente)).toBeInTheDocument()
  })
})
