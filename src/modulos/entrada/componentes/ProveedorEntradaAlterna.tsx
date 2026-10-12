// Hace que la variante alterna de la entrada salga también al cambiar de sección (cada vez es un sorteo
// independiente, con los mismos pesos de siempre) y se pueda forzar a mano desde Inicio. La carga de la
// página la sortea la vista de entrada, no este proveedor. La variante va en su propio chunk, que se
// pide solo cuando sale.
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react'
import { useLocation, useNavigationType } from 'react-router'
import { FORZAR_ENTRADA as F, PESOS_ENTRADA, ENTRADA_ALTERNA as E } from '@/config/constantes'
import { elegirVariante } from '@/lib/elegirVariante'
import { ContextoForzarEntrada, type ControlDeEntrada } from '../hooks/contextoForzarEntrada'
import { hayGestoReciente, useRegistroDeGestos } from '../lib/gesto'
import { huellaSha256, letraDeTecla } from '../lib/huella'

interface PropsSecuencia {
  conSonido: boolean
  alCerrar: () => void
}

// Si el chunk no llega (por ejemplo, sin red), la entrada simplemente no sale
function SinSecuencia({ alCerrar }: PropsSecuencia) {
  useEffect(() => alCerrar(), [alCerrar])
  return null
}

const Secuencia = lazy<ComponentType<PropsSecuencia>>(() =>
  import('./EntradaAlterna').then(
    ({ EntradaAlterna }) => ({
      default: ({ conSonido, alCerrar }: PropsSecuencia) => (
        <EntradaAlterna conSonido={conSonido} onTerminar={() => {}} alCerrar={alCerrar} />
      ),
    }),
    () => ({ default: SinSecuencia }),
  ),
)

interface PropsProveedor {
  children: ReactNode
  // Fuente de azar del sorteo; se inyecta en los tests
  aleatorio?: () => number
  // Huella SHA-256 de lo que fuerza la variante; se inyecta en los tests
  huella?: string
}

export function ProveedorEntradaAlterna({
  children,
  aleatorio = Math.random,
  huella = F.huella,
}: PropsProveedor) {
  useRegistroDeGestos()
  const { pathname } = useLocation()
  const tipoDeNavegacion = useNavigationType()
  const [secuencia, setSecuencia] = useState<{ conSonido: boolean } | null>(null)
  const ventana = useRef<{ hasta: number; letras: string } | null>(null)
  // Valores que los efectos leen sin reiniciarse cuando cambian
  const refAleatorio = useRef(aleatorio)
  useEffect(() => {
    refAleatorio.current = aleatorio
  })

  const iniciar = useCallback((conSonido: boolean) => {
    setSecuencia((actual) => actual ?? { conSonido })
  }, [])
  const cerrar = useCallback(() => setSecuencia(null), [])

  // Un sorteo por cada cambio de sección (no por cada cambio de consulta ni por una redirección)
  const seccionAnterior = useRef(pathname)
  useEffect(() => {
    if (seccionAnterior.current === pathname) return
    seccionAnterior.current = pathname
    if (tipoDeNavegacion === 'REPLACE') return
    if (elegirVariante(PESOS_ENTRADA, refAleatorio.current()) === 'alterna') {
      iniciar(hayGestoReciente(E.gestoValidoMs))
    }
  }, [pathname, tipoDeNavegacion, iniciar])

  // Forzarla a mano: la ventana se abre con un clic en el árbol y escucha las letras que se tecleen
  useEffect(() => {
    const alTeclear = (evento: KeyboardEvent) => {
      const abierta = ventana.current
      if (!abierta || performance.now() > abierta.hasta) return
      const letra = letraDeTecla(evento)
      if (!letra) return
      abierta.letras = (abierta.letras + letra).slice(-F.largoClave)
      if (abierta.letras.length < F.largoClave) return
      const intento = abierta.letras
      void huellaSha256(intento).then((resultado) => {
        if (resultado !== huella || ventana.current !== abierta) return
        ventana.current = null
        iniciar(true)
      })
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [huella, iniciar])

  const control = useMemo<ControlDeEntrada>(
    () => ({
      clicEnArbol: () => {
        ventana.current = { hasta: performance.now() + F.ventanaMs, letras: '' }
      },
    }),
    [],
  )

  return (
    <ContextoForzarEntrada.Provider value={control}>
      {children}
      {secuencia && (
        <Suspense fallback={null}>
          <Secuencia conSonido={secuencia.conSonido} alCerrar={cerrar} />
        </Suspense>
      )}
    </ContextoForzarEntrada.Provider>
  )
}
