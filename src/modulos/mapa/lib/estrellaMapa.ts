// Estrella de los árboles destacados sobre el mapa real: los vértices se calculan aquí (puro) y
// quien dibuja los pone en un lienzo. Igual que la estrella del mapa ilustrado: puntas arriba.

export interface Vertice {
  x: number
  y: number
}

// Vértices de una estrella de `puntas` puntas, de la punta de arriba en el sentido del reloj.
// `radioInterno` es la fracción del radio exterior a la que quedan los valles.
export function verticesDeEstrella(
  centro: Vertice,
  radioExterno: number,
  radioInterno: number,
  puntas: number,
): Vertice[] {
  const vertices: Vertice[] = []
  for (let indice = 0; indice < puntas * 2; indice++) {
    const radio = indice % 2 === 0 ? radioExterno : radioExterno * radioInterno
    const angulo = -Math.PI / 2 + (indice * Math.PI) / puntas
    vertices.push({
      x: centro.x + radio * Math.cos(angulo),
      y: centro.y + radio * Math.sin(angulo),
    })
  }
  return vertices
}
