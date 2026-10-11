import { describe, expect, it } from 'vitest'
import { CORTE_PANEL_LATERAL_REM } from '@/config/constantes'
import estilosBase from './estilos.css?raw'
import estilosDestacados from './destacados.estilos.css?raw'
import estilosBotones from '@/styles/botones.estilos.css?raw'

const estilosCss = estilosBase

// El CSS no puede leer las constantes: este test comprueba que el corte entre el panel lateral
// y la hoja inferior coincide con CORTE_PANEL_LATERAL_REM.
describe('estilos del mapa', () => {
  it('el panel va al costado desde el corte y es hoja inferior por debajo', () => {
    expect(estilosCss).toContain(`@media (min-width: ${CORTE_PANEL_LATERAL_REM}rem)`)
    expect(estilosCss).toContain(`@media (max-width: ${CORTE_PANEL_LATERAL_REM - 0.01}rem)`)
  })

  it('desactiva animaciones y transiciones con movimiento reducido', () => {
    expect(estilosCss).toContain('prefers-reduced-motion: reduce')
  })

  it('la estrella usa solo tokens, sin colores literales', () => {
    const reglas = estilosDestacados.match(/\.punto-arbol--destacado[^{]*\{[^}]*\}/g) ?? []
    expect(reglas.length).toBeGreaterThan(0)
    expect(reglas.join('\n')).toContain('var(--punto-destacado)')
    expect(reglas.join('\n')).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i)
  })

  it('la estrella es ámbar fija: sin destello, sin brillo, sin animación', () => {
    expect(estilosDestacados).not.toContain('@keyframes')
    expect(estilosDestacados).not.toContain('brillo')
    expect(estilosDestacados).not.toContain('brightness')
    expect(estilosDestacados).not.toMatch(/animation\s*:/)
  })

  it('la estrella tiene foco visible por teclado', () => {
    expect(estilosDestacados).toContain('.punto-arbol--destacado:focus-visible')
  })
})

describe('hoja inferior', () => {
  const hoja = estilosCss.slice(
    estilosCss.indexOf(`(max-width: ${CORTE_PANEL_LATERAL_REM - 0.01}rem)`),
  )

  it('nunca pasa por encima de la cabecera', () => {
    expect(hoja).toMatch(
      /max-block-size:\s*min\(\s*var\(--alto-hoja\),\s*calc\(100dvh - var\(--alto-cabecera\)\)\s*\)/,
    )
  })

  it('llega a --alto-hoja en dvh, suma la zona segura y usa la sombra y el radio del sistema', () => {
    expect(hoja).toContain('var(--alto-hoja)')
    expect(hoja).toContain('env(safe-area-inset-bottom')
    expect(hoja).toMatch(/box-shadow:\s*var\(--sombra-flotante\)/)
    expect(hoja).toContain('var(--radio-tarjeta)')
    expect(hoja).toContain('var(--duracion-hoja)')
    expect(hoja).toContain('var(--curva-hoja)')
  })

  it('no usa unidades vh para su alto', () => {
    expect(estilosCss).not.toMatch(/\d\s*vh\b/)
    expect(estilosCss).not.toMatch(/--hoja-alto/)
  })
})

describe('barra del botón de volver dentro de la hoja', () => {
  const barra =
    estilosCss.match(
      /\.vista-mapa__panel :is\(\.vista-cartilla__volver, \.panel-sector__volver\)\s*\{[^}]*\}/,
    )?.[0] ?? ''

  it('es una fila propia, pegada arriba y con el fondo opaco de la hoja', () => {
    expect(barra).toMatch(/position:\s*sticky/)
    expect(barra).toMatch(/inset-block-start:\s*0/)
    expect(barra).toMatch(/align-self:\s*stretch/)
    expect(barra).toMatch(/--boton-fondo:\s*var\(--color-fondo\)/)
    expect(barra).toMatch(/--boton-fondo-hover:\s*var\(--color-fondo\)/)
    expect(barra).not.toMatch(/box-shadow|drop-shadow/)
  })

  it('un relleno del mismo fondo tapa el hueco de arriba y de abajo de la barra', () => {
    expect(estilosCss).toMatch(
      /__volver\)::before,\s*\.vista-mapa__panel :is\([^)]*\)::after\s*\{[^}]*background:\s*var\(--color-fondo\)/,
    )
    expect(estilosCss).toMatch(/__volver\)::before\s*\{[^}]*inset-block-end:\s*100%/)
    expect(estilosCss).toMatch(/__volver\)::after\s*\{[^}]*inset-block-start:\s*100%/)
  })
})

describe('panel sin repetir su entrada', () => {
  it('el panel lateral no se anima: solo la hoja inferior entra, una vez, con transform', () => {
    expect(estilosCss).not.toContain('entrada-panel')
    const lateral = estilosCss.slice(
      estilosCss.indexOf('.vista-mapa__panel {'),
      estilosCss.indexOf('.panel-sector,'),
    )
    expect(lateral).not.toMatch(/animation/)
    expect(estilosCss).toMatch(/@keyframes entrada-hoja\s*\{\s*from\s*\{[^}]*translateY\(100%\)/)
  })
})

describe('fila del sector a 360 px', () => {
  it('no se corta: min-width 0, texto que parte palabras largas y objetivo de 44 px', () => {
    expect(estilosCss).toMatch(/\.fila-arbol\s*\{[^}]*min-block-size:\s*var\(--tamano-control\)/)
    expect(estilosCss).toMatch(/\.fila-arbol__texto\s*\{[^}]*min-inline-size:\s*0/)
    expect(estilosCss).toMatch(/\.fila-arbol__texto\s*\{[^}]*overflow-wrap:\s*anywhere/)
    expect(estilosCss).toMatch(/\.fila-arbol__datos\s*\{[^}]*flex-wrap:\s*wrap/)
  })
})

describe('movimiento del mapa', () => {
  it('ninguna hoja del mapa usa ease-in ni las duraciones y escalas antiguas', () => {
    for (const css of [estilosCss, estilosDestacados]) {
      expect(css).not.toMatch(/(^|[\s:,])ease-in(?![\w-])/)
      expect(css).not.toMatch(/--duracion-media|--duracion-rapida|--escala-presion/)
    }
  })

  it('lo que se presiona escala con --escala-activo', () => {
    expect(estilosCss).toMatch(/\.fila-arbol:active\s*\{[^}]*scale\(var\(--escala-activo\)\)/)
    expect(estilosCss).toContain('var(--duracion-presion)')
  })

  it('el hover del panel va dentro de la consulta protegida', () => {
    expect(estilosCss).not.toMatch(/@media \(hover: hover\)\s*\{/)
    expect(estilosCss).toContain('@media (hover: hover) and (pointer: fine)')
  })

  it('el botón de texto antiguo ya no existe', () => {
    expect(estilosBotones).not.toContain('.boton--texto')
  })
})
