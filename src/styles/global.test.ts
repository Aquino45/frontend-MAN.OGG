import { describe, expect, it } from 'vitest'
import botonesCss from './botones.estilos.css?raw'
import globalCss from './base.estilos.css?raw'

// Todas las hojas del sitio (Vitest entrega el texto de las que terminan en «estilos.css»).
const hojas = import.meta.glob('/src/**/*.css', { query: '?raw', import: 'default', eager: true })

// Texto del bloque «@media (prefers-reduced-motion: reduce) { … }» de una hoja
function bloqueMovimientoReducido(css: string): string {
  const inicio = css.indexOf('@media (prefers-reduced-motion: reduce)')
  if (inicio === -1) return ''
  const apertura = css.indexOf('{', inicio)
  let profundidad = 0
  for (let posicion = apertura; posicion < css.length; posicion++) {
    if (css[posicion] === '{') profundidad += 1
    if (css[posicion] === '}') profundidad -= 1
    if (profundidad === 0) return css.slice(apertura + 1, posicion)
  }
  return ''
}

// Las reglas de base viven en base.estilos.css, que global.css importa.
describe('reglas globales de base', () => {
  it('con movimiento reducido apaga todas las animaciones, transiciones y el desplazamiento suave', () => {
    const reducido = bloqueMovimientoReducido(globalCss)
    expect(reducido).toMatch(/animation:\s*none\s*!important/)
    expect(reducido).toMatch(/transition:\s*none\s*!important/)
    expect(reducido).toMatch(/scroll-behavior:\s*auto\s*!important/)
    expect(reducido).toMatch(/:active[^{]*\{[^}]*transform:\s*none\s*!important/)
  })

  it('el foco es un contorno de 2 px con separación de 3 px y no se dibuja en títulos', () => {
    expect(globalCss).toMatch(
      /:focus-visible\s*\{[^}]*outline:\s*var\(--grosor-foco-ui\) solid var\(--color-texto\)/,
    )
    expect(globalCss).toMatch(/:focus-visible\s*\{[^}]*outline-offset:\s*var\(--separacion-foco\)/)
    expect(globalCss).toMatch(/h2:focus[^{]*\{[^}]*outline:\s*none/)
  })

  it('lo deshabilitado baja a la mitad y muestra not-allowed', () => {
    expect(globalCss).toMatch(/:disabled[^{]*\{[^}]*opacity:\s*0\.5/)
    expect(globalCss).toMatch(/:disabled[^{]*\{[^}]*cursor:\s*not-allowed/)
  })

  it('la selección, el acento y la barra de desplazamiento salen de tokens', () => {
    expect(globalCss).toMatch(/::selection\s*\{[^}]*background:\s*var\(--seleccion-fondo\)/)
    expect(globalCss).toMatch(/::selection\s*\{[^}]*color:\s*var\(--seleccion-texto\)/)
    expect(globalCss).toMatch(/accent-color:\s*var\(--color-acento\)/)
    expect(globalCss).toMatch(/scrollbar-color:\s*var\(--scrollbar-pulgar\)/)
  })

  it('la página usa la medida de lectura y cifras tabulares', () => {
    expect(globalCss).toMatch(/tabular-nums/)
  })
})

describe('sistema de botones', () => {
  it('define primario, secundario e ícono, con píldora solo como modificador explícito', () => {
    expect(botonesCss).toMatch(/\.boton\s*\{/)
    expect(botonesCss).toMatch(/\.boton--secundario/)
    expect(botonesCss).toMatch(/\.boton--icono/)
    expect(botonesCss).toMatch(/\.boton--pildora\s*\{[^}]*border-radius:\s*var\(--radio-pildora\)/)
    expect(botonesCss.match(/--radio-pildora/g)).toHaveLength(1)
  })

  it('el hover está protegido, el activo escala 0.97 en 120 ms y el objetivo mide 44 px', () => {
    expect(botonesCss).toContain('@media (hover: hover) and (pointer: fine)')
    expect(botonesCss).toMatch(/:active\s*\{[^}]*transform:\s*scale\(var\(--escala-activo\)\)/)
    expect(botonesCss).toContain('var(--duracion-presion)')
    expect(botonesCss).toContain('var(--duracion-hover)')
    expect(botonesCss).toMatch(/min-block-size:\s*var\(--tamano-control\)/)
  })

  it('ya no queda el alias «.boton--texto»: todo usa el secundario', () => {
    expect(botonesCss).not.toContain('.boton--texto')
  })
})

describe('todas las hojas', () => {
  const todas = Object.entries(hojas) as [string, string][]

  it('ninguna usa ease-in', () => {
    const infractoras = todas
      .filter(([, css]) => /(^|[\s:,])ease-in(?![\w-])/.test(css))
      .map(([ruta]) => ruta)
    expect(infractoras).toEqual([])
  })

  it('el hover solo va dentro de la consulta protegida', () => {
    const infractoras = todas
      .filter(([, css]) => /@media \(hover: hover\)\s*\{/.test(css))
      .map(([ruta]) => ruta)
    expect(infractoras).toEqual([])
  })
})
