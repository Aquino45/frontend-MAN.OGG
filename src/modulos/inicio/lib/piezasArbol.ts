// Arma, a partir del dibujo, las piezas que se pintan: cada pieza es un grupo de capas y cada capa
// es un solo trazo de un solo color (sin rectángulos sueltos). Las piezas del crecimiento traen
// además su versión «chica», el primer cuadro con el que brotan. Es dato del dibujo.
import {
  CUADROS_REPOSO,
  DIBUJO_ARBOL as dibujo,
  type Corrimiento,
  type CuadroReposo,
} from './dibujoArbol'
import {
  bordeExterior,
  celdasDeLobulo,
  celdasDeTramos,
  celdasVecinasDe,
  sombraBajoLobulo,
  trazoDeCeldas,
  unirCeldas,
  versionChica,
  type Celda,
  type Lobulo,
} from './rasterizarArbol'

export type ClavePieza = 'raices' | 'tronco' | 'ramas' | 'atras' | 'frente' | 'brillos' | 'nube'
// Cada clase pinta con un color de la paleta (ver arbol.estilos.css)
export type ClaseCapa = 'carmin' | 'oscuro' | 'magenta' | 'tronco' | 'borde'

export interface CapaArbol {
  clase: ClaseCapa
  entera: string
  // Trazo de la pieza un paso más chica; vacío en los cuadros del reposo
  chica: string
  // Se corre hacia el cursor junto con los demás lóbulos de arriba
  arriba: boolean
}

export interface PiezaArbol {
  clave: ClavePieza
  capas: readonly CapaArbol[]
}

// Orden en que brotan las piezas
export const ORDEN_CRECIMIENTO: readonly ClavePieza[] = [
  'raices',
  'tronco',
  'ramas',
  'atras',
  'frente',
  'brillos',
  'nube',
]

const SIN_CORRIMIENTO: Corrimiento = [0, 0]

function capa(
  clase: ClaseCapa,
  celdas: readonly Celda[],
  conChica: boolean,
  arriba = false,
): CapaArbol[] {
  if (celdas.length === 0) return []
  return [
    {
      clase,
      entera: trazoDeCeldas(celdas),
      chica: conChica ? trazoDeCeldas(versionChica(celdas)) : '',
      arriba,
    },
  ]
}

function movido([x, y, ancho, alto, esquina]: Lobulo, [dx, dy]: Corrimiento): Lobulo {
  return [x + dx, y + dy, ancho, alto, esquina]
}

const en = <T>(lista: readonly T[] | undefined, indice: number, respaldo: T): T =>
  lista?.[indice] ?? respaldo

// Las piezas de la copa, con los corrimientos de un cuadro (sin ellos, el cuadro base)
export function construirCopa(cuadro?: CuadroReposo, conChica = false): PiezaArbol[] {
  const lobulosAtras = dibujo.atras.map((lobulo, i) =>
    movido(lobulo, en(cuadro?.atras, i, SIN_CORRIMIENTO)),
  )
  const lobulosFrente = dibujo.frente.map((lobulo, i) =>
    movido(lobulo, en(cuadro?.frente, i, SIN_CORRIMIENTO)),
  )
  const lobulosSalientes = dibujo.salientes.map((lobulo, i) =>
    movido(lobulo, en(cuadro?.salientes, i, SIN_CORRIMIENTO)),
  )
  const celdasDe = (lobulos: readonly Lobulo[]) =>
    unirCeldas(...lobulos.map((l) => celdasDeLobulo(l)))
  const copa = unirCeldas(
    celdasDe(lobulosAtras),
    celdasDe(lobulosFrente),
    celdasDe(lobulosSalientes),
  )

  const esArriba = (indice: number) => dibujo.frenteArriba.includes(indice)
  const delFrente = (arriba: boolean) => lobulosFrente.filter((_, i) => esArriba(i) === arriba)
  const sombras = (arriba: boolean) =>
    unirCeldas(
      ...dibujo.sombrasBajo
        .filter((i) => esArriba(i) === arriba)
        .map((i) => sombraBajoLobulo(lobulosFrente[i], copa)),
    )

  const brillos = (arriba: boolean) =>
    unirCeldas(
      ...dibujo.brillos.map((tramos, i) =>
        arriba === dibujo.brillosArriba.includes(i)
          ? celdasDeTramos(tramos, ...en(cuadro?.brillos, i, SIN_CORRIMIENTO))
          : [],
      ),
    )

  return [
    { clave: 'atras', capas: capa('oscuro', celdasDe(lobulosAtras), conChica) },
    {
      clave: 'frente',
      capas: [
        ...capa(
          'carmin',
          unirCeldas(celdasDe(delFrente(false)), celdasDe(lobulosSalientes)),
          conChica,
        ),
        ...capa('carmin', celdasDe(delFrente(true)), conChica, true),
        ...capa('oscuro', sombras(false), conChica),
        ...capa('oscuro', sombras(true), conChica, true),
      ],
    },
    {
      clave: 'brillos',
      capas: [
        ...capa('magenta', brillos(false), conChica),
        ...capa('magenta', brillos(true), conChica, true),
      ],
    },
    {
      clave: 'nube',
      capas: capa(
        'carmin',
        celdasDeTramos(dibujo.nube, ...(cuadro?.nube ?? SIN_CORRIMIENTO)),
        conChica,
        true,
      ),
    },
  ]
}

// Raíces, tronco y ramas, cada uno con el borde de 1 celda que le toca (el borde es de todo el
// cuerpo; a cada pieza le toca el que la rodea)
function construirCuerpo(): PiezaArbol[] {
  const partes = {
    raices: celdasDeTramos(dibujo.raices),
    tronco: celdasDeTramos(dibujo.tronco),
    ramas: celdasDeTramos(dibujo.ramas),
  }
  const borde = bordeExterior(unirCeldas(partes.raices, partes.tronco, partes.ramas))
  return (['raices', 'tronco', 'ramas'] as const).map((clave) => ({
    clave,
    capas: [
      ...capa('borde', celdasVecinasDe(borde, partes[clave]), true),
      ...capa('tronco', partes[clave], true),
    ],
  }))
}

export const PIEZAS_CUERPO = construirCuerpo()
// El cuadro base lleva la versión chica: es el que crece al principio
export const COPA_BASE = construirCopa(undefined, true)
export const COPAS_REPOSO = CUADROS_REPOSO.map((cuadro) => construirCopa(cuadro))

export interface OrigenHoja {
  x: number
  y: number
  clase: 'carmin' | 'oscuro'
}

// Celdas del borde de abajo de la copa de donde se sueltan las hojas, con el color de su lóbulo
function origenesDeHojas(): OrigenHoja[] {
  const celdasDe = (lobulos: readonly Lobulo[]) =>
    unirCeldas(...lobulos.map((l) => celdasDeLobulo(l)))
  const delFrente = unirCeldas(celdasDe(dibujo.frente), celdasDe(dibujo.salientes))
  const copa = unirCeldas(celdasDe(dibujo.atras), delFrente)
  const enCopa = new Set(copa.map(([x, y]) => `${x},${y}`))
  const enFrente = new Set(delFrente.map(([x, y]) => `${x},${y}`))
  return copa
    .filter(([x, y]) => !enCopa.has(`${x},${y + 1}`) && x % 3 === 0)
    .map(([x, y]) => ({ x, y, clase: enFrente.has(`${x},${y}`) ? 'carmin' : 'oscuro' }))
}

export const ORIGENES_HOJA = origenesDeHojas()
