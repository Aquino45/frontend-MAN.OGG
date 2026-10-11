import { describe, expect, it } from 'vitest'
import { CORTE_PANEL_LATERAL_REM } from '@/config/constantes'
import estilosBase from './estilos.css?raw'
import estilosDestacados from './destacados.estilos.css?raw'

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

  it('el brillo de la estrella usa ease-out y se apaga con movimiento reducido', () => {
    expect(estilosDestacados).toContain('@keyframes brillo-destacado')
    expect(estilosDestacados).toMatch(
      /\.punto-arbol--destacado\s*\{[^}]*animation:[^;]*var\(--destacado-brillo-duracion\) var\(--curva-salida\)/,
    )
    const bloqueReducido = estilosDestacados.slice(
      estilosDestacados.indexOf('@media (prefers-reduced-motion'),
    )
    expect(bloqueReducido).toMatch(/\.punto-arbol--destacado\s*\{[^}]*animation:\s*none/)
  })

  it('la estrella tiene foco visible por teclado', () => {
    expect(estilosDestacados).toContain('.punto-arbol--destacado:focus-visible')
  })
})
