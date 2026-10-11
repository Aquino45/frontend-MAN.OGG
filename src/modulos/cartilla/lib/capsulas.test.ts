import { describe, expect, it } from 'vitest'
import { arbolDemoMock } from '@/mocks'
import {
  CAMPOS_AYUDA_VISIBLES,
  explicacionesDelEstado,
  indexarCapsulas,
  llenarPlantilla,
} from './capsulas'

describe('llenarPlantilla', () => {
  it('reemplaza cada marcador por su valor', () => {
    expect(llenarPlantilla('Qué significa {titulo}', { '{titulo}': 'Altura' })).toBe(
      'Qué significa Altura',
    )
  })
})

describe('indexarCapsulas', () => {
  it('indexa por campo, tal como lo manda el contrato', () => {
    const indice = indexarCapsulas(arbolDemoMock.capsulas)
    expect(indice.size).toBe(arbolDemoMock.capsulas.length)
    expect(indice.get('dap_cm')?.campo).toBe('dap_cm')
    expect(indice.get('no_existe')).toBeUndefined()
  })

  it('una lista vacía da un índice vacío', () => {
    expect(indexarCapsulas([]).size).toBe(0)
  })
})

describe('CAMPOS_AYUDA_VISIBLES', () => {
  it('son nombres del contrato que las cápsulas del ejemplo sí traen', () => {
    const campos = arbolDemoMock.capsulas.map((capsula) => capsula.campo)
    for (const campo of CAMPOS_AYUDA_VISIBLES) expect(campos).toContain(campo)
  })

  it('no repite campos', () => {
    expect(new Set(CAMPOS_AYUDA_VISIBLES).size).toBe(CAMPOS_AYUDA_VISIBLES.length)
  })
})

describe('explicacionesDelEstado', () => {
  it('devuelve solo las en_este_arbol de estado general, copa, tronco y raíces, en ese orden', () => {
    const capsulas = [
      { campo: 'raices_base', titulo: 'Raíces', que_es: 'a', en_este_arbol: 'r' },
      { campo: 'dap_cm', titulo: 'DAP', que_es: 'b', en_este_arbol: 'no cuenta' },
      { campo: 'estado_general', titulo: 'Estado', que_es: 'c', en_este_arbol: 'g' },
      { campo: 'tronco_danos', titulo: 'Tronco', que_es: 'd', en_este_arbol: null },
      { campo: 'estado_copa', titulo: 'Copa', que_es: 'e', en_este_arbol: 'c' },
    ]
    expect(explicacionesDelEstado(capsulas).map((capsula) => capsula.campo)).toEqual([
      'estado_general',
      'estado_copa',
      'raices_base',
    ])
  })

  it('sin cápsulas no hay nada que explicar', () => {
    expect(explicacionesDelEstado([])).toEqual([])
  })
})
