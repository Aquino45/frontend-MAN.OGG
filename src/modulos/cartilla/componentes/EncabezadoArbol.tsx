// Nombre común y científico del árbol, con los chips de origen, identificación y conservación.
import type { Ref } from 'react'
import type { Arbol } from '@/api/cliente'
import { SinDato } from '@/compartido/SinDato'
import { TEXTOS_CARTILLA } from '@/config/constantes'

interface PropsEncabezadoArbol {
  arbol: Arbol
  // El foco va al título al abrir la cartilla
  refTitulo?: Ref<HTMLHeadingElement>
}

export function EncabezadoArbol({ arbol, refTitulo }: PropsEncabezadoArbol) {
  const fichas = [arbol.origen, arbol.identificacion].filter(
    (valor): valor is string => valor !== null,
  )
  return (
    <div className="encabezado-arbol">
      <h2 className="encabezado-arbol__nombre" ref={refTitulo} tabIndex={-1}>
        {arbol.nombre_comun ?? <SinDato />}
      </h2>
      <p className="encabezado-arbol__cientifico">{arbol.nombre_cientifico ?? <SinDato />}</p>
      <ul className="encabezado-arbol__chips">
        {fichas.map((ficha) => (
          <li key={ficha} className="chip">
            {ficha}
          </li>
        ))}
        <li className="chip">
          {TEXTOS_CARTILLA.conservacion}: {arbol.condicion_conservacion ?? TEXTOS_CARTILLA.sinDato}
        </li>
      </ul>
    </div>
  )
}
