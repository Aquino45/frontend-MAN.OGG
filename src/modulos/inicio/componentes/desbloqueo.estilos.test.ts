import { describe, expect, it } from 'vitest'
import contribuir from '../../../../CONTRIBUTING.md?raw'
import arquitectura from '../../../../docs/ARQUITECTURA.md?raw'
import estado from '../../../../docs/ESTADO.md?raw'
import readme from '../../../../README.md?raw'
import arbolCss from '../arbol.estilos.css?raw'
import desbloqueoCss from './desbloqueo.estilos.css?raw'

describe('estilos del desbloqueo', () => {
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

  it('todo empieza invisible (sin destello) y el velo y el texto salen de tokens', () => {
    for (const parte of ['atenuado', 'candado', 'palabra']) {
      expect(desbloqueoCss).toMatch(new RegExp(`\\.desbloqueo__${parte}\\s*\\{[^}]*opacity:\\s*0`))
    }
    expect(desbloqueoCss).toMatch(/\.desbloqueo__linea\s*\{[^}]*transform:\s*scaleX\(0\)/)
    expect(desbloqueoCss).toMatch(/font-size:\s*var\(--desbloqueo-texto\)/)
    expect(desbloqueoCss).toMatch(/block-size:\s*var\(--desbloqueo-borde-chapa\)/)
  })

  it('el texto va en lectura sobre el velo de noche, con la línea de la marca', () => {
    expect(desbloqueoCss).toMatch(/\.desbloqueo__atenuado\s*\{[^}]*var\(--tronco-noche\)/)
    const regla = desbloqueoCss.match(/\.desbloqueo__texto\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(regla).toMatch(/color:\s*var\(--texto-lectura\)/)
    expect(regla).toMatch(/font-family:\s*var\(--fuente-display\)/)
    expect(regla).toMatch(/font-weight:\s*800/)
    expect(desbloqueoCss).toMatch(/\.desbloqueo__linea\s*\{[^}]*var\(--copa-magenta\)/)
  })

  it('con «reducir movimiento» se ve todo fijo, con el candado abierto, y sin velo', () => {
    expect(desbloqueoCss).toMatch(
      /\[data-reducido\] \.desbloqueo__candado,\s*\.cortina-hojas\[data-reducido\] \.desbloqueo__palabra\s*\{\s*opacity:\s*1/,
    )
    expect(desbloqueoCss).toMatch(/\[data-reducido\] \.desbloqueo__linea\s*\{\s*transform:\s*none/)
    expect(desbloqueoCss).toMatch(/\[data-reducido\] \.desbloqueo__atenuado\s*\{\s*display:\s*none/)
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
