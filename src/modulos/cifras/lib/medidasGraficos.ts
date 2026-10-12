// Medidas de los gráficos del tablero, en unidades de su viewBox (un píxel a tamaño natural).
// Los ejes y las etiquetas se miden con el ancho real de la tarjeta, así el texto no se encoge.

export const MARGEN_EJES = { izquierda: 44, derecha: 12, arriba: 12, abajo: 40 } as const

// Ancho con el que se dibuja un gráfico antes de medir su tarjeta (y en los tests, sin medición)
export const ANCHO_POR_DEFECTO_PX = 560

export const ALTO_DISPERSION_PX = 320
export const ALTO_DISPERSION_ANGOSTO_PX = 260
export const ALTO_HISTOGRAMA_PX = 220

// Por debajo de este ancho de tarjeta los gráficos usan su alto angosto
export const ANCHO_ANGOSTO_PX = 420

// Radio de los puntos de la dispersión: su ÁREA va con el CO₂
export const RADIO_PUNTO = { minimo: 3.5, maximo: 14 } as const

// Cuántas marcas, más o menos, lleva cada eje
export const MARCAS_EJE_X = 5
export const MARCAS_EJE_Y = 5

// Dona de especies y media dona de nativas, en un viewBox cuadrado de 120
export const LADO_DONA = 120
export const RADIO_DONA = { exterior: 54, interior: 34 } as const
export const SEPARACION_TROZOS_RAD = 0.012

// Media dona: viewBox de 160 x 96, trazo grueso
export const MEDIA_DONA = { ancho: 160, alto: 96, radio: 64, grosor: 20 } as const

// Mini gráficos de los KPIs: viewBox de 112 x 34
export const MINI = { ancho: 112, alto: 34, base: 32, columna: 16, paso: 22, margen: 4 } as const

// Mapa de calor: tamaño de la etiqueta del sector, en píxeles de pantalla
export const TEXTO_MAPA_CALOR_PX = 12

// Desde esta intensidad (0 a 1) el relleno es tan oscuro que la etiqueta va en blanco
export const INTENSIDAD_ETIQUETA_CLARA = 0.55
// Intensidad mínima de un sector con dato: así se distingue de uno sin dato
export const INTENSIDAD_MINIMA_MAPA = 0.14

// Rótulos de los ejes (distancias en píxeles): hasta dónde baja el número de cada marca del eje X
// y dónde queda el título de cada eje
export const BAJADA_NUMEROS_EJE_X_DISPERSION_PX = 18
export const BAJADA_NUMEROS_EJE_X_HISTOGRAMA_PX = 16
export const MARGEN_TITULO_EJE_Y_PX = 12
export const MARGEN_TITULO_EJE_X_DISPERSION_PX = 6
export const MARGEN_TITULO_EJE_X_HISTOGRAMA_PX = 4

// Etiquetas del mapa de calor: cuánto sube el nombre y cuánto baja el valor, en alturas de texto
export const SUBIDA_NOMBRE_MAPA_ALTURAS = 0.25
export const BAJADA_VALOR_MAPA_ALTURAS = 1.1
