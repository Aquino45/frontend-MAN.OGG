import { describe, expect, it } from 'vitest'
import { agruparEspecies, calcularKpis, calcularMapaCalor, especiesPorCantidad } from './tablero'
import { arbolDePrueba, sectorDePrueba } from './fabricasDePrueba'

// Un caso como el real: el mayor DAP de todos es de un árbol de ejemplo, pero el de campo es otro
const ARBOLES = [
  arbolDePrueba('S01-A001', {
    nombre_cientifico: 'Schinus',
    nombre_comun: 'Molle',
    dap_cm: 392,
    altura_total_m: 12,
    origen: 'Nativa',
    co2_almacenado_kg: 100,
    co2_captura_anual_kg: 10,
    co2_simulado: true,
  }),
  arbolDePrueba('S01-A002', {
    nombre_cientifico: 'Roystonea regia',
    dap_cm: 75,
    origen: 'Introducida / exótica',
    co2_almacenado_kg: 50,
  }),
  arbolDePrueba('S03-D015', {
    demo: true,
    nombre_cientifico: 'Schinus',
    dap_cm: 422,
    altura_total_m: 9,
    origen: 'Nativa',
    co2_almacenado_kg: 1000,
    co2_captura_anual_kg: 40,
    co2_simulado: true,
  }),
  arbolDePrueba('S03-D016', { demo: true, nombre_cientifico: 'Ficus', origen: null }),
  arbolDePrueba('S03-D017', { demo: true }),
]

describe('calcularKpis', () => {
  const kpis = calcularKpis(ARBOLES)

  it('cuenta los árboles de campo y los de ejemplo por separado', () => {
    expect(kpis.arboles).toEqual({ campo: 2, ejemplo: 3 })
  })

  it('las especies distintas no se suman entre campo y ejemplo', () => {
    expect(kpis.especies).toEqual({ total: 3, campo: 2, ejemplo: 2 })
  })

  it('el CO₂ y la captura se suman por separado y un null no suma', () => {
    expect(kpis.co2).toEqual({ campo: 150, ejemplo: 1000 })
    expect(kpis.captura).toEqual({ campo: 10, ejemplo: 40 })
    expect(kpis.haySimulado).toBe(true)
  })

  it('el mayor DAP se saca por separado: el de campo no lo tapa el de ejemplo', () => {
    expect(kpis.mayorDap.campo).toMatchObject({ codigo: 'S01-A001', dapCm: 392 })
    expect(kpis.mayorDap.ejemplo).toMatchObject({ codigo: 'S03-D015', dapCm: 422 })
    expect(kpis.mayorDap.campo?.enlace).toBe('/mapa?sector=1&arbol=S01-A001')
  })

  it('las nativas se cuentan por separado, con lo que no tiene origen aparte', () => {
    expect(kpis.nativas.campo).toEqual({ nativas: 1, exoticas: 1, sinDato: 0, total: 2 })
    expect(kpis.nativas.ejemplo).toEqual({ nativas: 1, exoticas: 0, sinDato: 2, total: 3 })
  })

  it('sin árboles de un origen, no hay mayor DAP ni nativas de ese origen', () => {
    const soloCampo = calcularKpis([ARBOLES[0]])
    expect(soloCampo.mayorDap.ejemplo).toBeNull()
    expect(soloCampo.nativas.ejemplo).toBeNull()
    expect(calcularKpis([])).toMatchObject({
      arboles: { campo: 0, ejemplo: 0 },
      haySimulado: false,
    })
  })

  it('el mayor DAP empatado se resuelve por código', () => {
    const kpisEmpate = calcularKpis([
      arbolDePrueba('S01-A009', { dap_cm: 50 }),
      arbolDePrueba('S01-A003', { dap_cm: 50 }),
    ])
    expect(kpisEmpate.mayorDap.campo?.codigo).toBe('S01-A003')
  })

  it('sin CO₂ con valor no hay simulado que decir', () => {
    expect(calcularKpis([arbolDePrueba('S01-A001', { co2_simulado: true })]).haySimulado).toBe(
      false,
    )
  })
})

describe('especies', () => {
  it('ordena por cantidad y luego por nombre', () => {
    expect(especiesPorCantidad(ARBOLES).map((f) => [f.etiqueta, f.cantidad])).toEqual([
      ['Schinus', 2],
      ['Ficus', 1],
      ['Roystonea regia', 1],
    ])
    expect(especiesPorCantidad(ARBOLES)[0]).toMatchObject({ campo: 1, ejemplo: 1, comun: 'Molle' })
  })

  it('la dona junta el resto en «Otras» y deja aparte los árboles sin especie', () => {
    const filas = agruparEspecies(ARBOLES, 1)
    expect(filas.map((f) => [f.etiqueta, f.cantidad, f.clave])).toEqual([
      ['Schinus', 2, 'Schinus'],
      ['Otras', 2, null],
      ['Sin especie identificada', 1, null],
    ])
    expect(filas[1]).toMatchObject({ campo: 1, ejemplo: 1 })
  })

  it('el color de cada especie se conserva al filtrar si se pasa el orden de todos', () => {
    const orden = especiesPorCantidad(ARBOLES)
    const soloEjemplo = ARBOLES.filter((a) => a.properties.demo)
    const filas = agruparEspecies(soloEjemplo, 3, orden)
    const ficus = filas.find((f) => f.clave === 'Ficus')
    expect(ficus?.serie).toBe(orden.findIndex((f) => f.etiqueta === 'Ficus'))
  })
})

describe('calcularMapaCalor', () => {
  const sectores = [sectorDePrueba(3), sectorDePrueba(1), sectorDePrueba(2)]

  it('da un valor por sector, en orden, con campo y ejemplo aparte', () => {
    const mapa = calcularMapaCalor(ARBOLES, sectores, 'arboles')
    expect(mapa.map((s) => [s.id, s.valor, s.arbolesCampo, s.arbolesEjemplo])).toEqual([
      [1, 2, 2, 0],
      [2, 0, 0, 0],
      [3, 3, 0, 3],
    ])
  })

  it('mide el CO₂ sumado y el DAP medio, y un sector sin dato queda en null', () => {
    const co2 = calcularMapaCalor(ARBOLES, sectores, 'co2')
    expect(co2.map((s) => s.valor)).toEqual([150, null, 1000])
    const dap = calcularMapaCalor(ARBOLES, sectores, 'dap')
    expect(dap[0].valor).toBe((392 + 75) / 2)
    expect(dap[1].valor).toBeNull()
    expect(dap[2].valor).toBe(422)
  })
})
