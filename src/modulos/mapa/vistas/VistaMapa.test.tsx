import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { invalidarCacheCampus } from '@/compartido/cacheCampus'
import { ErrorApi, obtenerSectores } from '@/api/cliente'
import { FRASES_CARGA, TEXTOS_ESTADOS, TEXTOS_MAPA } from '@/config/constantes'
import { sectoresMock } from '@/mocks'
import { VistaMapa } from './VistaMapa'

vi.mock('@/api/cliente', async (importarOriginal) => ({
  ...(await importarOriginal<typeof import('@/api/cliente')>()),
  obtenerSectores: vi.fn(),
}))

const obtenerSectoresFalso = vi.mocked(obtenerSectores)
const SIEMPRE_CERO = () => 0

describe('VistaMapa', () => {
  afterEach(() => {
    obtenerSectoresFalso.mockReset()
    invalidarCacheCampus()
  })

  it('mientras carga muestra una frase de carga elegida por peso', () => {
    obtenerSectoresFalso.mockReturnValue(new Promise(() => {}))
    render(<VistaMapa aleatorio={SIEMPRE_CERO} />)
    const estado = screen.getByRole('status')
    expect(estado).toHaveTextContent(FRASES_CARGA.contando)
    expect(estado).toHaveAttribute('aria-busy', 'true')
  })

  it('al seleccionar un sector muestra la franja con su nombre y su total', async () => {
    obtenerSectoresFalso.mockResolvedValue(sectoresMock)
    render(<VistaMapa aleatorio={SIEMPRE_CERO} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Sector 1, 118 árboles' }))
    const franja = screen.getByRole('region', { name: 'Sector 1' })
    expect(franja).toHaveTextContent('118 árboles')

    fireEvent.click(screen.getAllByRole('button', { name: /^Sector 2,/ })[0])
    expect(screen.getByRole('region', { name: 'Sector 2' })).toHaveTextContent(
      TEXTOS_MAPA.sinArboles,
    )
  })

  it('si falla muestra el error y Reintentar vuelve a pedir', async () => {
    obtenerSectoresFalso.mockRejectedValueOnce(new ErrorApi('/sectores', 503))
    render(<VistaMapa aleatorio={SIEMPRE_CERO} />)
    expect(await screen.findByRole('alert')).toHaveTextContent(TEXTOS_MAPA.errorSectores)

    obtenerSectoresFalso.mockResolvedValueOnce(sectoresMock)
    const reintentar = screen.getByRole('button', { name: TEXTOS_ESTADOS.reintentar })
    expect(reintentar).toHaveClass('boton--secundario')
    fireEvent.click(reintentar)
    await waitFor(() => expect(screen.getAllByRole('button', { name: /^Sector/ })).toHaveLength(5))
  })
})
