// Una fila de la lista: todo el recuadro es un enlace a la cartilla del árbol en el mapa.
// Solo usa lo que trae el resumen del árbol; el motivo de un destacado va solo en la cartilla.
import { memo } from 'react'
import { Link } from 'react-router'
import type { ArbolResumen } from '@/api/cliente'
import { GlifoPixelArbol } from '@/compartido/GlifoPixelArbol'
import { SelloDemo } from '@/compartido/SelloDemo'
import { SinDato } from '@/compartido/SinDato'
import {
  ESTRELLA_CONTORNO,
  ESTRELLA_LADO_GRILLA,
  RUTAS,
  TEXTOS_CARTILLA,
  TEXTOS_DESTACADO,
} from '@/config/constantes'
import { escribirSeleccion } from '@/modulos/mapa'

interface PropsFilaArbol {
  arbol: ArbolResumen
  // Nombre del sector según la API; null si no vino
  nombreSector: string | null
}

function FilaArbolSinMemo({ arbol, nombreSector }: PropsFilaArbol) {
  const destino = {
    pathname: RUTAS.mapa,
    search: escribirSeleccion({ sectorId: arbol.sector, arbolCodigo: arbol.codigo }),
  }
  const ubicacion = [arbol.codigo, nombreSector].filter(Boolean).join(' · ')
  return (
    <Link className="fila-arbol" to={destino}>
      <span className="fila-arbol__miniatura">
        {arbol.foto_miniatura_url ? (
          <img className="fila-arbol__foto" src={arbol.foto_miniatura_url} alt="" loading="lazy" />
        ) : (
          <GlifoPixelArbol />
        )}
      </span>
      <span className="fila-arbol__cuerpo">
        <span className="fila-arbol__nombre">{arbol.nombre_comun ?? <SinDato />}</span>
        <em className="fila-arbol__cientifico">{arbol.nombre_cientifico ?? <SinDato />}</em>
        <span className="fila-arbol__ubicacion">{ubicacion}</span>
        <span className="fila-arbol__marcas">
          <span className="fila-arbol__estado">
            {TEXTOS_CARTILLA.estado}: {arbol.estado_general ?? <SinDato />}
          </span>
          {arbol.destacado && (
            <span className="fila-arbol__destacado">
              <svg
                className="fila-arbol__estrella"
                viewBox={`0 0 ${ESTRELLA_LADO_GRILLA} ${ESTRELLA_LADO_GRILLA}`}
                aria-hidden="true"
                focusable="false"
              >
                <path d={ESTRELLA_CONTORNO} />
              </svg>
              {TEXTOS_DESTACADO.etiqueta}
            </span>
          )}
          {arbol.demo && <SelloDemo />}
        </span>
      </span>
    </Link>
  )
}

// Con la búsqueda no se vuelven a dibujar las filas que no cambian
export const FilaArbol = memo(FilaArbolSinMemo)
