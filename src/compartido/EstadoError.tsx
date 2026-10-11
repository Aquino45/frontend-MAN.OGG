// Estado de error: dice qué falló y deja reintentar con un botón secundario.
import { TEXTOS_ESTADOS } from '@/config/constantes'
import './estados.estilos.css'

interface PropsEstadoError {
  // Qué falló, en una frase («No pudimos cargar los sectores.»)
  mensaje: string
  onReintentar: () => void
}

export function EstadoError({ mensaje, onReintentar }: PropsEstadoError) {
  return (
    <div className="estado estado--error" role="alert">
      <p className="estado__mensaje">{mensaje}</p>
      <button type="button" className="boton boton--secundario" onClick={onReintentar}>
        {TEXTOS_ESTADOS.reintentar}
      </button>
    </div>
  )
}
