import { describe, expect, it } from 'vitest'

// Las estrellas del sitio son SVG: un carácter Unicode de estrella depende de la fuente del
// sistema y en algunos aparece como un cuadrito vacío.
const ESTRELLAS = [0x2605, 0x2606, 0x2b50, 0x2729, 0x272a].map((codigo) =>
  String.fromCodePoint(codigo),
)

const fuentes = import.meta.glob<string>('/src/**/*.{ts,tsx,css}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

describe('estrellas', () => {
  it('ningún archivo de src usa un carácter Unicode de estrella', () => {
    const culpables = Object.entries(fuentes)
      .filter(([ruta]) => !ruta.endsWith('sinEstrellaUnicode.test.ts'))
      .filter(([, contenido]) => ESTRELLAS.some((estrella) => contenido.includes(estrella)))
      .map(([ruta]) => ruta)
    expect(culpables).toEqual([])
  })
})
