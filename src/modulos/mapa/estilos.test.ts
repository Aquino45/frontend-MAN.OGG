import { describe, expect, it } from 'vitest'
import { CORTE_PANEL_LATERAL_REM } from '@/config/constantes'
import estilosCss from './estilos.css?raw'

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
})
