// Panel del sector abierto: cabecera y lista de sus árboles, con carga, error y vacío.
// No pide datos: recibe el estado de la lista y los callbacks por props.
import type { ArbolFeature, SectorPropiedades } from '@/api/cliente'
import { GlifoPixelArbol } from '@/compartido/GlifoPixelArbol'
import { SelloDemo } from '@/compartido/SelloDemo'
import { SinDato } from '@/compartido/SinDato'
import { TEXTOS_MAPA, TEXTOS_PANEL } from '@/config/constantes'
import type { EstadoArbolesDeSector } from '../hooks/useArbolesDeSector'
import { textoTotalArboles } from '../lib/textosSector'

interface PropsPanelSector {
  sector: SectorPropiedades
  arboles: EstadoArbolesDeSector
  fraseCarga: string
  codigoResaltado: string | null
  onResaltar: (codigo: string | null) => void
  onAbrir: (codigo: string) => void
  onVolver: () => void
  onReintentar: () => void
}

function FilaArbol({
  arbol,
  resaltado,
  onResaltar,
  onAbrir,
}: {
  arbol: ArbolFeature
  resaltado: boolean
  onResaltar: (codigo: string | null) => void
  onAbrir: (codigo: string) => void
}) {
  const { codigo, nombre_comun, nombre_cientifico, estado_general, foto_miniatura_url, demo } =
    arbol.properties
  return (
    <li>
      <button
        type="button"
        className={`fila-arbol${resaltado ? ' fila-arbol--resaltada' : ''}`}
        data-codigo={codigo}
        onClick={() => onAbrir(codigo)}
        onPointerEnter={() => onResaltar(codigo)}
        onPointerLeave={() => onResaltar(null)}
        onFocus={() => onResaltar(codigo)}
        onBlur={() => onResaltar(null)}
      >
        <span className="fila-arbol__miniatura" aria-hidden="true">
          {foto_miniatura_url ? <img src={foto_miniatura_url} alt="" /> : <GlifoPixelArbol />}
        </span>
        <span className="fila-arbol__texto">
          <span className="fila-arbol__nombre">{nombre_comun ?? TEXTOS_PANEL.sinDatoNombre}</span>
          <span className="fila-arbol__cientifico">{nombre_cientifico ?? <SinDato />}</span>
          <span className="fila-arbol__datos">
            <span className="fila-arbol__codigo">{codigo}</span>
            {estado_general !== null && <span>{estado_general}</span>}
            {arbol.geometry === null && <span>{TEXTOS_PANEL.sinUbicacion}</span>}
            {demo && <SelloDemo />}
          </span>
        </span>
      </button>
    </li>
  )
}

export function PanelSector({
  sector,
  arboles,
  fraseCarga,
  codigoResaltado,
  onResaltar,
  onAbrir,
  onVolver,
  onReintentar,
}: PropsPanelSector) {
  return (
    <section className="panel-sector" aria-label={sector.nombre}>
      <button type="button" className="boton boton--texto" onClick={onVolver}>
        {`← ${TEXTOS_PANEL.volverASectores}`}
      </button>
      <header className="panel-sector__cabecera">
        <h2 className="panel-sector__nombre">{sector.nombre}</h2>
        <p className="panel-sector__total">{textoTotalArboles(sector.total_arboles)}</p>
        {sector.provisional && (
          <p className="panel-sector__nota">{TEXTOS_MAPA.limitesProvisionales}</p>
        )}
      </header>
      {arboles.estado === 'cargando' && (
        <p className="panel-sector__mensaje" role="status">
          {fraseCarga}
        </p>
      )}
      {arboles.estado === 'error' && (
        <div className="panel-sector__mensaje" role="alert">
          <p>{TEXTOS_PANEL.errorArboles}</p>
          <button type="button" className="boton" onClick={onReintentar}>
            {TEXTOS_PANEL.reintentar}
          </button>
        </div>
      )}
      {arboles.estado === 'listo' && arboles.arboles.length === 0 && (
        <p className="panel-sector__mensaje">{TEXTOS_PANEL.sinArboles}</p>
      )}
      {arboles.estado === 'listo' && arboles.arboles.length > 0 && (
        <ul className="panel-sector__lista" aria-label={TEXTOS_PANEL.tituloLista}>
          {arboles.arboles.map((arbol) => (
            <FilaArbol
              key={arbol.properties.codigo}
              arbol={arbol}
              resaltado={arbol.properties.codigo === codigoResaltado}
              onResaltar={onResaltar}
              onAbrir={onAbrir}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
