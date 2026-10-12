import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { NOMBRE_PRODUCTO, RUTAS, TEXTOS_ARMAZON, TEXTOS_MARCA } from '@/config/constantes'
import marcaCss from '@/compartido/marca/marca.estilos.css?raw'
import escalaTokens from '@/styles/escala.tokens.css?raw'
import estilosCss from '../estilos.css?raw'
import { Cabecera } from './Cabecera'

function verCabecera(ruta: string) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Cabecera />
    </MemoryRouter>,
  )
}

describe('Cabecera', () => {
  it('la marca enlaza a Inicio y no es un h1', () => {
    verCabecera(RUTAS.mapa)
    const marca = screen.getByRole('link', { name: NOMBRE_PRODUCTO })
    expect(marca).toHaveAttribute('href', RUTAS.inicio)
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('el enlace de la marca es solo el wordmark en texto, sin el símbolo de baldosas', () => {
    const { container } = verCabecera(RUTAS.inicio)
    const marca = screen.getByRole('link', { name: NOMBRE_PRODUCTO })
    expect(marca).toHaveTextContent(TEXTOS_MARCA.censo)
    expect(marca).toHaveTextContent(TEXTOS_MARCA.arboreo)
    expect(container.querySelector('.simbolo-logo')).toBeNull()
  })

  it('el wordmark mide 32 px de referencia en el celular y 40 px desde 48rem', () => {
    expect(escalaTokens).toMatch(/--marca-cabecera-alto:\s*2rem/)
    expect(escalaTokens).toMatch(
      /@media \(min-width: 48rem\)\s*\{\s*:root\s*\{[^}]*--marca-cabecera-alto:\s*2\.5rem/,
    )
  })

  it('la UPeU mide 32 px de alto, va alineada con su área de resguardo y sale desde 32rem', () => {
    expect(escalaTokens).toMatch(/--upeu-alto:\s*2rem/)
    expect(marcaCss).toMatch(/\.logo-upeu__imagen\s*\{[^}]*block-size:\s*var\(--upeu-alto\)/)
    expect(marcaCss).toMatch(
      /\.co-marca__resguardo\s*\{[^}]*padding:\s*calc\(var\(--upeu-alto\) \/ 2\)/,
    )
    // En la cabecera el resguardo es horizontal: arriba y abajo ya sobra aire y no crece de 76 px
    expect(marcaCss).toMatch(
      /\.logo-marca__upeu\s*\{[^}]*padding-inline:\s*calc\(var\(--upeu-alto\) \/ 2\)/,
    )
    // Debajo de 32rem no entra: va solo el wordmark
    expect(marcaCss).toMatch(
      /@media \(width < 32rem\)\s*\{[^}]*\.logo-marca__separador,\s*\.logo-marca__upeu\s*\{\s*display:\s*none/,
    )
  })

  it('el logo de la UPeU va fuera del enlace de la marca y en sus dos versiones, tal cual', () => {
    verCabecera(RUTAS.inicio)
    const marca = screen.getByRole('link', { name: NOMBRE_PRODUCTO })
    expect(within(marca).queryByAltText(TEXTOS_MARCA.upeu)).not.toBeInTheDocument()
    expect(screen.getAllByAltText(TEXTOS_MARCA.upeu)).toHaveLength(2)
  })

  it('el wordmark entra una vez con transform y opacity, y el hover es sutil y protegido', () => {
    const inicio = estilosCss.indexOf('@keyframes armazon-marca-entra')
    expect(inicio).toBeGreaterThanOrEqual(0)
    // El bloque llega hasta la llave que cierra los dos cuadros (from y to)
    const cuadros = estilosCss.slice(inicio).split('}\n}')[0]
    const propiedades = [...cuadros.matchAll(/([a-z-]+):/g)].map(([, nombre]) => nombre)
    expect(new Set(propiedades)).toEqual(new Set(['opacity', 'transform']))
    expect(estilosCss).toMatch(
      /\.armazon-cabecera__marca\s+\.wordmark\s*\{[^}]*animation:\s*armazon-marca-entra\s+var\(--duracion-entrada\)\s+var\(--curva-salida\)/,
    )
    expect(estilosCss).toMatch(
      /@media \(hover: hover\) and \(pointer: fine\)\s*\{[^@]*\.armazon-cabecera__marca:hover \.wordmark\s*\{[^}]*transform:\s*translateX/,
    )
  })

  it('la navegación trae Inicio y Mapa como enlaces reales', () => {
    verCabecera(RUTAS.inicio)
    const navegacion = screen.getByRole('navigation', { name: TEXTOS_ARMAZON.navegacionPrincipal })
    expect(within(navegacion).getByRole('link', { name: TEXTOS_ARMAZON.inicio })).toHaveAttribute(
      'href',
      RUTAS.inicio,
    )
    expect(within(navegacion).getByRole('link', { name: TEXTOS_ARMAZON.mapa })).toHaveAttribute(
      'href',
      RUTAS.mapa,
    )
  })

  it('en Inicio solo Inicio lleva aria-current', () => {
    verCabecera(RUTAS.inicio)
    expect(screen.getByRole('link', { name: TEXTOS_ARMAZON.inicio })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: TEXTOS_ARMAZON.mapa })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('en el mapa solo Mapa lleva aria-current, también con consulta', () => {
    verCabecera(`${RUTAS.mapa}?sector=1&arbol=S01-0001`)
    expect(screen.getByRole('link', { name: TEXTOS_ARMAZON.mapa })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: TEXTOS_ARMAZON.inicio })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('trae el interruptor de tema', () => {
    verCabecera(RUTAS.inicio)
    expect(screen.getByRole('button', { name: /tema/i })).toBeInTheDocument()
  })

  it('la navegación trae los 4 enlaces: Inicio, Mapa, Árboles y Cifras, en ese orden', () => {
    verCabecera(RUTAS.inicio)
    const navegacion = screen.getByRole('navigation', { name: TEXTOS_ARMAZON.navegacionPrincipal })
    const enlaces = within(navegacion).getAllByRole('link')
    expect(enlaces.map((enlace) => enlace.textContent)).toEqual([
      TEXTOS_ARMAZON.inicio,
      TEXTOS_ARMAZON.mapa,
      TEXTOS_ARMAZON.arboles,
      TEXTOS_ARMAZON.cifras,
    ])
    expect(enlaces.map((enlace) => enlace.getAttribute('href'))).toEqual([
      RUTAS.inicio,
      RUTAS.mapa,
      RUTAS.arboles,
      RUTAS.cifras,
    ])
  })

  it.each([
    [RUTAS.arboles, TEXTOS_ARMAZON.arboles],
    [RUTAS.cifras, TEXTOS_ARMAZON.cifras],
  ])('en «%s» solo «%s» lleva aria-current', (ruta, nombre) => {
    verCabecera(ruta)
    const activos = screen
      .getAllByRole('link')
      .filter((enlace) => enlace.getAttribute('aria-current') === 'page')
    expect(activos.map((enlace) => enlace.textContent)).toEqual([nombre])
  })

  it('el botón «Menú» arranca cerrado y controla la navegación', () => {
    verCabecera(RUTAS.inicio)
    const boton = screen.getByRole('button', { name: TEXTOS_ARMAZON.menu })
    const navegacion = screen.getByRole('navigation', { name: TEXTOS_ARMAZON.navegacionPrincipal })
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(boton).toHaveAttribute('aria-controls', navegacion.id)
    expect(navegacion.id).not.toBe('')
    expect(boton).toHaveClass('boton')
  })

  it('«Menú» abre y cierra la lista con aria-expanded', () => {
    verCabecera(RUTAS.inicio)
    const boton = screen.getByRole('button', { name: TEXTOS_ARMAZON.menu })
    const navegacion = screen.getByRole('navigation', { name: TEXTOS_ARMAZON.navegacionPrincipal })
    fireEvent.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'true')
    expect(navegacion).toHaveAttribute('data-abierto', 'true')
    fireEvent.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(navegacion).toHaveAttribute('data-abierto', 'false')
  })

  it('Esc cierra el menú y devuelve el foco al botón', () => {
    verCabecera(RUTAS.inicio)
    const boton = screen.getByRole('button', { name: TEXTOS_ARMAZON.menu })
    fireEvent.click(boton)
    fireEvent.keyDown(screen.getByRole('link', { name: TEXTOS_ARMAZON.mapa }), { key: 'Escape' })
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(boton).toHaveFocus()
  })

  it('elegir un enlace cierra el menú', () => {
    verCabecera(RUTAS.inicio)
    const boton = screen.getByRole('button', { name: TEXTOS_ARMAZON.menu })
    fireEvent.click(boton)
    fireEvent.click(screen.getByRole('link', { name: TEXTOS_ARMAZON.cifras }))
    expect(boton).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('Cabecera: tipografía de los enlaces', () => {
  const regla = /\.armazon-cabecera__enlace\s*\{([^}]*)\}/.exec(estilosCss)?.[1] ?? ''
  const tamano = /--texto-sm:\s*([\d.]+)rem/.exec(escalaTokens)?.[1]

  it('los enlaces (en línea y en el menú móvil) heredan la fuente del sitio', () => {
    expect(regla).not.toBe('')
    expect(regla).not.toMatch(/font-family/)
    expect(estilosCss).not.toMatch(/\.armazon-cabecera[^{]*\{[^}]*font-family:\s*(?!inherit)/)
    expect(estilosCss).not.toMatch(/serif/)
  })

  it('miden al menos 0.875rem, resuelto desde el token', () => {
    expect(regla).toMatch(/font-size:\s*var\(--(texto-sm|texto-md|texto-cuerpo|texto-base)\)/)
    expect(Number(tamano)).toBeGreaterThanOrEqual(0.875)
  })

  it('en el menú móvil los enlaces suben a 1rem', () => {
    expect(estilosCss).toMatch(
      /@media \(width < 48rem\)[\s\S]*\.armazon-cabecera__enlace\s*\{[^}]*font-size:\s*var\(--texto-md\)/,
    )
  })

  it('el objetivo táctil de cada enlace es de 44 px', () => {
    expect(regla).toMatch(/min-block-size:\s*var\(--tamano-control\)/)
  })
})

describe('Cabecera: estilos', () => {
  it('el menú empuja el contenido: la navegación no se posiciona fuera del flujo', () => {
    expect(estilosCss).not.toMatch(/position:\s*(absolute|fixed|sticky)/)
    expect(estilosCss).toMatch(/\.armazon-cabecera__nav\s*\{[^}]*flex-basis:\s*100%/)
    expect(estilosCss).toMatch(
      /\.armazon-cabecera__nav\[data-abierto='false'\]\s*\{[^}]*display:\s*none/,
    )
  })

  it('la navegación va en línea desde 48rem y el botón «Menú» se oculta', () => {
    expect(estilosCss).toMatch(/@media \(width >= 48rem\)/)
    expect(estilosCss).toMatch(/\.armazon-cabecera__menu\s*\{[^}]*display:\s*none/)
  })

  it('a 360 px la cabecera es de una sola fila: el logo encoge y las acciones no', () => {
    expect(estilosCss).toMatch(/\.armazon-cabecera__identidad\s*\{[^}]*flex:\s*1 1 0/)
    expect(estilosCss).toMatch(/\.armazon-cabecera__identidad\s*\{[^}]*min-inline-size:\s*0/)
    expect(estilosCss).not.toMatch(/text-overflow:\s*ellipsis/)
    expect(estilosCss).not.toMatch(/white-space:\s*nowrap/)
    expect(estilosCss).toMatch(/\.armazon-cabecera__acciones\s*\{[^}]*flex:\s*none/)
    expect(estilosCss).toMatch(
      /\.armazon-cabecera\s*\{[^}]*min-block-size:\s*var\(--alto-cabecera\)/,
    )
  })

  it('la cabecera queda por encima de la hoja del mapa, opaca y sin sombra de color', () => {
    expect(estilosCss).toMatch(/\.armazon-cabecera\s*\{[^}]*position:\s*relative/)
    expect(estilosCss).toMatch(/\.armazon-cabecera\s*\{[^}]*z-index:\s*var\(--capa-cabecera\)/)
    expect(estilosCss).toMatch(/\.armazon-cabecera\s*\{[^}]*background:\s*var\(--color-fondo\)/)
    expect(estilosCss).not.toMatch(/box-shadow/)
  })

  it('la píldora se queda en los enlaces de navegación', () => {
    expect(estilosCss).toMatch(/\.armazon-cabecera__enlace\s*\{[^}]*var\(--radio-pildora\)/)
    expect(estilosCss.match(/--radio-pildora/g)).toHaveLength(1)
  })

  it('el hover está protegido y la ruta activa pesa 600 sobre la tarjeta', () => {
    expect(estilosCss).toContain('@media (hover: hover) and (pointer: fine)')
    expect(estilosCss).toMatch(
      /\[aria-current='page'\]\s*\{[^}]*background:\s*var\(--color-tarjeta\)/,
    )
    expect(estilosCss).toMatch(/\[aria-current='page'\]\s*\{[^}]*font-weight:\s*600/)
  })
})
