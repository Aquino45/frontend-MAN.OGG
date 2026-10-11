import { describe, expect, it } from 'vitest'

// La fuente pixel vive solo en el módulo de la entrada: el resto del sitio usa la etiqueta.
const CARPETA_ENTRADA = '/src/modulos/entrada/'
// La pila de fuentes está en el archivo de la escala; tokens.css solo guarda colores
const ARCHIVO_DE_TOKENS = '/src/styles/escala.tokens.css'
const PAQUETE_FUENTE = '@fontsource/silkscreen'

const estilos = import.meta.glob('/src/**/*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const codigo = import.meta.glob(
  ['/src/**/*.{ts,tsx}', '!/src/modulos/armazon/tipografia.test.ts'],
  {
    query: '?raw',
    import: 'default',
    eager: true,
  },
) as Record<string, string>

const fueraDeLaEntrada = (archivos: Record<string, string>) =>
  Object.entries(archivos).filter(([ruta]) => !ruta.startsWith(CARPETA_ENTRADA))

describe('tipografía: la fuente pixel solo en la entrada', () => {
  it('lee los estilos y el código del proyecto', () => {
    expect(fueraDeLaEntrada(estilos).length).toBeGreaterThan(3)
    expect(fueraDeLaEntrada(codigo).length).toBeGreaterThan(10)
  })

  it('ningún CSS fuera de la entrada usa --fuente-pixel', () => {
    const usos = fueraDeLaEntrada(estilos)
      .filter(([, texto]) => /var\(\s*--fuente-pixel/.test(texto))
      .map(([ruta]) => ruta)
    expect(usos).toEqual([])
  })

  it('la escala puede definir --fuente-pixel pero no usarla', () => {
    const tokens = estilos[ARCHIVO_DE_TOKENS]
    expect(tokens).toMatch(/--fuente-pixel\s*:/)
    expect(tokens).not.toMatch(/var\(\s*--fuente-pixel/)
  })

  it('ningún CSS fuera de la entrada importa la fuente pixel', () => {
    const importan = fueraDeLaEntrada(estilos)
      .filter(([, texto]) => texto.includes(PAQUETE_FUENTE))
      .map(([ruta]) => ruta)
    expect(importan).toEqual([])
  })

  it('ningún .ts/.tsx fuera de la entrada importa la fuente pixel', () => {
    const importan = fueraDeLaEntrada(codigo)
      .filter(([, texto]) => texto.includes(PAQUETE_FUENTE))
      .map(([ruta]) => ruta)
    expect(importan).toEqual([])
  })

  it('la fuente pixel la carga solo el módulo de la entrada', () => {
    const importan = Object.entries(codigo)
      .filter(([ruta]) => ruta.startsWith('/src/modulos/entrada/'))
      .filter(([, texto]) => texto.includes(`import '${PAQUETE_FUENTE}/400.css'`))
    expect(importan.length).toBeGreaterThan(0)
  })
})
