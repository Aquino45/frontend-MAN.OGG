import { describe, expect, it } from 'vitest'
import { arbolDePrueba } from './fabricasDePrueba'
import {
  aplicarFiltros,
  escribirFiltros,
  FILTROS_INICIALES,
  hayFiltros,
  leerFiltros,
} from './filtrosTablero'

const SECTORES = [1, 2, 3]

describe('leerFiltros', () => {
  it('sin parámetros, todo en «todos»', () => {
    expect(leerFiltros(new URLSearchParams(), SECTORES)).toEqual(FILTROS_INICIALES)
  })

  it('lee sector, datos, especie y métrica', () => {
    const filtros = leerFiltros(
      new URLSearchParams('sector=2&datos=campo&especie=Prosopis%20pallida&metrica=co2'),
      SECTORES,
    )
    expect(filtros).toEqual({
      sector: 2,
      datos: 'campo',
      especie: 'Prosopis pallida',
      metrica: 'co2',
    })
  })

  it('un sector que no existe o un valor raro vuelven al valor por defecto', () => {
    const filtros = leerFiltros(
      new URLSearchParams('sector=9&datos=todo&metrica=raro&especie=%20%20'),
      SECTORES,
    )
    expect(filtros).toEqual(FILTROS_INICIALES)
    expect(leerFiltros(new URLSearchParams('sector=abc'), SECTORES).sector).toBeNull()
  })
})

describe('escribirFiltros', () => {
  it('no escribe lo que vale lo de por defecto', () => {
    expect(escribirFiltros(new URLSearchParams(), FILTROS_INICIALES).toString()).toBe('')
  })

  it('escribe los filtros activos y conserva lo demás de la URL', () => {
    const nuevos = escribirFiltros(new URLSearchParams('otro=1'), {
      sector: 3,
      datos: 'ejemplo',
      especie: 'Schinus',
      metrica: 'dap',
    })
    expect(nuevos.get('otro')).toBe('1')
    expect(nuevos.get('sector')).toBe('3')
    expect(nuevos.get('datos')).toBe('ejemplo')
    expect(nuevos.get('especie')).toBe('Schinus')
    expect(nuevos.get('metrica')).toBe('dap')
  })

  it('quitar un filtro borra su parámetro', () => {
    const nuevos = escribirFiltros(new URLSearchParams('sector=2&datos=campo'), FILTROS_INICIALES)
    expect(nuevos.toString()).toBe('')
  })

  it('ida y vuelta: lo escrito se lee igual', () => {
    const filtros = { sector: 2, datos: 'campo', especie: 'A b', metrica: 'co2' } as const
    expect(leerFiltros(escribirFiltros(new URLSearchParams(), filtros), SECTORES)).toEqual(filtros)
  })
})

describe('hayFiltros', () => {
  it('la métrica del mapa no cuenta como filtro', () => {
    expect(hayFiltros(FILTROS_INICIALES)).toBe(false)
    expect(hayFiltros({ ...FILTROS_INICIALES, metrica: 'co2' })).toBe(false)
    expect(hayFiltros({ ...FILTROS_INICIALES, sector: 1 })).toBe(true)
    expect(hayFiltros({ ...FILTROS_INICIALES, especie: 'X' })).toBe(true)
  })
})

describe('aplicarFiltros', () => {
  const ARBOLES = [
    arbolDePrueba('S01-A001', { nombre_cientifico: 'Schinus' }),
    arbolDePrueba('S01-D001', { nombre_cientifico: 'Ficus', demo: true }),
    arbolDePrueba('S02-D001', { nombre_cientifico: 'Schinus', demo: true }),
  ]
  const codigos = (lista: typeof ARBOLES) => lista.map(({ properties }) => properties.codigo)

  it('sin filtros devuelve todos', () => {
    expect(aplicarFiltros(ARBOLES, FILTROS_INICIALES)).toHaveLength(3)
  })

  it('por sector, por datos y por especie, combinados', () => {
    expect(codigos(aplicarFiltros(ARBOLES, { ...FILTROS_INICIALES, sector: 1 }))).toEqual([
      'S01-A001',
      'S01-D001',
    ])
    expect(codigos(aplicarFiltros(ARBOLES, { ...FILTROS_INICIALES, datos: 'campo' }))).toEqual([
      'S01-A001',
    ])
    expect(codigos(aplicarFiltros(ARBOLES, { ...FILTROS_INICIALES, datos: 'ejemplo' }))).toEqual([
      'S01-D001',
      'S02-D001',
    ])
    expect(
      codigos(aplicarFiltros(ARBOLES, { ...FILTROS_INICIALES, especie: 'Schinus', sector: 2 })),
    ).toEqual(['S02-D001'])
  })

  it('el alcance deja fuera el sector o la especie para comparar entre ellos', () => {
    const filtros = { ...FILTROS_INICIALES, sector: 1, especie: 'Ficus' }
    expect(codigos(aplicarFiltros(ARBOLES, filtros))).toEqual(['S01-D001'])
    expect(codigos(aplicarFiltros(ARBOLES, filtros, { sector: false }))).toEqual(['S01-D001'])
    expect(codigos(aplicarFiltros(ARBOLES, filtros, { especie: false }))).toEqual([
      'S01-A001',
      'S01-D001',
    ])
  })
})
