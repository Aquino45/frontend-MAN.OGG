// Control de la vista del mapa: «Ilustrado / Satélite» y, en el satélite, «Teñido» (opcional).
// Solo se dibuja si hay vista satelital configurada (lo decide quien lo usa).
import { TEXTOS_SATELITE, type VistaMapaTipo } from '@/config/satelite'

interface PropsControlVistaMapa {
  vista: VistaMapaTipo
  tenido: boolean
  onCambiarVista: (vista: VistaMapaTipo) => void
  onAlternarTenido: () => void
}

export function ControlVistaMapa({
  vista,
  tenido,
  onCambiarVista,
  onAlternarTenido,
}: PropsControlVistaMapa) {
  const opciones: { vista: VistaMapaTipo; texto: string }[] = [
    { vista: 'ilustrado', texto: TEXTOS_SATELITE.ilustrado },
    { vista: 'satelite', texto: TEXTOS_SATELITE.satelite },
  ]
  return (
    <div className="control-vista-mapa">
      <div
        role="group"
        aria-label={TEXTOS_SATELITE.grupoVista}
        className="control-vista-mapa__vistas"
      >
        {opciones.map((opcion) => (
          <button
            key={opcion.vista}
            type="button"
            className="boton boton--secundario control-vista-mapa__boton"
            aria-pressed={vista === opcion.vista}
            onClick={() => onCambiarVista(opcion.vista)}
          >
            {opcion.texto}
          </button>
        ))}
      </div>
      {vista === 'satelite' && (
        <button
          type="button"
          className="boton boton--secundario control-vista-mapa__boton"
          aria-pressed={tenido}
          onClick={onAlternarTenido}
        >
          {TEXTOS_SATELITE.tenido}
        </button>
      )}
    </div>
  )
}
