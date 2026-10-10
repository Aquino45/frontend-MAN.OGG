// Proyección de los polígonos lon/lat del contrato a coordenadas de un viewBox SVG.
// Equirectangular con corrección por la latitud media: a la escala del campus, conserva
// la proporción real entre ancho y alto. Nada se dibuja a mano: el mapa sale de los datos.
import {
  MAPA_ANCHO_VIEWBOX,
  MAPA_DECIMALES_SVG,
  MAPA_GLIFOS_POR_SECTOR,
  MAPA_MARGEN_ENTRADA,
  MAPA_MARGEN_VIEWBOX,
  MAPA_TAMANO_GLIFO,
} from '@/config/constantes'

export interface Punto2D {
  x: number
  y: number
}

// [longitud, latitud] en grados WGS84, como en GeoJSON
type Posicion = readonly [number, number]

export interface SectorGeografico {
  id: number
  geometry: { coordinates: readonly (readonly Posicion[])[] }
}

// Recuadro de un viewBox SVG
export interface Recuadro {
  x: number
  y: number
  ancho: number
  alto: number
}

export interface SectorProyectado {
  id: number
  trazado: string
  etiqueta: Punto2D
  glifos: Punto2D[]
  // Recuadro al que se acerca el mapa al entrar al sector, con la proporción del mapa completo
  recuadro: Recuadro
}

export interface Proyeccion {
  ancho: number
  alto: number
  sectores: SectorProyectado[]
  // Lleva una posición [lon, lat] a coordenadas del viewBox, igual que los polígonos
  proyectarPosicion: (posicion: Posicion) => Punto2D
}

export interface OpcionesProyeccion {
  ancho: number
  margen: number
  decimales: number
  tamanoGlifo: number
  glifosPorSector: number
}

const OPCIONES_POR_DEFECTO: OpcionesProyeccion = {
  ancho: MAPA_ANCHO_VIEWBOX,
  margen: MAPA_MARGEN_VIEWBOX,
  decimales: MAPA_DECIMALES_SVG,
  tamanoGlifo: MAPA_TAMANO_GLIFO,
  glifosPorSector: MAPA_GLIFOS_POR_SECTOR,
}

// Posición horizontal de cada glifo dentro de su franja (fracción del ancho interior)
const FRACCIONES_HORIZONTALES_GLIFO = [0.25, 0.75, 0.5]

const GRADOS_A_RADIANES = Math.PI / 180

export function puntoEnPoligono(punto: Punto2D, anillo: readonly Punto2D[]): boolean {
  let dentro = false
  for (let actual = 0, previo = anillo.length - 1; actual < anillo.length; previo = actual++) {
    const a = anillo[actual]
    const b = anillo[previo]
    const cruza =
      a.y > punto.y !== b.y > punto.y &&
      punto.x < ((b.x - a.x) * (punto.y - a.y)) / (b.y - a.y) + a.x
    if (cruza) dentro = !dentro
  }
  return dentro
}

function centroide(anillo: readonly Punto2D[]): Punto2D {
  let area = 0
  let sumaX = 0
  let sumaY = 0
  for (let actual = 0, previo = anillo.length - 1; actual < anillo.length; previo = actual++) {
    const a = anillo[previo]
    const b = anillo[actual]
    const cruz = a.x * b.y - b.x * a.y
    area += cruz
    sumaX += (a.x + b.x) * cruz
    sumaY += (a.y + b.y) * cruz
  }
  if (area === 0) return anillo[0]
  return { x: sumaX / (3 * area), y: sumaY / (3 * area) }
}

// Tramos [desde, hasta] del interior del polígono sobre la recta horizontal y.
function tramosInteriores(anillo: readonly Punto2D[], y: number): [number, number][] {
  const cortes: number[] = []
  for (let actual = 0, previo = anillo.length - 1; actual < anillo.length; previo = actual++) {
    const a = anillo[actual]
    const b = anillo[previo]
    if (a.y > y !== b.y > y) cortes.push(a.x + ((y - a.y) * (b.x - a.x)) / (b.y - a.y))
  }
  cortes.sort((izquierda, derecha) => izquierda - derecha)
  const tramos: [number, number][] = []
  for (let indice = 0; indice + 1 < cortes.length; indice += 2) {
    tramos.push([cortes[indice], cortes[indice + 1]])
  }
  return tramos
}

function tramoMasAncho(anillo: readonly Punto2D[], y: number): [number, number] | null {
  let mejor: [number, number] | null = null
  for (const tramo of tramosInteriores(anillo, y)) {
    if (!mejor || tramo[1] - tramo[0] > mejor[1] - mejor[0]) mejor = tramo
  }
  return mejor
}

function limitesDe(puntos: readonly Punto2D[]) {
  const xs = puntos.map((punto) => punto.x)
  const ys = puntos.map((punto) => punto.y)
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  }
}

// Punto para el nombre del sector: el centroide, o si cae fuera (polígono cóncavo), el centro
// del tramo interior más ancho a esa altura.
export function puntoEtiqueta(anillo: readonly Punto2D[]): Punto2D {
  const centro = centroide(anillo)
  if (puntoEnPoligono(centro, anillo)) return centro
  const tramo = tramoMasAncho(anillo, centro.y)
  if (tramo) return { x: (tramo[0] + tramo[1]) / 2, y: centro.y }
  const limites = limitesDe(anillo)
  return { x: (limites.minX + limites.maxX) / 2, y: (limites.minY + limites.maxY) / 2 }
}

// Puntos donde cabe un glifo decorativo entero sin pisar la etiqueta.
export function puntosGlifos(
  anillo: readonly Punto2D[],
  etiqueta: Punto2D,
  cantidad: number,
  tamano: number,
): Punto2D[] {
  const { minY, maxY } = limitesDe(anillo)
  const puntos: Punto2D[] = []
  for (let indice = 0; indice < cantidad; indice++) {
    const y = minY + ((indice + 1) / (cantidad + 1)) * (maxY - minY)
    const tramo = tramoMasAncho(anillo, y)
    if (!tramo) continue
    const fraccion = FRACCIONES_HORIZONTALES_GLIFO[indice % FRACCIONES_HORIZONTALES_GLIFO.length]
    const desde = tramo[0] + tamano
    const hasta = tramo[1] - tamano
    if (hasta <= desde) continue
    const candidato = { x: desde + fraccion * (hasta - desde), y }
    const cabeEntero = [-1, 1].every((signo) =>
      puntoEnPoligono({ x: candidato.x, y: candidato.y + (signo * tamano) / 2 }, anillo),
    )
    const lejosDeEtiqueta =
      Math.hypot(candidato.x - etiqueta.x, candidato.y - etiqueta.y) >= 2 * tamano
    if (cabeEntero && lejosDeEtiqueta) puntos.push(candidato)
  }
  return puntos
}

// Recuadro que contiene los puntos con un margen, ampliado hasta tener la proporción dada.
export function recuadroDe(
  puntos: readonly Punto2D[],
  margen: number,
  proporcion: number,
): Recuadro {
  const { minX, maxX, minY, maxY } = limitesDe(puntos)
  let ancho = maxX - minX + 2 * margen
  let alto = maxY - minY + 2 * margen
  if (ancho / alto < proporcion) ancho = alto * proporcion
  else alto = ancho / proporcion
  return { x: (minX + maxX - ancho) / 2, y: (minY + maxY - alto) / 2, ancho, alto }
}

function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales
  return Math.round(valor * factor) / factor
}

function trazadoDe(anillos: readonly (readonly Punto2D[])[], decimales: number): string {
  return anillos
    .map((anillo) => {
      const vertices = anillo.map(
        (punto) => `${redondear(punto.x, decimales)},${redondear(punto.y, decimales)}`,
      )
      return `M${vertices.join('L')}Z`
    })
    .join('')
}

export function proyectarSectores(
  sectores: readonly SectorGeografico[],
  opciones: Partial<OpcionesProyeccion> = {},
): Proyeccion {
  const { ancho, margen, decimales, tamanoGlifo, glifosPorSector } = {
    ...OPCIONES_POR_DEFECTO,
    ...opciones,
  }
  const posiciones = sectores.flatMap((sector) => sector.geometry.coordinates.flat())
  if (posiciones.length === 0) {
    return { ancho, alto: 2 * margen, sectores: [], proyectarPosicion: () => ({ x: 0, y: 0 }) }
  }

  const latitudes = posiciones.map(([, latitud]) => latitud)
  const latitudMedia = (Math.min(...latitudes) + Math.max(...latitudes)) / 2
  const correccion = Math.cos(latitudMedia * GRADOS_A_RADIANES)
  // y crece hacia abajo en SVG, así que el norte (latitud mayor) queda arriba
  const plano = (posicion: Posicion): Punto2D => ({ x: posicion[0] * correccion, y: -posicion[1] })

  const limites = limitesDe(posiciones.map(plano))
  const anchoPlano = limites.maxX - limites.minX
  const altoPlano = limites.maxY - limites.minY
  const extensionReferencia = anchoPlano > 0 ? anchoPlano : altoPlano
  const escala = extensionReferencia > 0 ? (ancho - 2 * margen) / extensionReferencia : 1
  const alto = altoPlano * escala + 2 * margen
  const aViewBox = (posicion: Posicion): Punto2D => {
    const punto = plano(posicion)
    return {
      x: margen + (punto.x - limites.minX) * escala,
      y: margen + (punto.y - limites.minY) * escala,
    }
  }

  const altoRedondeado = redondear(alto, decimales)
  return {
    ancho,
    alto: altoRedondeado,
    proyectarPosicion: aViewBox,
    sectores: sectores.map((sector) => {
      const anillos = sector.geometry.coordinates.map((anillo) => anillo.map(aViewBox))
      const exterior = anillos[0]
      const etiqueta = puntoEtiqueta(exterior)
      return {
        id: sector.id,
        trazado: trazadoDe(anillos, decimales),
        etiqueta,
        glifos: puntosGlifos(exterior, etiqueta, glifosPorSector, tamanoGlifo),
        recuadro: recuadroDe(exterior, MAPA_MARGEN_ENTRADA, ancho / altoRedondeado),
      }
    }),
  }
}
