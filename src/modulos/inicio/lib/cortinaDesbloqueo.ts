// Cómo se reparten las hojas de la cortina de desbloqueo sobre la pantalla: cuántas, de qué tamaño,
// dónde y con qué retraso. Todo es cuenta (sin azar), así que el mismo tamaño de pantalla da siempre
// la misma cortina. Función pura.
import { DESBLOQUEO_ANIMACION } from '@/config/constantes'

export interface HojaDeCortina {
  // Esquina de arriba a la izquierda de la hoja, en píxeles de pantalla
  x: number
  y: number
  // Cuál de las variantes de tono lleva (0 a variantes - 1)
  variante: number
  // Cuándo empieza a caer, en ms
  retrasoMs: number
}

export interface DisenoDeCortina {
  // Lado de una celda de la hoja, en píxeles enteros
  celdaPx: number
  // Lado de la hoja entera
  ladoPx: number
  // De abajo hacia arriba: las filas de arriba quedan encima de las de abajo
  hojas: HojaDeCortina[]
}

type Configuracion = typeof DESBLOQUEO_ANIMACION

const VARIANTES_POR_DEFECTO = 3
// Las variaciones fijas que salen de las posiciones: la cuenta reparte, no sortea
const PRIMO_COLUMNA = 31
const PRIMO_FILA = 17
const PASOS_DE_VARIACION = 7

function cuantas(ancho: number, alto: number, lado: number, paso: number) {
  const columnas = Math.max(1, Math.ceil((ancho - lado) / paso) + 1)
  const filas = Math.max(1, Math.ceil((alto - lado) / paso) + 1)
  return { columnas, filas }
}

export function disenarCortina(
  ancho: number,
  alto: number,
  configuracion: Configuracion = DESBLOQUEO_ANIMACION,
  variantes = VARIANTES_POR_DEFECTO,
): DisenoDeCortina {
  const { hojasMax, celdasPorHoja, celdaMinimaPx, solape } = configuracion
  const { retrasoColumnaMs, retrasoFilaMs, variacionHojaMs, retrasoMaximoHojaMs } = configuracion
  // La celda más chica (en píxeles enteros) con la que la cobertura cabe en el tope de hojas
  let celdaPx = celdaMinimaPx
  let ladoPx = celdaPx * celdasPorHoja
  let paso = Math.max(1, Math.round(ladoPx * (1 - solape)))
  let { columnas, filas } = cuantas(ancho, alto, ladoPx, paso)
  while (columnas * filas > hojasMax) {
    celdaPx += 1
    ladoPx = celdaPx * celdasPorHoja
    paso = Math.max(1, Math.round(ladoPx * (1 - solape)))
    ;({ columnas, filas } = cuantas(ancho, alto, ladoPx, paso))
  }
  const hojas: HojaDeCortina[] = []
  for (let fila = filas - 1; fila >= 0; fila--) {
    for (let columna = 0; columna < columnas; columna++) {
      // Un corrimiento de una celda hacia un lado, hacia el otro o ninguno
      const corrimiento = (((columna * PRIMO_COLUMNA + fila * PRIMO_FILA) % 3) - 1) * celdaPx
      // La primera y la última columna quedan a ras de los bordes: así no hay huecos sin cubrir
      const x =
        columna === 0
          ? 0
          : columna === columnas - 1
            ? Math.max(0, ancho - ladoPx)
            : Math.min(Math.max(columna * paso + corrimiento, 0), Math.max(0, ancho - ladoPx))
      const y = Math.min(fila * paso, Math.max(0, alto - ladoPx))
      const variacion =
        (((columna * PRIMO_COLUMNA + fila * PRIMO_FILA) % PASOS_DE_VARIACION) /
          (PASOS_DE_VARIACION - 1)) *
        variacionHojaMs
      const retrasoMs = Math.min(
        columna * retrasoColumnaMs + fila * retrasoFilaMs + variacion,
        retrasoMaximoHojaMs,
      )
      hojas.push({ x, y, variante: (columna + fila * 2) % variantes, retrasoMs })
    }
  }
  return { celdaPx, ladoPx, hojas }
}
