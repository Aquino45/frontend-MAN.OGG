// Panel del sector abierto: cabecera y lista de sus árboles, con carga, error y vacío.
// No pide datos: recibe el estado de la lista y los callbacks por props.
import type { ArbolFeature, SectorPropiedades } from '@/api/cliente'
import { EstadoCarga } from '@/compartido/EstadoCarga'
import { EstadoError } from '@/compartido/EstadoError'
import { EstadoVacio } from '@/compartido/EstadoVacio'
import { GlifoPixelArbol } from '@/compartido/GlifoPixelArbol'
import { SelloDemo } from '@/compartido/SelloDemo'
import { SinDato } from '@/compartido/SinDato'
import { TEXTOS_DESTACADO, TEXTOS_MAPA, TEXTOS_PANEL } from '@/config/constantes'
import type { EstadoArbolesDeSector } from '../hooks/useArbolesDeSector'
import { ordenarDestacadosPrimero } from '../lib/ordenArboles'
import { textoTotalArboles } from '../lib/textosSector'
import { IconoEstrella } from './IconoEstrella'

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
  const {
    codigo,
    nombre_comun,
    nombre_cientifico,
    estado_general,
    foto_miniatura_url,
    demo,
    destacado,
  } = arbol.properties
  return (
    <li>
      <button
        type="button"
        className={`mapa-fila${resaltado ? ' mapa-fila--resaltada' : ''}`}
        data-codigo={codigo}
        onClick={() => onAbrir(codigo)}
        onPointerEnter={() => onResaltar(codigo)}
        onPointerLeave={() => onResaltar(null)}
        onFocus={() => onResaltar(codigo)}
        onBlur={() => onResaltar(null)}
      >
        <span className="mapa-fila__miniatura" aria-hidden="true">
          {foto_miniatura_url ? <img src={foto_miniatura_url} alt="" /> : <GlifoPixelArbol />}
        </span>
        <span className="mapa-fila__texto">
          <span className="mapa-fila__nombre">{nombre_comun ?? TEXTOS_PANEL.sinDatoNombre}</span>
          <span className="mapa-fila__cientifico">{nombre_cientifico ?? <SinDato />}</span>
          <span className="mapa-fila__datos">
            <span className="mapa-fila__codigo">{codigo}</span>
            {estado_general !== null && <span>{estado_general}</span>}
            {arbol.geometry === null && <span>{TEXTOS_PANEL.sinUbicacion}</span>}
            {demo && <SelloDemo />}
          </span>
          {destacado && (
            <span className="mapa-fila__destacado">
              <IconoEstrella className="mapa-fila__estrella" />
              <span className="mapa-fila__etiqueta-destacado">{TEXTOS_DESTACADO.etiqueta}</span>
            </span>
          )}
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
      <button
        type="button"
        className="boton boton--secundario panel-sector__volver"
        onClick={onVolver}
      >
        {TEXTOS_PANEL.volverASectores}
      </button>
      <header className="panel-sector__cabecera">
        <h2 className="panel-sector__nombre">{sector.nombre}</h2>
        <p className="panel-sector__total">{textoTotalArboles(sector.total_arboles)}</p>
        {sector.provisional && (
          <p className="panel-sector__nota">{TEXTOS_MAPA.limitesProvisionales}</p>
        )}
      </header>
      {arboles.estado === 'cargando' && <EstadoCarga etiqueta={fraseCarga} forma="lista" />}
      {arboles.estado === 'error' && (
        <EstadoError mensaje={TEXTOS_PANEL.errorArboles} onReintentar={onReintentar} />
      )}
      {arboles.estado === 'listo' && arboles.arboles.length === 0 && (
        <EstadoVacio mensaje={TEXTOS_PANEL.sinArboles} />
      )}
      {arboles.estado === 'listo' && arboles.arboles.length > 0 && (
        <ul className="panel-sector__lista" aria-label={TEXTOS_PANEL.tituloLista}>
          {ordenarDestacadosPrimero(arboles.arboles).map((arbol) => (
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
