import { describe, expect, it } from 'vitest'
import botonesCss from './botones.estilos.css?raw'
import elevableCss from './elevable.estilos.css?raw'
import escalaCss from './escala.tokens.css?raw'
import movimientoCss from './movimiento.tokens.css?raw'

describe('tarjetas y filas vivas', () => {
  it('la sombra va en un pseudo-elemento que cambia de opacidad; no se anima box-shadow', () => {
    expect(elevableCss).toMatch(/\.elevable::after\s*\{[^}]*box-shadow:\s*var\(--sombra-elevada\)/)
    expect(elevableCss).toMatch(/\.elevable::after\s*\{[^}]*opacity:\s*0/)
    expect(elevableCss).toMatch(/transition:\s*opacity/)
    expect(elevableCss).not.toMatch(/transition:[^;]*box-shadow/)
  })

  it('sube solo con puntero fino y sin pedir menos movimiento, y no mientras se presiona', () => {
    expect(elevableCss).toContain(
      '@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    )
    expect(elevableCss).toContain('.elevable:hover:not(:active)')
    expect(elevableCss).toMatch(/translateY\(var\(--elevacion-hover\)\)/)
  })

  it('la elevación es de 2 a 4 px hacia arriba', () => {
    const elevacion = Number(/--elevacion-hover:\s*-(\d+)px/.exec(movimientoCss)?.[1])
    expect(elevacion).toBeGreaterThanOrEqual(2)
    expect(elevacion).toBeLessThanOrEqual(4)
  })

  it('la sombra usa el color de sombra del sistema, sin colores literales', () => {
    expect(escalaCss).toMatch(/--sombra-elevada:[^;]*var\(--color-sombra\)/)
    expect(elevableCss).not.toMatch(/#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(/)
  })

  it('la presión se nota: escala de 0.96 a 0.98 y el botón toma su color activo', () => {
    const escala = Number(/--escala-activo:\s*([\d.]+)/.exec(movimientoCss)?.[1])
    expect(escala).toBeGreaterThanOrEqual(0.96)
    expect(escala).toBeLessThanOrEqual(0.98)
    expect(botonesCss).toMatch(
      /\.boton:active\s*\{[^}]*background-color:\s*var\(--boton-fondo-hover\)/,
    )
  })
})
