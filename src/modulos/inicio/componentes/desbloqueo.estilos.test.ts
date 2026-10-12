import { describe, expect, it } from 'vitest'
import { DESBLOQUEO_CURVA } from '@/config/constantes'
import contribuir from '../../../../CONTRIBUTING.md?raw'
import arquitectura from '../../../../docs/ARQUITECTURA.md?raw'
import estado from '../../../../docs/ESTADO.md?raw'
import readme from '../../../../README.md?raw'
import movimientoTokens from '@/styles/movimiento.tokens.css?raw'
import tokensCss from '@/styles/tokens.css?raw'
import arbolCss from '../arbol.estilos.css?raw'
import desbloqueoCss from './desbloqueo.estilos.css?raw'

describe('estilos de la cortina de desbloqueo', () => {
  it('no escribe colores ni duraciones a mano: todo sale de tokens', () => {
    expect(desbloqueoCss).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/)
    expect(desbloqueoCss).not.toMatch(/\d(ms|s)\b/)
  })

  it('el movimiento lo lleva el código: el CSS no define animaciones ni transiciones', () => {
    expect(desbloqueoCss).not.toMatch(/@keyframes|animation|transition/)
    expect(arbolCss.slice(arbolCss.indexOf('arbol-animado__senal'))).not.toMatch(
      /@keyframes|animation|transition/,
    )
  })

  it('la curva de las animaciones es la misma --curva-salida del sitio', () => {
    const token = movimientoTokens.match(/--curva-salida:\s*cubic-bezier\(([^)]*)\)/)?.[1]
    expect(token).toBeDefined()
    expect(token?.split(',').map(Number)).toEqual([...DESBLOQUEO_CURVA])
  })

  it('la capa y las medidas del texto salen de tokens que no son de color', () => {
    expect(desbloqueoCss).toMatch(/z-index:\s*var\(--capa-desbloqueo\)/)
    expect(tokensCss).toMatch(/--capa-desbloqueo:\s*\d+/)
    expect(desbloqueoCss).toMatch(/font-size:\s*var\(--desbloqueo-texto\)/)
    expect(desbloqueoCss).toMatch(/border:\s*var\(--desbloqueo-borde-chapa\)/)
  })

  it('cubre toda la pantalla, bloquea lo de abajo y empieza invisible (sin destello)', () => {
    expect(desbloqueoCss).toMatch(/\.desbloqueo\s*\{[^}]*position:\s*fixed/)
    expect(desbloqueoCss).toMatch(/\.desbloqueo\s*\{[^}]*inset:\s*0/)
    expect(desbloqueoCss).toMatch(/\.desbloqueo\s*\{[^}]*touch-action:\s*none/)
    for (const parte of ['fondo', 'hoja', 'chapa']) {
      expect(desbloqueoCss).toMatch(new RegExp(`\\.desbloqueo__${parte}\\s*\\{[^}]*opacity:\\s*0`))
    }
  })

  it('montada sin activar queda oculta y no recibe el puntero', () => {
    expect(desbloqueoCss).toMatch(
      /\.desbloqueo:not\(\[data-activa\]\)\s*\{[^}]*visibility:\s*hidden[^}]*pointer-events:\s*none/,
    )
  })

  it('el texto va en lectura sobre noche con borde de la marca: contraste sobre las hojas', () => {
    const regla = desbloqueoCss.match(/\.desbloqueo__texto\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(regla).toMatch(/background:\s*var\(--tronco-noche\)/)
    expect(regla).toMatch(/color:\s*var\(--texto-lectura\)/)
    expect(regla).toMatch(/var\(--copa-magenta\)/)
    expect(regla).toMatch(/font-family:\s*var\(--fuente-display\)/)
    expect(regla).toMatch(/font-weight:\s*800/)
  })

  it('con «reducir movimiento» se ve el fondo y el texto fijos y no hay hojas', () => {
    expect(desbloqueoCss).toMatch(
      /\[data-reducido\] \.desbloqueo__fondo,\s*\.desbloqueo\[data-reducido\] \.desbloqueo__chapa\s*\{\s*opacity:\s*1/,
    )
    expect(desbloqueoCss).toMatch(/\[data-reducido\] \.desbloqueo__hoja\s*\{\s*display:\s*none/)
  })

  it('la señal de progreso usa el color de lectura y no recibe el puntero', () => {
    const regla = arbolCss.match(/\.arbol-animado__senal\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(regla).toMatch(/fill:\s*var\(--texto-lectura\)/)
    expect(regla).toMatch(/pointer-events:\s*none/)
    expect(regla).toMatch(/opacity:\s*0/)
  })

  it('el acceso queda fuera de las docs públicas', () => {
    for (const texto of [readme, contribuir, arquitectura, estado]) {
      expect(texto).not.toMatch(/VITE_URL_PANEL|desbloque|mantener presionado/i)
    }
  })
})
