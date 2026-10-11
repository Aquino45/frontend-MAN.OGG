// Buscador y filtros de la lista de árboles: controles nativos con etiqueta visible.
import { useId } from 'react'
import { ORIGENES_DATO, TEXTOS_EXPLORAR } from '@/config/constantes'
import type { FiltrosExplorar, OrigenDato } from '../lib/filtros'

export interface OpcionSector {
  id: number
  nombre: string
}

interface PropsBarraFiltros {
  filtros: FiltrosExplorar
  // Sectores según la API
  sectores: readonly OpcionSector[]
  // Valores de estado general que traen los árboles
  estados: readonly string[]
  // `reemplazar` es para el buscador: no llena el historial
  onCambiar: (cambios: Partial<FiltrosExplorar>, reemplazar?: boolean) => void
}

export function BarraFiltros({ filtros, sectores, estados, onCambiar }: PropsBarraFiltros) {
  const id = useId()
  // Un estado que viene en la URL y ya no existe entre los árboles igual se ve en el selector
  const opcionesDeEstado =
    filtros.estadoGeneral !== null && !estados.includes(filtros.estadoGeneral)
      ? [...estados, filtros.estadoGeneral]
      : estados

  return (
    <form
      className="explorar-filtros"
      role="search"
      aria-label={TEXTOS_EXPLORAR.ariaFiltros}
      onSubmit={(evento) => evento.preventDefault()}
    >
      <div className="explorar-campo explorar-campo--busqueda">
        <label className="explorar-campo__etiqueta" htmlFor={`${id}-q`}>
          {TEXTOS_EXPLORAR.buscar}
        </label>
        <input
          id={`${id}-q`}
          className="explorar-control"
          type="search"
          value={filtros.busqueda}
          placeholder={TEXTOS_EXPLORAR.ayudaBuscar}
          autoComplete="off"
          onChange={(evento) => onCambiar({ busqueda: evento.target.value }, true)}
        />
      </div>
      <div className="explorar-campo">
        <label className="explorar-campo__etiqueta" htmlFor={`${id}-sector`}>
          {TEXTOS_EXPLORAR.sector}
        </label>
        <select
          id={`${id}-sector`}
          className="explorar-control"
          value={filtros.sectorId === null ? '' : String(filtros.sectorId)}
          onChange={(evento) =>
            onCambiar({ sectorId: evento.target.value === '' ? null : Number(evento.target.value) })
          }
        >
          <option value="">{TEXTOS_EXPLORAR.todosSectores}</option>
          {sectores.map((sector) => (
            <option key={sector.id} value={sector.id}>
              {sector.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="explorar-campo">
        <label className="explorar-campo__etiqueta" htmlFor={`${id}-estado`}>
          {TEXTOS_EXPLORAR.estado}
        </label>
        <select
          id={`${id}-estado`}
          className="explorar-control"
          value={filtros.estadoGeneral ?? ''}
          onChange={(evento) =>
            onCambiar({ estadoGeneral: evento.target.value === '' ? null : evento.target.value })
          }
        >
          <option value="">{TEXTOS_EXPLORAR.todosEstados}</option>
          {opcionesDeEstado.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
      </div>
      <div className="explorar-campo">
        <label className="explorar-campo__etiqueta" htmlFor={`${id}-origen`}>
          {TEXTOS_EXPLORAR.origen}
        </label>
        <select
          id={`${id}-origen`}
          className="explorar-control"
          value={filtros.origen ?? ''}
          onChange={(evento) =>
            onCambiar({
              origen: evento.target.value === '' ? null : (evento.target.value as OrigenDato),
            })
          }
        >
          <option value="">{TEXTOS_EXPLORAR.todosOrigenes}</option>
          <option value={ORIGENES_DATO.campo}>{TEXTOS_EXPLORAR.origenCampo}</option>
          <option value={ORIGENES_DATO.ejemplo}>{TEXTOS_EXPLORAR.origenEjemplo}</option>
        </select>
      </div>
      <label className="explorar-casilla" htmlFor={`${id}-destacados`}>
        <input
          id={`${id}-destacados`}
          className="explorar-casilla__control"
          type="checkbox"
          checked={filtros.soloDestacados}
          onChange={(evento) => onCambiar({ soloDestacados: evento.target.checked })}
        />
        {TEXTOS_EXPLORAR.soloDestacados}
      </label>
    </form>
  )
}
