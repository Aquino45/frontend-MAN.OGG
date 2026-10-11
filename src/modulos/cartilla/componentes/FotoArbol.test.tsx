import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { arbolDemoMock } from '@/mocks'
import { FotoArbol } from './FotoArbol'

describe('FotoArbol', () => {
  it('el chip de estado va fuera del recuadro de la foto, en su propia fila', () => {
    const { container } = render(
      <FotoArbol arbol={{ ...arbolDemoMock, foto_url: null, foto_miniatura_url: null }} />,
    )
    expect(container.querySelector('.foto-arbol .chip-estado')).toBeNull()
    expect(
      container.querySelector('.foto-bloque > .foto-arbol__estado .chip-estado'),
    ).not.toBeNull()
  })

  it('el sello de ejemplo sigue dentro de la foto, arriba', () => {
    const { container } = render(<FotoArbol arbol={{ ...arbolDemoMock, demo: true }} />)
    expect(container.querySelector('.foto-arbol .foto-arbol__sello')).not.toBeNull()
  })
})
