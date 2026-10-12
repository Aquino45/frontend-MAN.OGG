import { describe, expect, it } from 'vitest'
import type { ArbolResumen } from '@/api/cliente'
import {
  FILTROS_VACIOS,
  filtrarArboles,
  hayFiltros,
  leerFiltros,
  normalizarTexto,
  opcionesDeEstado,
  ordenarArboles,
  escribirFiltros,
  type FiltrosExplorar,
} from './filtros'

function arbol(codigo: string, cambios: Partial<ArbolResumen> = {}): ArbolResumen {
  return {
    codigo,
    uid: `uid-${codigo}`,
    sector: Number(codigo.slice(1, 3)),
    nombre_comun: null,
    nombre_cientifico: null,
    estado_general: null,
    foto_miniatura_url: null,
    demo: false,
    destacado: false,
    motivo_destacado: null,
    co2_almacenado_kg: null,
    co2_captura_anual_kg: null,
    co2_simulado: false,
    ...cambios,
  }
}

const ARBOLES: ArbolResumen[] = [
  arbol('S01-A001', {
    nombre_comun: 'Molle',
    nombre_cientifico: 'Schinus molle',
    estado_general: 'Bueno',
  }),
  arbol('S01-A002', {
    nombre_comun: 'Palma real',
    nombre_cientifico: 'Roystonea',
    estado_general: 'Regular',
  }),
  arbol('S02-A001', {
    nombre_comun: 'Huarango',
    nombre_cientifico: 'Prosopis pallida',
    estado_general: 'Regular',
    demo: true,
    destacado: true,
    motivo_destacado: 'Ejemplar grande',
  }),
  arbol('S02-A010', { nombre_comun: 'Álamo', demo: true }),
  arbol('S03-A001'),
]

const codigos = (lista: ArbolResumen[]) => lista.map((a) => a.codigo)
const con = (cambios: Partial<FiltrosExplorar>): FiltrosExplorar => ({
  ...FILTROS_VACIOS,
  ...cambios,
})

describe('normalizarTexto', () => {
  it('ignora mayúsculas, tildes y espacios de los bordes', () => {
    expect(normalizarTexto('  ÁLAMO ')).toBe('alamo')
    expect(normalizarTexto('Árbol Ñandú')).toBe('arbol nandu')
  })
})

describe('leerFiltros y escribirFiltros', () => {
  it('una URL sin parámetros da los filtros vacíos y se escribe como cadena vacía', () => {
    expect(leerFiltros('')).toEqual(FILTROS_VACIOS)
    expect(escribirFiltros(FILTROS_VACIOS)).toBe('')
  })

  it('lee todos los parámetros', () => {
    const filtros = leerFiltros('?q=molle&sector=2&estado=Regular&destacados=1&origen=ejemplo')
    expect(filtros).toEqual({
      busqueda: 'molle',
      sectorId: 2,
      estadoGeneral: 'Regular',
      soloDestacados: true,
      origen: 'ejemplo',
    })
  })

  it('escribir y volver a leer reproduce el mismo estado (también con tildes y espacios)', () => {
    const filtros = con({
      busqueda: 'palma real ñ',
      sectorId: 3,
      estadoGeneral: 'Por verificar',
      soloDestacados: true,
      origen: 'campo',
    })
    const consulta = escribirFiltros(filtros)
    expect(consulta.startsWith('?')).toBe(true)
    expect(leerFiltros(consulta)).toEqual(filtros)
  })

  it('los valores inválidos se ignoran', () => {
    const filtros = leerFiltros('?sector=abc&origen=otro&destacados=0&estado=')
    expect(filtros).toEqual(FILTROS_VACIOS)
  })

  it('solo escribe lo que está activo', () => {
    expect(escribirFiltros(con({ sectorId: 1 }))).toBe('?sector=1')
  })
})

describe('hayFiltros', () => {
  it('es falso sin filtros y verdadero con cualquiera', () => {
    expect(hayFiltros(FILTROS_VACIOS)).toBe(false)
    expect(hayFiltros(con({ busqueda: '  ' }))).toBe(false)
    expect(hayFiltros(con({ busqueda: 'a' }))).toBe(true)
    expect(hayFiltros(con({ soloDestacados: true }))).toBe(true)
    expect(hayFiltros(con({ sectorId: 1 }))).toBe(true)
  })
})

describe('filtrarArboles', () => {
  it('sin filtros devuelve todos', () => {
    expect(filtrarArboles(ARBOLES, FILTROS_VACIOS)).toHaveLength(ARBOLES.length)
  })

  it.each([
    ['código', 's02-a010', ['S02-A010']],
    ['nombre común', 'palma', ['S01-A002']],
    ['nombre científico', 'PROSOPIS', ['S02-A001']],
    ['sin tildes', 'alamo', ['S02-A010']],
    ['con tildes', 'ÁLAMO', ['S02-A010']],
  ])('busca por %s', (_nombre, texto, esperados) => {
    expect(codigos(filtrarArboles(ARBOLES, con({ busqueda: texto })))).toEqual(esperados)
  })

  it('la búsqueda no encuentra un campo null ni inventa coincidencias', () => {
    expect(filtrarArboles(ARBOLES, con({ busqueda: 'null' }))).toEqual([])
  })

  it('filtra por sector', () => {
    expect(codigos(filtrarArboles(ARBOLES, con({ sectorId: 2 })))).toEqual(['S02-A001', 'S02-A010'])
  })

  it('filtra por estado general', () => {
    expect(codigos(filtrarArboles(ARBOLES, con({ estadoGeneral: 'Regular' })))).toEqual([
      'S01-A002',
      'S02-A001',
    ])
  })

  it('filtra por destacado', () => {
    expect(codigos(filtrarArboles(ARBOLES, con({ soloDestacados: true })))).toEqual(['S02-A001'])
  })

  it('filtra por origen: campo (demo false) o ejemplo (demo true)', () => {
    expect(codigos(filtrarArboles(ARBOLES, con({ origen: 'ejemplo' })))).toEqual([
      'S02-A001',
      'S02-A010',
    ])
    expect(filtrarArboles(ARBOLES, con({ origen: 'campo' }))).toHaveLength(3)
  })

  it('combina todos los filtros con «y»', () => {
    const filtros = con({
      busqueda: 'prosopis',
      sectorId: 2,
      estadoGeneral: 'Regular',
      origen: 'ejemplo',
      soloDestacados: true,
    })
    expect(codigos(filtrarArboles(ARBOLES, filtros))).toEqual(['S02-A001'])
    expect(filtrarArboles(ARBOLES, { ...filtros, sectorId: 1 })).toEqual([])
  })
})

describe('ordenarArboles', () => {
  it('ordena por sector y luego por código, sin importar cómo lleguen', () => {
    const desordenados = [ARBOLES[4], ARBOLES[3], ARBOLES[0], ARBOLES[2], ARBOLES[1]]
    expect(codigos(ordenarArboles(desordenados))).toEqual(codigos(ARBOLES))
  })

  it('no modifica la lista original', () => {
    const copia = [ARBOLES[1], ARBOLES[0]]
    ordenarArboles(copia)
    expect(codigos(copia)).toEqual(['S01-A002', 'S01-A001'])
  })

  it('compara los números del código como números', () => {
    const lista = [arbol('S01-A010'), arbol('S01-A002')]
    expect(codigos(ordenarArboles(lista))).toEqual(['S01-A002', 'S01-A010'])
  })
})

describe('opcionesDeEstado', () => {
  it('son los valores distintos que traen los árboles, ordenados y sin null', () => {
    expect(opcionesDeEstado(ARBOLES)).toEqual(['Bueno', 'Regular'])
  })

  it('sin árboles no hay opciones', () => {
    expect(opcionesDeEstado([])).toEqual([])
  })
})
