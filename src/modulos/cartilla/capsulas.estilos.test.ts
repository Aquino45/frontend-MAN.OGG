import { describe, expect, it } from 'vitest'
import estilosCss from './capsulas.estilos.css?raw'

// Cuerpo de la primera regla cuyo selector es exactamente `selector`
function reglaDe(selector: string): string {
  const inicio = estilosCss.indexOf(`${selector} {`)
  if (inicio === -1) return ''
  return estilosCss.slice(estilosCss.indexOf('{', inicio), estilosCss.indexOf('}', inicio))
}

describe('estilos de las cápsulas «?»', () => {
  it('el botón tiene 44 px de área táctil y un ícono de 1.25rem', () => {
    const boton = reglaDe('.capsula__boton')
    expect(boton).toMatch(/inline-size:\s*var\(--tamano-control\)/)
    expect(boton).toMatch(/block-size:\s*var\(--tamano-control\)/)
    expect(reglaDe('.capsula__icono')).toMatch(/inline-size:\s*var\(--tamano-icono\)/)
  })

  it('el ícono queda separado 8 px del texto de la etiqueta, sin achicar el área táctil', () => {
    const boton = reglaDe('.capsula__boton')
    expect(boton).toMatch(
      /margin-inline-start:\s*calc\(\(var\(--tamano-icono\) - var\(--tamano-control\)\) \/ 2 \+ var\(--espacio-2\)\)/,
    )
    expect(boton).toMatch(
      /margin-block:\s*calc\(\(var\(--tamano-icono\) - var\(--tamano-control\)\) \/ 2\)/,
    )
    expect(boton).toMatch(/inline-size:\s*var\(--tamano-control\)/)
  })

  it('en una fila con separación propia (chip de estado) no suma la separación dos veces', () => {
    expect(reglaDe('.foto-arbol__estado .capsula__boton')).toMatch(/margin-inline-start:\s*calc\(/)
    expect(reglaDe('.foto-arbol__estado .capsula__boton')).not.toMatch(/espacio-2/)
  })

  it('el ícono no se encoge ni empuja el texto: el botón no se achica', () => {
    expect(reglaDe('.capsula__boton')).toMatch(/flex:\s*none/)
  })

  it('el foco lo dibuja la regla global: el botón no lo apaga', () => {
    expect(estilosCss).not.toMatch(/outline:\s*none/)
  })

  it('el hover está protegido y el activo escala 0.97', () => {
    expect(estilosCss).toContain('@media (hover: hover) and (pointer: fine)')
    expect(estilosCss).toMatch(/\.capsula__boton:active\s*\{[^}]*scale\(var\(--escala-activo\)\)/)
    const fueraDelMedia = estilosCss.replace(/@media[^{]*\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, '')
    expect(fueraDelMedia).not.toContain(':hover')
  })

  it('la burbuja se queda dentro de la cartilla en 360 px', () => {
    const burbuja = reglaDe('.capsula__burbuja')
    expect(burbuja).toMatch(/position:\s*absolute/)
    expect(burbuja).toMatch(/inset-inline:\s*var\(--espacio-3\)/)
    expect(burbuja).toMatch(/max-inline-size:/)
    expect(burbuja).toMatch(/overflow-wrap:\s*anywhere/)
    expect(burbuja).toMatch(/box-sizing:\s*border-box/)
  })

  it('la burbuja flota con la sombra única y no hereda mayúsculas ni tracking de la franja', () => {
    const burbuja = reglaDe('.capsula__burbuja')
    expect(burbuja).toMatch(/box-shadow:\s*var\(--sombra-flotante\)/)
    expect(burbuja).toMatch(/text-transform:\s*none/)
    expect(burbuja).toMatch(/letter-spacing:\s*normal/)
    expect(burbuja).toMatch(/z-index:/)
  })

  it('entra desde scale 0.98 y opacidad 0 en 200 ms y sale en 150 ms, con curvas ease-out', () => {
    expect(estilosCss).toMatch(
      /\[data-abierta='false'\]\s*\{[^}]*opacity:\s*0[^}]*scale\(var\(--entrada-escala-inicial\)\)/,
    )
    expect(estilosCss).toMatch(/\[data-abierta='true'\]\s*\{[^}]*var\(--duracion-entrada\)/)
    expect(estilosCss).toContain('var(--duracion-salida)')
    expect(estilosCss).toContain('var(--curva-salida)')
    expect(estilosCss).not.toMatch(/ease-in/)
    expect(estilosCss).not.toContain('@keyframes')
  })

  it('el cierre con teclado y el movimiento reducido no animan', () => {
    expect(estilosCss).toMatch(/\[data-sin-animacion='true'\]\s*\{[^}]*transition:\s*none/)
    const reducido = estilosCss.slice(estilosCss.lastIndexOf('prefers-reduced-motion: reduce'))
    expect(reducido).toMatch(/transition:\s*none/)
    expect(reducido).toMatch(/transform:\s*none/)
  })

  it('usa solo tokens: sin colores literales ni fuente pixel', () => {
    expect(estilosCss).not.toMatch(/#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(/)
    expect(estilosCss).not.toContain('--fuente-pixel')
  })
})
