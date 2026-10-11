// Estados de campo, observaciones y pie con ubicación, fuente y fecha de registro.
import type { Arbol } from '@/api/cliente'
import { SinDato } from '@/compartido/SinDato'
import { ETIQUETA_ZONA_UTM, TEXTOS_CARTILLA } from '@/config/constantes'
import { formatearNumero } from '@/lib/formatear'
import { CapsulaAyuda } from './CapsulaAyuda'

interface PropsDetalleArbol {
  arbol: Arbol
}

function ubicacionDe(arbol: Arbol): string | null {
  const lat = formatearNumero(arbol.lat, 'grados')
  const lon = formatearNumero(arbol.lon, 'grados')
  if (lat === null || lon === null) return null
  const este = formatearNumero(arbol.utm_este_m, 'utmM')
  const norte = formatearNumero(arbol.utm_norte_m, 'utmM')
  const utm = este !== null && norte !== null ? ` · ${ETIQUETA_ZONA_UTM} ${este} E ${norte} N` : ''
  return `${lat}, ${lon}${utm}`
}

export function DetalleArbol({ arbol }: PropsDetalleArbol) {
  const estados = [
    [TEXTOS_CARTILLA.estadoCopa, arbol.estado_copa, 'estado_copa'],
    [TEXTOS_CARTILLA.troncoDanos, arbol.tronco_danos, 'tronco_danos'],
    [TEXTOS_CARTILLA.raicesBase, arbol.raices_base, 'raices_base'],
    [TEXTOS_CARTILLA.interferencia, arbol.interferencia_entorno, 'interferencia_entorno'],
  ] as const
  const ubicacion = ubicacionDe(arbol)
  return (
    <>
      <dl className="estados-arbol">
        {estados.map(([etiqueta, valor, campo]) => (
          <div key={etiqueta} className="estados-arbol__campo">
            <dt className="estados-arbol__etiqueta">
              {etiqueta}
              <CapsulaAyuda campo={campo} />
            </dt>
            <dd className="estados-arbol__valor">{valor ?? <SinDato />}</dd>
          </div>
        ))}
      </dl>
      {arbol.observaciones !== null && <p className="observaciones-arbol">{arbol.observaciones}</p>}
      <footer className="pie-arbol">
        <span className="pie-arbol__ubicacion">
          {ubicacion ?? <SinDato />}
          <CapsulaAyuda campo="ubicacion" />
        </span>
        <span>{arbol.fuente}</span>
        <span>
          {TEXTOS_CARTILLA.registrado}: {arbol.fecha_registro ?? <SinDato />}
        </span>
      </footer>
    </>
  )
}
