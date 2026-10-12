import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TEXTOS_CARTILLA } from '@/config/constantes'
import { arbolRealMock } from '@/mocks'
import { BloqueCo2 } from './BloqueCo2'

function ver(co2Simulado: boolean) {
  return render(
    <BloqueCo2
      arbol={{
        ...arbolRealMock,
        co2_almacenado_kg: 75185.3,
        co2_captura_anual_kg: 1503.7,
        co2_simulado: co2Simulado,
      }}
    />,
  )
}

describe('BloqueCo2', () => {
  it('con co2_simulado verdadero marca los dos valores como «Simulado», con texto accesible', () => {
    ver(true)
    expect(screen.getAllByText(TEXTOS_CARTILLA.co2Simulado)).toHaveLength(2)
    expect(screen.getAllByText(TEXTOS_CARTILLA.co2SimuladoAccesible)).toHaveLength(2)
  })

  it('con co2_simulado falso no pone ninguna etiqueta', () => {
    ver(false)
    expect(screen.queryByText(TEXTOS_CARTILLA.co2Simulado)).not.toBeInTheDocument()
    expect(screen.queryByText(TEXTOS_CARTILLA.co2SimuladoAccesible)).not.toBeInTheDocument()
  })

  it('no marca como simulado un valor sin dato', () => {
    render(
      <BloqueCo2
        arbol={{
          ...arbolRealMock,
          co2_simulado: true,
          co2_almacenado_kg: null,
          co2_captura_anual_kg: 4.1,
        }}
      />,
    )
    expect(screen.getAllByText(TEXTOS_CARTILLA.co2Simulado)).toHaveLength(1)
  })
})
