import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SPRITE_GENERICO, SPRITES_POR_ESPECIE, TEXTOS_MARCA } from '@/config/constantes'
import escalaTokens from '@/styles/escala.tokens.css?raw'
import marcaCss from './marca.estilos.css?raw'
import { capasDeFilas } from './capasDeFilas'
import { claveSpriteDeEspecie } from './claveSprite'
import { CoMarca } from './CoMarca'
import { SimboloLogo } from './SimboloLogo'
import { SIMBOLO_LOGO, SIMBOLO_MINIMO } from './simbolo.datos'
import { SpriteArbol } from './SpriteArbol'
import { SPRITES, type LadoSprite } from './sprites.datos'

// Las letras que el CSS sabe pintar
const LETRAS_CON_COLOR = [...marcaCss.matchAll(/\.marca-px--(\w)/g)].map(([, letra]) => letra)

function comprobarRejilla(filas: readonly string[], ancho: number, alto: number) {
  expect(filas).toHaveLength(alto)
  for (const fila of filas) {
    expect(fila).toHaveLength(ancho)
    for (const letra of fila) {
      if (letra !== '.') expect(LETRAS_CON_COLOR).toContain(letra)
    }
  }
}

describe('sprites por especie', () => {
  const claves = Object.keys(SPRITES) as (keyof typeof SPRITES)[]

  it('hay uno por especie del mapeo más el genérico', () => {
    expect(new Set(claves)).toEqual(new Set([...Object.keys(SPRITES_POR_ESPECIE), SPRITE_GENERICO]))
  })

  it.each([16, 32] as LadoSprite[])(
    'todos tienen rejilla de %i x %i y solo letras con color',
    (lado) => {
      for (const clave of claves) comprobarRejilla(SPRITES[clave][lado], lado, lado)
    },
  )

  it('cada sprite se distingue de los demás en los dos tamaños', () => {
    for (const lado of [16, 32] as LadoSprite[]) {
      const dibujos = claves.map((clave) => SPRITES[clave][lado].join('|'))
      expect(new Set(dibujos).size).toBe(claves.length)
    }
  })

  it('el genérico lleva la rama que asoma y la nubecita, que el ficus no tiene', () => {
    const generico = SPRITES.generico[16].join('\n')
    const ficus = SPRITES.ficus[16].join('\n')
    expect(generico).not.toEqual(ficus)
    // La nubecita: celdas de copa sueltas en las dos primeras filas
    expect(SPRITES.generico[16].slice(0, 3).join('')).toMatch(/C/)
  })
})

describe('claveSpriteDeEspecie', () => {
  it('elige por el género del nombre científico', () => {
    expect(claveSpriteDeEspecie('Roystonea regia', null)).toBe('palma')
    expect(claveSpriteDeEspecie('Prosopis pallida', 'Huarango')).toBe('huarango')
    expect(claveSpriteDeEspecie('Schinus', null)).toBe('molle')
    expect(claveSpriteDeEspecie('  FICUS benjamina', null)).toBe('ficus')
  })

  it('elige por alias del nombre común, sin tildes ni mayúsculas', () => {
    expect(claveSpriteDeEspecie(null, 'Palma Real')).toBe('palma')
    expect(claveSpriteDeEspecie(null, 'Molle serrano')).toBe('molle')
    expect(claveSpriteDeEspecie(null, 'Algarrobo')).toBe('huarango')
    expect(claveSpriteDeEspecie(undefined, 'Higuera')).toBe('ficus')
  })

  it('el alias cuenta como palabra completa: «ficusal» no es ficus', () => {
    expect(claveSpriteDeEspecie(null, 'Ficusal')).toBe(SPRITE_GENERICO)
  })

  it('sin coincidencia o sin nombres, el genérico', () => {
    expect(claveSpriteDeEspecie('Cedrela odorata', 'Cedro')).toBe(SPRITE_GENERICO)
    expect(claveSpriteDeEspecie(null, null)).toBe(SPRITE_GENERICO)
    expect(claveSpriteDeEspecie('', '')).toBe(SPRITE_GENERICO)
  })

  it('el género manda sobre el alias', () => {
    expect(claveSpriteDeEspecie('Prosopis pallida', 'Palma real')).toBe('huarango')
  })
})

describe('capasDeFilas', () => {
  it('arma un solo trazo por color y no repite el cálculo', () => {
    const filas = ['CC.', '.OC']
    const capas = capasDeFilas(filas)
    expect(capas.map(({ letra }) => letra).sort()).toEqual(['C', 'O'])
    expect(capasDeFilas(filas)).toBe(capas)
    expect(capas.find(({ letra }) => letra === 'C')?.trazo).toBe('M0 0h2v1h-2zM2 1h1v1h-1z')
  })
})

describe('SpriteArbol', () => {
  it('es decorativo, sin texto, y dice qué sprite usa', () => {
    const { container } = render(<SpriteArbol nombreCientifico="Roystonea regia" />)
    const dibujo = container.querySelector('svg')
    expect(dibujo).toHaveAttribute('aria-hidden', 'true')
    expect(dibujo).toHaveAttribute('data-especie', 'palma')
    expect(dibujo?.textContent).toBe('')
  })

  it('se dibuja en la rejilla del tamaño pedido y solo con trazos', () => {
    const { container } = render(<SpriteArbol lado={32} />)
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 32 32')
    expect(container.querySelectorAll('svg rect')).toHaveLength(0)
    expect(container.querySelector('svg')).toHaveAttribute('data-especie', SPRITE_GENERICO)
  })
})

describe('símbolo del logo', () => {
  it('es una rejilla con colores válidos y la insignia lleva su check', () => {
    comprobarRejilla(SIMBOLO_LOGO, SIMBOLO_LOGO[0].length, SIMBOLO_LOGO.length)
    expect(SIMBOLO_LOGO.join('')).toMatch(/W/)
  })

  it('la mínima existe en 16 y en 32', () => {
    comprobarRejilla(SIMBOLO_MINIMO[16], 16, 16)
    comprobarRejilla(SIMBOLO_MINIMO[32], 32, 32)
  })

  it('el SVG es decorativo', () => {
    const { container } = render(<SimboloLogo />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('el viewBox contiene todo el dibujo y no recorta lo que toca el borde', () => {
    const { container } = render(<SimboloLogo />)
    const svg = container.querySelector('svg') as SVGElement
    expect(svg).toHaveAttribute('viewBox', `0 0 ${SIMBOLO_LOGO[0].length} ${SIMBOLO_LOGO.length}`)
    expect(marcaCss).toMatch(/\.simbolo-logo\s*\{[^}]*overflow:\s*visible/)
  })

  it('se dibuja en celdas de px enteros: el alto es filas por la celda de la marca', () => {
    const { container } = render(<SimboloLogo />)
    const svg = container.querySelector('svg') as SVGElement
    expect(svg.style.getPropertyValue('--simbolo-filas')).toBe(String(SIMBOLO_LOGO.length))
    expect(marcaCss).toMatch(
      /\.simbolo-logo\s*\{[^}]*block-size:\s*calc\(var\(--simbolo-filas\)\s*\*\s*var\(--marca-celda\)\)/,
    )
    expect(escalaTokens).toMatch(/--marca-celda:\s*1px/)
    expect(escalaTokens).toMatch(
      /@media \(min-width: 48rem\)\s*\{\s*:root\s*\{[^}]*--marca-celda:\s*2px/,
    )
    expect(marcaCss).toMatch(/\.co-marca\s*\{[^}]*--marca-celda:\s*2px/)
  })
})

describe('co-marca', () => {
  it('lleva el wordmark y el logo oficial de la UPeU en sus dos versiones, tal cual', () => {
    const { container } = render(<CoMarca />)
    expect(container).toHaveTextContent(TEXTOS_MARCA.censo)
    expect(container).toHaveTextContent(TEXTOS_MARCA.arboreo)
    const logos = screen.getAllByAltText(TEXTOS_MARCA.upeu)
    expect(logos).toHaveLength(2)
    // Solo se muestra uno por tema: el CSS esconde el otro
    expect(marcaCss).toMatch(
      /:root\[data-tema='claro'\] \.logo-upeu__imagen--oscuro\s*\{\s*display:\s*none/,
    )
  })

  it('el logo de la UPeU no se deforma ni se recolorea', () => {
    const bloque = marcaCss.slice(marcaCss.indexOf('.logo-upeu__imagen {'))
    const regla = bloque.slice(0, bloque.indexOf('}'))
    expect(regla).toMatch(/inline-size:\s*auto/)
    expect(regla).not.toMatch(/filter|object-fit|transform|opacity/)
  })
})

describe('wordmark', () => {
  it('«CENSO» va en Bricolage 700 con mayúsculas espaciadas y «Arbóreo» en Bricolage 800', () => {
    expect(marcaCss).toMatch(/\.wordmark__censo\s*\{[^}]*font-weight:\s*700/)
    expect(marcaCss).toMatch(/\.wordmark__censo\s*\{[^}]*text-transform:\s*uppercase/)
    expect(marcaCss).toMatch(/\.wordmark__censo\s*\{[^}]*letter-spacing:/)
    expect(marcaCss).toMatch(/\.wordmark__arboreo\s*\{[^}]*font-weight:\s*800/)
    // Sin la fuente pixel
    expect(marcaCss).not.toMatch(/silkscreen/i)
  })
})
