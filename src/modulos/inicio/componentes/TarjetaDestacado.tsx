import { Link } from 'react-router'
import { SelloDemo } from '@/compartido/SelloDemo'
import { SinDato } from '@/compartido/SinDato'
import { useEnlaceConTransicion } from '@/compartido/useEnlaceConTransicion'
import {
  ESTRELLA_CONTORNO,
  ESTRELLA_LADO_GRILLA,
  MEDIDAS,
  RUTAS,
  TEXTOS_INICIO,
} from '@/config/constantes'
import { formatearNumero } from '@/lib/formatear'
import { escribirSeleccion } from '@/modulos/mapa'
import type { MedidasDestacado } from '../hooks/useMedidasDeDestacados'
import type { Destacado } from '../lib/destacados'

interface PropsTarjetaDestacado {
  destacado: Destacado
  medidas: MedidasDestacado
}

interface PropsMedida {
  etiqueta: string
  valor: number | null
  magnitud: 'dapCm' | 'alturaM'
}

function Medida({ etiqueta, valor, magnitud }: PropsMedida) {
  const numero = formatearNumero(valor, magnitud)
  return (
    <div className="destacado-tarjeta__medida">
      <dt className="destacado-tarjeta__etiqueta">{etiqueta}</dt>
      <dd className="destacado-tarjeta__valor">
        {numero === null ? <SinDato /> : `${numero} ${MEDIDAS[magnitud].unidad}`}
      </dd>
    </div>
  )
}

// Tarjeta de un árbol destacado: toda ella es un enlace a su cartilla en el mapa.
// El DAP y la altura llegan aparte (el resumen no los trae): esqueleto, valor o «Sin dato».
export function TarjetaDestacado({ destacado, medidas }: PropsTarjetaDestacado) {
  const conTransicion = useEnlaceConTransicion()
  const { arbol, nombreSector } = destacado
  const destino = {
    pathname: RUTAS.mapa,
    search: escribirSeleccion({ sectorId: arbol.sector, arbolCodigo: arbol.codigo }),
  }
  const ubicacion = [arbol.codigo, nombreSector].filter(Boolean).join(' · ')
  return (
    <Link className="destacado-tarjeta" to={destino} onClick={conTransicion}>
      <span className="destacado-tarjeta__cabecera">
        <svg
          className="destacado-tarjeta__estrella"
          viewBox={`0 0 ${ESTRELLA_LADO_GRILLA} ${ESTRELLA_LADO_GRILLA}`}
          aria-hidden="true"
          focusable="false"
        >
          <path d={ESTRELLA_CONTORNO} />
        </svg>
        {arbol.demo && <SelloDemo />}
      </span>
      <h3 className="destacado-tarjeta__nombre">{arbol.nombre_comun ?? <SinDato />}</h3>
      <em className="destacado-tarjeta__cientifico">{arbol.nombre_cientifico ?? <SinDato />}</em>
      <span className="destacado-tarjeta__ubicacion">{ubicacion}</span>
      <div className="destacado-tarjeta__medidas" aria-busy={medidas.estado === 'cargando'}>
        {medidas.estado === 'cargando' && (
          <>
            <span className="solo-lectores">{TEXTOS_INICIO.destacados.cargandoMedidas}</span>
            <span className="destacado-tarjeta__esqueleto" aria-hidden="true" />
            <span className="destacado-tarjeta__esqueleto" aria-hidden="true" />
          </>
        )}
        {medidas.estado !== 'cargando' && (
          <dl className="destacado-tarjeta__lista">
            <Medida
              etiqueta={TEXTOS_INICIO.destacados.dap}
              valor={medidas.estado === 'listo' ? medidas.dapCm : null}
              magnitud="dapCm"
            />
            <Medida
              etiqueta={TEXTOS_INICIO.destacados.altura}
              valor={medidas.estado === 'listo' ? medidas.alturaM : null}
              magnitud="alturaM"
            />
          </dl>
        )}
      </div>
    </Link>
  )
}
