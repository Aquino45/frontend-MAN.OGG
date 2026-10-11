import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { ArbolResumen } from '@/api/cliente'
import { ID_TITULO_DESTACADOS, TEXTOS_ESTADOS, TEXTOS_INICIO } from '@/config/constantes'
import type { MedidasDestacado } from '../hooks/useMedidasDeDestacados'
import type { Destacado } from '../lib/destacados'
import { BloqueDestacados } from './BloqueDestacados'

function destacado(codigo: string, nombre: string): Destacado {
  const arbol: ArbolResumen = {
    codigo,
    uid: `uid-${codigo}`,
    sector: 1,
    nombre_comun: nombre,
    nombre_cientifico: null,
    estado_general: null,
    foto_miniatura_url: null,
    demo: false,
    destacado: true,
    motivo_destacado: null,
  }
  return { arbol, nombreSector: 'Sector 1' }
}

const LISTO: MedidasDestacado = { estado: 'listo', dapCm: 10, alturaM: 5 }

function verBloque(
  propiedades: Partial<Parameters<typeof BloqueDestacados>[0]> = {},
  alReintentar = vi.fn(),
) {
  return render(
    <MemoryRouter>
      <BloqueDestacados
        estado="listo"
        destacados={[destacado('S01-A001', 'Molle'), destacado('S01-A002', 'Palma real')]}
        medidasDe={() => LISTO}
        onReintentar={alReintentar}
        {...propiedades}
      />
    </MemoryRouter>,
  )
}

describe('BloqueDestacados', () => {
  it('es una sección con su h2 anclable y una tarjeta enlace por árbol', () => {
    verBloque()
    const region = screen.getByRole('region', { name: TEXTOS_INICIO.tituloDestacados })
    const titulo = within(region).getByRole('heading', { level: 2 })
    expect(titulo).toHaveAttribute('id', ID_TITULO_DESTACADOS)
    expect(titulo).toHaveAttribute('tabindex', '-1')
    expect(within(region).getAllByRole('link')).toHaveLength(2)
    expect(within(region).getAllByRole('listitem')).toHaveLength(2)
  })

  it('cargando: esqueleto con forma de tarjeta, sin números', () => {
    const { container } = verBloque({ estado: 'cargando', destacados: [] })
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
    expect(container.querySelector('.estado-carga--tarjeta')).not.toBeNull()
    expect(screen.getByRole('region').textContent).not.toMatch(/\d/)
  })

  it('error: dice qué falló y Reintentar lo pide de nuevo', () => {
    const alReintentar = vi.fn()
    verBloque({ estado: 'error', destacados: [] }, alReintentar)
    expect(screen.getByRole('alert')).toHaveTextContent(TEXTOS_INICIO.errorDestacados)
    fireEvent.click(screen.getByRole('button', { name: TEXTOS_ESTADOS.reintentar }))
    expect(alReintentar).toHaveBeenCalledTimes(1)
  })

  it('vacío: una frase y ninguna acción inventada, pero el título sigue ahí', () => {
    verBloque({ estado: 'listo', destacados: [] })
    expect(screen.getByText(TEXTOS_INICIO.sinDestacados)).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute('id', ID_TITULO_DESTACADOS)
  })

  it('las tarjetas de un mismo bloque no anidan otras tarjetas ni enlaces', () => {
    const { container } = verBloque()
    expect(container.querySelectorAll('a a')).toHaveLength(0)
    expect(container.querySelectorAll('.destacado-tarjeta .destacado-tarjeta')).toHaveLength(0)
  })
})
