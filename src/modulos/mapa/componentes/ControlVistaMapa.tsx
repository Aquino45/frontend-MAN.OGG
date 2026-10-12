// Control de la vista del mapa: «Ilustrado», «Calles» y «Satélite».
import { TEXTOS_SATELITE, type VistaMapaTipo } from '@/config/satelite'

interface PropsControlVistaMapa {
  vista: VistaMapaTipo
  // Las vistas que se pueden elegir (el satélite solo existe con la clave de Esri)
  vistas: readonly VistaMapaTipo[]
  onCambiarVista: (vista: VistaMapaTipo) => void
}

export function ControlVistaMapa({ vista, vistas, onCambiarVista }: PropsControlVistaMapa) {
  return (
    <div className="control-vista-mapa">
      <div
        role="group"
        aria-label={TEXTOS_SATELITE.grupoVista}
        className="control-vista-mapa__vistas"
      >
        {vistas.map((opcion) => (
          <button
            key={opcion}
            type="button"
            className="boton boton--secundario control-vista-mapa__boton"
            aria-pressed={vista === opcion}
            onClick={() => onCambiarVista(opcion)}
          >
            {TEXTOS_SATELITE[opcion]}
          </button>
        ))}
      </div>
    </div>
  )
}
