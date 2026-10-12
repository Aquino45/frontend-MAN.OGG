// Árbol pixel de la especie: marca el lugar de una foto o de una miniatura. Es adorno: representa a
// la especie, no a un árbol concreto del censo.
import './marca.estilos.css'
import { capasDeFilas } from './capasDeFilas'
import { claveSpriteDeEspecie } from './claveSprite'
import { SPRITES, type LadoSprite } from './sprites.datos'

interface PropsSpriteArbol {
  nombreCientifico?: string | null
  nombreComun?: string | null
  // 16 para miniaturas y 32 para los tamaños grandes
  lado?: LadoSprite
}

export function SpriteArbol({ nombreCientifico, nombreComun, lado = 16 }: PropsSpriteArbol) {
  const clave = claveSpriteDeEspecie(nombreCientifico, nombreComun)
  return (
    <svg
      className="sprite-arbol"
      data-especie={clave}
      viewBox={`0 0 ${lado} ${lado}`}
      aria-hidden="true"
      focusable="false"
    >
      {capasDeFilas(SPRITES[clave][lado]).map(({ letra, trazo }) => (
        <path key={letra} className={`marca-px marca-px--${letra}`} d={trazo} />
      ))}
    </svg>
  )
}
