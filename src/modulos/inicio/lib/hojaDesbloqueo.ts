// La hoja pixel de la cortina de desbloqueo: 5 x 5 celdas, un rombo con su nervio y su pecíolo, en
// una letra por celda ('.' es vacío). `C` es el cuerpo y `M` el nervio; cada variante cambia los
// tonos de la paleta (ver compartido/marca/marca.estilos.css).
const HOJA_BASE: readonly string[] = ['..CCC', '.CCMC', 'CCMCC', 'CMCC.', 'MC...']

// Qué color de la paleta lleva el cuerpo y cuál el nervio en cada variante
const TONOS_POR_VARIANTE: readonly { cuerpo: string; nervio: string }[] = [
  { cuerpo: 'C', nervio: 'M' },
  { cuerpo: 'O', nervio: 'M' },
  { cuerpo: 'M', nervio: 'C' },
]

export const LADO_HOJA_EN_CELDAS = HOJA_BASE.length

export const HOJAS_DE_DESBLOQUEO: readonly (readonly string[])[] = TONOS_POR_VARIANTE.map(
  ({ cuerpo, nervio }) =>
    HOJA_BASE.map((fila) =>
      [...fila].map((letra) => (letra === 'C' ? cuerpo : letra === 'M' ? nervio : letra)).join(''),
    ),
)
