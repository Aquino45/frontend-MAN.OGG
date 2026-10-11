// Nombre común y científico del árbol, con los chips de origen, identificación y conservación.
import type { Ref } from 'react'
import type { Arbol } from '@/api/cliente'
import { SinDato } from '@/compartido/SinDato'
import {
  ESTRELLA_CONTORNO,
  ESTRELLA_LADO_GRILLA,
  TEXTOS_CARTILLA,
  TEXTOS_DESTACADO,
} from '@/config/constantes'
import { CapsulaAyuda } from './CapsulaAyuda'

interface PropsEncabezadoArbol {
  arbol: Arbol
  // El foco va al título al abrir la cartilla
  refTitulo?: Ref<HTMLHeadingElement>
}

// Insignia de los árboles que la administración del censo destacó: estrella y motivo
function InsigniaDestacado({ motivo }: { motivo: string | null }) {
  return (
    <p className="insignia-destacado">
      <svg
        className="insignia-destacado__estrella"
        viewBox={`0 0 ${ESTRELLA_LADO_GRILLA} ${ESTRELLA_LADO_GRILLA}`}
        aria-hidden="true"
        focusable="false"
      >
        <path d={ESTRELLA_CONTORNO} />
      </svg>
      <span className="insignia-destacado__etiqueta">{TEXTOS_DESTACADO.etiqueta}</span>
      {motivo && <span className="insignia-destacado__motivo">{motivo}</span>}
    </p>
  )
}

export function EncabezadoArbol({ arbol, refTitulo }: PropsEncabezadoArbol) {
  const fichas = [
    { campo: 'origen', valor: arbol.origen },
    { campo: 'identificacion', valor: arbol.identificacion },
  ].filter((ficha): ficha is { campo: string; valor: string } => ficha.valor !== null)
  return (
    <div className="encabezado-arbol">
      {arbol.destacado && <InsigniaDestacado motivo={arbol.motivo_destacado} />}
      <h2 className="encabezado-arbol__nombre" ref={refTitulo} tabIndex={-1}>
        {arbol.nombre_comun ?? <SinDato />}
      </h2>
      <p className="encabezado-arbol__cientifico">{arbol.nombre_cientifico ?? <SinDato />}</p>
      <ul className="encabezado-arbol__chips">
        {fichas.map((ficha) => (
          <li key={ficha.campo} className="chip">
            {ficha.valor}
            <CapsulaAyuda campo={ficha.campo} />
          </li>
        ))}
        <li className="chip">
          {TEXTOS_CARTILLA.conservacion}: {arbol.condicion_conservacion ?? TEXTOS_CARTILLA.sinDato}
          <CapsulaAyuda campo="condicion_conservacion" />
        </li>
      </ul>
    </div>
  )
}
