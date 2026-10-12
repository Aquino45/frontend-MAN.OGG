// El candado pixel del desbloqueo, en dos piezas para que el arco pueda subir y quedar abierto.
// Una letra por celda ('.' es vacío): `W` es el blanco de la marca, `C` el carmín y `O` el magenta oscuro.
export const ARCO_CANDADO: readonly string[] = ['.WWWWW.', '.W...W.', '.W...W.']

export const CUERPO_CANDADO: readonly string[] = [
  'CCCCCCC',
  'CCCCCCC',
  'CCCOCCC',
  'CCCOCCC',
  'CCCCCCC',
]

export const ANCHO_CANDADO_EN_CELDAS = ARCO_CANDADO[0].length
// El arco cerrado apoya en el cuerpo; abierto, sube y deja un hueco
export const ALTO_CANDADO_EN_CELDAS = ARCO_CANDADO.length + CUERPO_CANDADO.length
