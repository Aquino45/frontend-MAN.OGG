import { describe, expect, it } from 'vitest'
import { CORTINA_CURVA } from '@/config/constantes'
import movimientoTokens from '@/styles/movimiento.tokens.css?raw'
import tokensCss from '@/styles/tokens.css?raw'
import cortinaCss from './cortinaHojas.estilos.css?raw'

describe('estilos de la cortina de hojas', () => {
  it('no escribe colores ni duraciones a mano: todo sale de tokens', () => {
    expect(cortinaCss).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/)
    expect(cortinaCss).not.toMatch(/\d(ms|s)\b/)
  })

  it('el movimiento lo lleva el código: el CSS no define animaciones ni transiciones', () => {
    expect(cortinaCss).not.toMatch(/@keyframes|animation|transition/)
  })

  it('la curva de las animaciones es la misma --curva-salida del sitio', () => {
    const token = movimientoTokens.match(/--curva-salida:\s*cubic-bezier\(([^)]*)\)/)?.[1]
    expect(token).toBeDefined()
    expect(token?.split(',').map(Number)).toEqual([...CORTINA_CURVA])
  })

  it('la capa sale de un token que no es de color', () => {
    expect(cortinaCss).toMatch(/z-index:\s*var\(--capa-desbloqueo\)/)
    expect(tokensCss).toMatch(/--capa-desbloqueo:\s*\d+/)
  })

  it('cubre toda la pantalla, bloquea lo de abajo y empieza invisible (sin destello)', () => {
    expect(cortinaCss).toMatch(/\.cortina-hojas\s*\{[^}]*position:\s*fixed/)
    expect(cortinaCss).toMatch(/\.cortina-hojas\s*\{[^}]*inset:\s*0/)
    expect(cortinaCss).toMatch(/\.cortina-hojas\s*\{[^}]*touch-action:\s*none/)
    for (const parte of ['fondo', 'hoja']) {
      expect(cortinaCss).toMatch(new RegExp(`\\.cortina-hojas__${parte}\\s*\\{[^}]*opacity:\\s*0`))
    }
  })

  it('montada sin activar queda oculta y no recibe el puntero', () => {
    expect(cortinaCss).toMatch(
      /\.cortina-hojas:not\(\[data-activa\]\)\s*\{[^}]*visibility:\s*hidden[^}]*pointer-events:\s*none/,
    )
  })

  it('con «reducir movimiento» se ve el fondo fijo y no hay hojas', () => {
    expect(cortinaCss).toMatch(/\[data-reducido\] \.cortina-hojas__fondo\s*\{\s*opacity:\s*1/)
    expect(cortinaCss).toMatch(/\[data-reducido\] \.cortina-hojas__hoja\s*\{\s*display:\s*none/)
  })
})
