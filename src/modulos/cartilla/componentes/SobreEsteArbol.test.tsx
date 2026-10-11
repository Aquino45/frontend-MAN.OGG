import { cleanup, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Arbol } from '@/api/cliente'
import { TEXTOS_CARTILLA, TEXTOS_SOBRE_ARBOL } from '@/config/constantes'
import { arbolDemoMock, arbolRealMock } from '@/mocks'
import { ProveedorCapsulas } from './ProveedorCapsulas'
import { SobreEsteArbol } from './SobreEsteArbol'

const SIN_NADA: Arbol = {
  ...arbolRealMock,
  destacado: false,
  motivo_destacado: null,
  demo: false,
  capsulas: [],
  ficha_especie: null,
}

function ver(arbol: Arbol) {
  return render(
    <ProveedorCapsulas capsulas={arbol.capsulas}>
      <SobreEsteArbol arbol={arbol} />
    </ProveedorCapsulas>,
  )
}

const FICHA = {
  nombre_cientifico: 'Prosopis pallida',
  nombre_comun: 'Huarango',
  beneficios: ['Da sombra', 'Mejora el suelo'],
  dato_curioso: 'Sus raíces son profundas.',
  cuidados: 'Poco riego.',
  fuente: 'Una fuente de prueba',
}

describe('SobreEsteArbol', () => {
  it('sin nada que decir no se dibuja', () => {
    const { container } = ver(SIN_NADA)
    expect(container).toBeEmptyDOMElement()
  })

  it('el ejemplo de campo de la API (sin ayudas del estado ni ficha) no dibuja la sección', () => {
    const { container } = ver({ ...arbolRealMock, destacado: false, motivo_destacado: null })
    expect(container).toBeEmptyDOMElement()
  })

  it('un árbol de ejemplo sin nada más que la nota demo tampoco dibuja la sección', () => {
    const { container } = ver({ ...SIN_NADA, demo: true })
    expect(container).toBeEmptyDOMElement()
  })

  it('con las cápsulas del ejemplo explica su estado, en el orden del contrato', () => {
    ver({
      ...arbolDemoMock,
      demo: false,
      destacado: false,
      motivo_destacado: null,
      ficha_especie: null,
    })
    const seccion = screen.getByRole('region', { name: TEXTOS_SOBRE_ARBOL.titulo })
    expect(within(seccion).getByRole('heading', { level: 3 })).toHaveTextContent(
      TEXTOS_SOBRE_ARBOL.titulo,
    )
    const esperadas = ['estado_general', 'estado_copa', 'tronco_danos', 'raices_base'].map(
      (campo) => arbolDemoMock.capsulas.find((capsula) => capsula.campo === campo)?.en_este_arbol,
    )
    const items = within(seccion).getAllByRole('listitem')
    expect(items.map((item) => item.textContent)).toEqual(
      esperadas.map((texto) => expect.stringContaining(texto ?? '')),
    )
  })

  it('no incluye la explicación de otros datos (por ejemplo origen)', () => {
    ver({ ...arbolDemoMock, ficha_especie: null })
    const origen = arbolDemoMock.capsulas.find((capsula) => capsula.campo === 'origen')
    expect(screen.queryByText(origen?.en_este_arbol ?? '###')).not.toBeInTheDocument()
  })

  it('un destacado muestra su motivo', () => {
    ver({ ...SIN_NADA, destacado: true, motivo_destacado: 'Ejemplar centenario' })
    expect(screen.getByText(TEXTOS_SOBRE_ARBOL.motivo)).toBeInTheDocument()
    expect(screen.getByText('Ejemplar centenario')).toBeInTheDocument()
  })

  it('con ficha de especie muestra beneficios, dato curioso, cuidados y la fuente en letra chica', () => {
    const { container } = ver({ ...SIN_NADA, ficha_especie: FICHA })
    expect(screen.getByText('Da sombra')).toBeInTheDocument()
    expect(screen.getByText('Mejora el suelo')).toBeInTheDocument()
    expect(screen.getByText(FICHA.dato_curioso)).toBeInTheDocument()
    expect(screen.getByText(FICHA.cuidados)).toBeInTheDocument()
    expect(container.querySelector('.sobre-arbol__fuente')).toHaveTextContent(
      TEXTOS_SOBRE_ARBOL.fuente.replace('{fuente}', FICHA.fuente),
    )
  })

  it('una ficha sin dato curioso ni cuidados solo muestra lo que trae', () => {
    ver({
      ...SIN_NADA,
      ficha_especie: { ...FICHA, dato_curioso: null, cuidados: null },
    })
    expect(screen.queryByText(TEXTOS_SOBRE_ARBOL.datoCurioso)).not.toBeInTheDocument()
    expect(screen.queryByText(TEXTOS_SOBRE_ARBOL.cuidados)).not.toBeInTheDocument()
    expect(screen.getByText('Da sombra')).toBeInTheDocument()
  })

  it('una ficha que solo trae su fuente no hace aparecer la sección ni se muestra', () => {
    const soloFuente = { ...FICHA, beneficios: [], dato_curioso: null, cuidados: null }
    const { container } = ver({ ...SIN_NADA, ficha_especie: soloFuente })
    expect(container).toBeEmptyDOMElement()
    cleanup()
    const conMotivo = ver({
      ...SIN_NADA,
      destacado: true,
      motivo_destacado: 'Por su porte.',
      ficha_especie: soloFuente,
    })
    expect(conMotivo.container.querySelector('.sobre-arbol__fuente')).toBeNull()
  })

  it('si es de ejemplo, la nota «Dato de ejemplo» va al inicio de la sección', () => {
    const { container } = ver({ ...arbolDemoMock })
    const seccion = container.querySelector('.sobre-arbol') as HTMLElement
    expect(seccion.firstElementChild).toHaveTextContent(TEXTOS_CARTILLA.selloDemo)
  })

  it('uno de campo no lleva la nota demo', () => {
    ver({ ...arbolDemoMock, demo: false })
    expect(screen.queryByText(TEXTOS_CARTILLA.selloDemo)).not.toBeInTheDocument()
  })
})
