// Elige el sprite de una especie por el género de su nombre científico o por un alias de su nombre
// común. Sin coincidencia (o sin nombres), el genérico.
import { SPRITE_GENERICO, SPRITES_POR_ESPECIE, type ClaveSprite } from '@/config/constantes'

const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

const ESPECIES = Object.entries(SPRITES_POR_ESPECIE) as [
  Exclude<ClaveSprite, typeof SPRITE_GENERICO>,
  { readonly generos: readonly string[]; readonly alias: readonly string[] },
][]

export function claveSpriteDeEspecie(
  nombreCientifico: string | null | undefined,
  nombreComun: string | null | undefined,
): ClaveSprite {
  const genero = normalizar(nombreCientifico ?? '').split(/\s+/)[0]
  const comun = ` ${normalizar(nombreComun ?? '')} `
  const porGenero = ESPECIES.find(([, { generos }]) => genero !== '' && generos.includes(genero))
  if (porGenero) return porGenero[0]
  // Un alias cuenta como palabra completa dentro del nombre común
  const porAlias = ESPECIES.find(([, { alias }]) =>
    alias.some((nombre) => comun.includes(` ${nombre} `)),
  )
  return porAlias ? porAlias[0] : SPRITE_GENERICO
}
