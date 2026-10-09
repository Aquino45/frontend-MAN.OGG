import { TEMAS, TEXTOS_TEMA } from '@/config/constantes'
import { useTema } from '../hooks/useTema'

// Botón que alterna entre el tema claro y el oscuro. El ícono muestra el tema al que se cambia.
export function InterruptorTema() {
  const { tema, alternar } = useTema()
  const vaAClaro = tema === TEMAS.oscuro
  const nombre = vaAClaro ? TEXTOS_TEMA.cambiarAClaro : TEXTOS_TEMA.cambiarAOscuro

  return (
    <button
      type="button"
      className="interruptor-tema"
      onClick={alternar}
      aria-label={nombre}
      title={nombre}
    >
      <svg
        className="interruptor-tema__icono"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        {vaAClaro ? (
          <g>
            <circle cx="12" cy="12" r="4.5" />
            <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
          </g>
        ) : (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        )}
      </svg>
    </button>
  )
}
