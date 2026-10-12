import { describe, expect, it } from 'vitest'
import {
  CORTE_PANEL_LATERAL_REM,
  HOJA_ARRASTRE,
  MAPA_CURVA_ZOOM,
  MAPA_DURACION_ENTRADA_MS,
} from '@/config/constantes'
import estilosBase from './estilos.css?raw'
import estilosHoja from './hoja.estilos.css?raw'
import estilosDestacados from './destacados.estilos.css?raw'
import sateliteCss from './satelite.estilos.css?raw'
import estilosBotones from '@/styles/botones.estilos.css?raw'
import tokensMovimiento from '@/styles/movimiento.tokens.css?raw'
import tokensBase from '@/styles/tokens.css?raw'
import panelSector from './componentes/PanelSector.tsx?raw'

// Los dos archivos del módulo: el mapa y la lista, y la hoja inferior con la barra de volver
const estilosCss = `${estilosBase}
${estilosHoja}`

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
      /max-block-size:\s*calc\(\s*min\(var\(--alto-hoja\),\s*calc\(100dvh - var\(--alto-cabecera\)\)\)\s*\+\s*var\(--hoja-extension\)\s*\)/,
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

  it('el relleno de arriba pasa del relleno de la hoja (no deja un hilo) y el asa queda encima', () => {
    expect(estilosCss).toMatch(
      /__volver\)::before\s*\{[^}]*block-size:\s*calc\(var\(--espacio-4\) \+ var\(--espacio-1\)\)/,
    )
    expect(estilosCss).toMatch(/\.vista-mapa__panel::before\s*\{[^}]*z-index:\s*2/)
  })
})

describe('entrada del panel y de la hoja', () => {
  it('el panel lateral entra una sola vez con opacidad y un corrimiento corto; la hoja, con transform', () => {
    expect(estilosCss).toMatch(/@keyframes entrada-panel\s*\{\s*from\s*\{[^}]*opacity:\s*0/)
    expect(estilosCss).toMatch(/entrada-panel[^}]*translateX\(var\(--desplazamiento-panel\)\)/)
    expect(estilosCss).toMatch(/@keyframes entrada-hoja\s*\{\s*from\s*\{[^}]*translateY\(100%\)/)
    // Pasar de la lista a la cartilla no vuelve a animar: el panel es el mismo elemento
    const lateral = estilosBase.slice(
      estilosBase.indexOf('.vista-mapa__panel {'),
      estilosBase.indexOf('.panel-sector,'),
    )
    expect(lateral).not.toMatch(/animation/)
  })
})

describe('hoja arrastrable', () => {
  it('el asa es una zona propia solo en el celular, sin desplazamiento del navegador', () => {
    expect(estilosHoja).toMatch(/\.vista-mapa__asa\s*\{\s*display:\s*none/)
    expect(estilosHoja).toMatch(/\.vista-mapa__asa\s*\{[^}]*touch-action:\s*none/)
  })

  it('mientras se arrastra no hay transición; al soltar vuelve con la curva de la hoja y sale más rápido', () => {
    expect(estilosHoja).toMatch(/\[data-arrastrando='true'\]\s*\{[^}]*transition:\s*none/)
    expect(estilosHoja).toMatch(
      /\[data-hoja='suelta'\]\s*\{[^}]*transform var\(--duracion-hoja\) var\(--curva-hoja\)/,
    )
    expect(estilosHoja).toMatch(
      /\[data-hoja='cierra'\]\s*\{[^}]*transform var\(--duracion-salida\) var\(--curva-salida\)/,
    )
  })

  it('el elástico de arriba coincide entre el CSS y las constantes', () => {
    expect(tokensBase).toContain(`--hoja-extension: ${HOJA_ARRASTRE.elasticoPx}px`)
  })

  it('el zoom del mapa usa la duración y la curva de los tokens', () => {
    expect(tokensMovimiento).toContain(`--duracion-zoom: ${MAPA_DURACION_ENTRADA_MS}ms`)
    expect(tokensMovimiento).toContain(
      `--curva-movimiento: cubic-bezier(${MAPA_CURVA_ZOOM.join(', ')})`,
    )
  })

  it('el cierre por velocidad y por distancia son los del ticket', () => {
    expect(HOJA_ARRASTRE.velocidadCierrePxPorMs).toBe(0.11)
    expect(HOJA_ARRASTRE.fraccionCierre).toBe(0.25)
  })
})

describe('cascada de puntos al entrar a un sector', () => {
  it('cada punto entra con opacidad y una escala de 0.9 o más, escalonado, solo la primera vez', () => {
    expect(estilosCss).toMatch(/@keyframes mapa-punto-entra\s*\{\s*from\s*\{[^}]*opacity:\s*0/)
    expect(estilosCss).toContain("[data-cascada='true']")
    expect(estilosCss).toContain('var(--retraso-cascada-punto)')
    expect(estilosCss).not.toMatch(/mapa-punto-entra[^}]*scale\(0(\.[0-8]\d*)?\)/)
    const retraso = Number(/--retraso-cascada-punto:\s*(\d+)ms/.exec(tokensMovimiento)?.[1])
    expect(retraso).toBe(30)
  })
})

describe('fila del sector a 360 px', () => {
  it('no se corta: min-width 0, texto que parte palabras largas y objetivo de 44 px', () => {
    expect(estilosCss).toMatch(/\.mapa-fila\s*\{[^}]*min-block-size:\s*var\(--tamano-control\)/)
    expect(estilosCss).toMatch(/\.mapa-fila__texto\s*\{[^}]*min-inline-size:\s*0/)
    expect(estilosCss).toMatch(/\.mapa-fila__texto\s*\{[^}]*overflow-wrap:\s*anywhere/)
    expect(estilosCss).toMatch(/\.mapa-fila__datos\s*\{[^}]*flex-wrap:\s*wrap/)
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
    expect(estilosCss).toMatch(/\.mapa-fila:active\s*\{[^}]*scale\(var\(--escala-activo\)\)/)
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

describe('filas vivas del panel', () => {
  it('la fila del panel es elevable', () => {
    expect(panelSector).toContain('elevable')
  })
})

describe('estilos del mapa satelital', () => {
  // MapLibre le pone `position: relative` (clase maplibregl-map) al contenedor del lienzo: si el
  // selector no es más específico, el lienzo se queda sin alto y la foto no se ve.
  it('el lienzo llena su marco con un selector que le gana a la clase de MapLibre', () => {
    expect(sateliteCss).toMatch(
      /\.mapa-satelite__marco \.mapa-satelite__lienzo\s*\{[^}]*position:\s*absolute[^}]*inset:\s*0/,
    )
  })
})
