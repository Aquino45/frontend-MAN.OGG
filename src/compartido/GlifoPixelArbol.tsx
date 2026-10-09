// Árbol pixelado de la paleta del producto: marca el lugar de una foto o de una miniatura.
// Es adorno: no representa ningún árbol del censo.
const LADO_REJILLA = 12

// Franjas de la copa y el tronco sobre una rejilla de 12 x 12: [x, y, ancho, alto, parte]
const FRANJAS = [
  [3, 0, 6, 1, 'copa-alta'],
  [1, 1, 10, 2, 'copa-alta'],
  [0, 3, 12, 2, 'copa-media'],
  [1, 5, 10, 2, 'copa-baja'],
  [3, 7, 6, 1, 'copa-baja'],
  [5, 8, 2, 4, 'tronco'],
] as const

export function GlifoPixelArbol() {
  return (
    <svg
      className="glifo-pixel"
      viewBox={`0 0 ${LADO_REJILLA} ${LADO_REJILLA}`}
      aria-hidden="true"
      focusable="false"
    >
      {FRANJAS.map(([x, y, ancho, alto, parte]) => (
        <rect
          key={`${x}-${y}`}
          className={`glifo-pixel__${parte}`}
          x={x}
          y={y}
          width={ancho}
          height={alto}
        />
      ))}
    </svg>
  )
}
