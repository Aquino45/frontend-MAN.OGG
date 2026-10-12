// Colores de las capas del mapa satelital. MapLibre no entiende `var(--token)`, así que se leen
// los valores ya resueltos de los tokens en el momento de dibujar (y al cambiar el tema).

export interface ColoresSatelite {
  borde: string
  relleno: string
  puntoRelleno: string
  puntoBorde: string
  puntoDestacado: string
}

const TOKENS_POR_COLOR: Record<keyof ColoresSatelite, string> = {
  borde: '--mapa-borde',
  relleno: '--mapa-relleno-resaltado',
  puntoRelleno: '--punto-relleno',
  puntoBorde: '--punto-borde',
  puntoDestacado: '--punto-destacado',
}

type LectorDeToken = (nombre: string) => string

export function leerColoresSatelite(leer: LectorDeToken): ColoresSatelite {
  const colores = {} as ColoresSatelite
  for (const [clave, token] of Object.entries(TOKENS_POR_COLOR)) {
    colores[clave as keyof ColoresSatelite] = leer(token).trim()
  }
  return colores
}

export function lectorDeTokensDelDocumento(raiz: HTMLElement): LectorDeToken {
  const estilo = getComputedStyle(raiz)
  return (nombre) => estilo.getPropertyValue(nombre)
}
