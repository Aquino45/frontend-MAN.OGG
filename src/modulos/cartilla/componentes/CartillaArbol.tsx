// Cartilla de un árbol: los 19 campos en el orden del diseño. No pide datos: recibe el árbol.
import type { Ref } from 'react'
import type { Arbol } from '@/api/cliente'
import { NOMBRE_CAMPUS } from '@/config/constantes'
import { BloqueCo2 } from './BloqueCo2'
import { CapsulaAyuda } from './CapsulaAyuda'
import { DetalleArbol } from './DetalleArbol'
import { EncabezadoArbol } from './EncabezadoArbol'
import { FotoArbol } from './FotoArbol'
import { IndicadoresArbol } from './IndicadoresArbol'
import { ProveedorCapsulas } from './ProveedorCapsulas'
import { SobreEsteArbol } from './SobreEsteArbol'

interface PropsCartillaArbol {
  arbol: Arbol
  nombreSector: string
  refTitulo?: Ref<HTMLHeadingElement>
}

export function CartillaArbol({ arbol, nombreSector, refTitulo }: PropsCartillaArbol) {
  return (
    <ProveedorCapsulas capsulas={arbol.capsulas}>
      <article className="cartilla" aria-label={arbol.codigo}>
        <div className="cartilla__franja">
          <span className="cartilla__codigo">
            {arbol.codigo}
            <CapsulaAyuda campo="codigo" />
          </span>
          <span className="cartilla__sector">
            {nombreSector} · {NOMBRE_CAMPUS}
          </span>
        </div>
        <FotoArbol arbol={arbol} />
        <EncabezadoArbol arbol={arbol} refTitulo={refTitulo} />
        <IndicadoresArbol arbol={arbol} />
        <BloqueCo2 arbol={arbol} />
        <SobreEsteArbol arbol={arbol} />
        <DetalleArbol arbol={arbol} />
      </article>
    </ProveedorCapsulas>
  )
}
