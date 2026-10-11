// Si la variante alterna no se puede cargar (por ejemplo, sin red), se sigue con la estándar.
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { VistaEntrada } from './VistaEntrada'

vi.mock('../componentes/EntradaAlterna', () => {
  throw new Error('No se pudo cargar la ilustración de la entrada')
})

describe('VistaEntrada cuando falla la carga de la variante alterna', () => {
  it('muestra la vista pedida con la entrada estándar y sin errores a la vista', async () => {
    const { container } = render(
      <VistaEntrada aleatorio={() => 0.999}>
        <p>Vista pedida</p>
      </VistaEntrada>,
    )
    await waitFor(() => expect(container.querySelector('.entrada--estandar')).not.toBeNull())
    expect(screen.getByText('Vista pedida')).toBeVisible()
    expect(container.querySelector('.entrada--estandar')).not.toBeNull()
    expect(container.querySelector('.entrada--tapada')).toBeNull()
    expect(document.querySelector('.entrada-alterna')).toBeNull()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
