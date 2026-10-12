// Filtros del tablero: el sector (los de la API), si se miran los datos de campo, los de ejemplo o
// todos, y la especie elegida en la dona (con su botón para quitarla). Son botones con
// `aria-pressed`: se usan con el teclado y no animan nada.
import { DATOS_TABLERO, TEXTOS_TABLERO } from '@/config/constantes'
import { hayFiltros, type DatosFiltro, type FiltrosTablero } from '../lib/filtrosTablero'

export interface OpcionSector {
  id: number
  nombre: string
}

interface PropsFiltrosTablero {
  sectores: readonly OpcionSector[]
  filtros: FiltrosTablero
  onCambiar: (cambios: Partial<FiltrosTablero>) => void
}

const OPCIONES_DATOS: readonly { valor: DatosFiltro; texto: string }[] = [
  { valor: DATOS_TABLERO.campo, texto: TEXTOS_TABLERO.filtros.campo },
  { valor: DATOS_TABLERO.ejemplo, texto: TEXTOS_TABLERO.filtros.ejemplo },
  { valor: DATOS_TABLERO.todos, texto: TEXTOS_TABLERO.filtros.todos },
]

export function FiltrosTablero({ sectores, filtros, onCambiar }: PropsFiltrosTablero) {
  const textos = TEXTOS_TABLERO.filtros
  return (
    <div className="tablero-filtros" role="group" aria-label={textos.grupo}>
      <div className="tablero-filtros__grupo" role="group" aria-label={textos.sector}>
        <span className="tablero-filtros__etiqueta" aria-hidden="true">
          {textos.sector}
        </span>
        <div className="tablero-segmento">
          <button
            type="button"
            aria-pressed={filtros.sector === null}
            onClick={() => onCambiar({ sector: null })}
          >
            {textos.todos}
          </button>
          {sectores.map((sector) => (
            <button
              key={sector.id}
              type="button"
              aria-pressed={filtros.sector === sector.id}
              aria-label={sector.nombre}
              onClick={() => onCambiar({ sector: sector.id })}
            >
              {sector.id}
            </button>
          ))}
        </div>
      </div>
      <div className="tablero-filtros__grupo" role="group" aria-label={textos.datos}>
        <span className="tablero-filtros__etiqueta" aria-hidden="true">
          {textos.datos}
        </span>
        <div className="tablero-segmento">
          {OPCIONES_DATOS.map(({ valor, texto }) => (
            <button
              key={valor}
              type="button"
              aria-pressed={filtros.datos === valor}
              onClick={() => onCambiar({ datos: valor })}
            >
              {texto}
            </button>
          ))}
        </div>
      </div>
      {filtros.especie !== null && (
        <p className="tablero-filtros__especie">
          <span>{textos.especieActiva.replace('{especie}', filtros.especie)}</span>
          <button
            type="button"
            className="tablero-enlace"
            onClick={() => onCambiar({ especie: null })}
          >
            {textos.quitarEspecie}
          </button>
        </p>
      )}
      {hayFiltros(filtros) && (
        <button
          type="button"
          className="tablero-enlace"
          onClick={() => onCambiar({ sector: null, datos: DATOS_TABLERO.todos, especie: null })}
        >
          {textos.limpiar}
        </button>
      )}
    </div>
  )
}
