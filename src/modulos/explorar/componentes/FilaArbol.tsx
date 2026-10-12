// Una fila de la lista: todo el recuadro es un enlace a la cartilla del árbol en el mapa.
// Solo usa lo que trae el resumen del árbol; el motivo de un destacado va solo en la cartilla.
import { memo } from 'react'
import { Link } from 'react-router'
import type { ArbolResumen } from '@/api/cliente'
import { GlifoPixelArbol } from '@/compartido/GlifoPixelArbol'
import { SelloDemo } from '@/compartido/SelloDemo'
import { SinDato } from '@/compartido/SinDato'
import { useEnlaceConTransicion } from '@/compartido/useEnlaceConTransicion'
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
  const conTransicion = useEnlaceConTransicion()
  const destino = {
    pathname: RUTAS.mapa,
    search: escribirSeleccion({ sectorId: arbol.sector, arbolCodigo: arbol.codigo }),
  }
  const ubicacion = [arbol.codigo, nombreSector].filter(Boolean).join(' · ')
  return (
    <Link className="explorar-fila elevable" to={destino} onClick={conTransicion}>
      <span className="explorar-fila__miniatura">
        {arbol.foto_miniatura_url ? (
          <img
            className="explorar-fila__foto"
            src={arbol.foto_miniatura_url}
            alt=""
            loading="lazy"
          />
        ) : (
          <GlifoPixelArbol />
        )}
      </span>
      <span className="explorar-fila__cuerpo">
        <span className="explorar-fila__nombre">{arbol.nombre_comun ?? <SinDato />}</span>
        <em className="explorar-fila__cientifico">{arbol.nombre_cientifico ?? <SinDato />}</em>
        <span className="explorar-fila__ubicacion">{ubicacion}</span>
        <span className="explorar-fila__marcas">
          <span className="explorar-fila__estado">
            {TEXTOS_CARTILLA.estado}: {arbol.estado_general ?? <SinDato />}
          </span>
          {arbol.destacado && (
            <span className="explorar-fila__destacado">
              <svg
                className="explorar-fila__estrella"
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
