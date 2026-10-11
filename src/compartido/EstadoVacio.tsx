// Estado vacío: una frase y, si hay una salida útil (p. ej. «Limpiar filtros»), una acción.
import './estados.estilos.css'

interface AccionEstadoVacio {
  texto: string
  alPulsar: () => void
}

interface PropsEstadoVacio {
  mensaje: string
  accion?: AccionEstadoVacio
}

export function EstadoVacio({ mensaje, accion }: PropsEstadoVacio) {
  return (
    <div className="estado estado--vacio">
      <p className="estado__mensaje">{mensaje}</p>
      {accion && (
        <button type="button" className="boton boton--secundario" onClick={accion.alPulsar}>
          {accion.texto}
        </button>
      )}
    </div>
  )
}
