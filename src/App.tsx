import { Suspense, useEffect, useState, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router'
import { RUTAS, TEXTO_CARGANDO_PAGINA, TEXTOS_MAPA } from '@/config/constantes'
import { EstadoCarga } from '@/compartido/EstadoCarga'
import { ProveedorTransicionDePagina } from '@/compartido/ProveedorTransicionDePagina'
import { Cabecera, Pie, VistaNoEncontrada } from '@/modulos/armazon'
import { precargarVistaCifras, VistaCifras } from '@/modulos/cifras'
import { VistaEntrada } from '@/modulos/entrada'
import { precargarVistaExplorar, VistaExplorar } from '@/modulos/explorar'
import { VistaInicio } from '@/modulos/inicio'
import { precargarVistaMapa, tieneSeleccion, VistaMapa } from '@/modulos/mapa'

interface PropsApp {
  // Fuente de azar del sorteo de la entrada; se inyecta en los tests.
  aleatorioEntrada?: () => number
}

// En Inicio, un enlace viejo con sector o árbol en la consulta pasa al mapa con la misma consulta.
function RutaInicio() {
  const { search } = useLocation()
  if (tieneSeleccion(search)) {
    return <Navigate replace to={{ pathname: RUTAS.mapa, search }} />
  }
  return <VistaInicio />
}

function RutaMapa() {
  return (
    <>
      <h1 className="solo-lectores">{TEXTOS_MAPA.tituloRegion}</h1>
      <VistaMapa />
    </>
  )
}

// Cuando el navegador queda libre, trae el código de las demás páginas: al navegar ya está.
function usePrecargaDePaginas() {
  useEffect(() => {
    const precargar = () => {
      void precargarVistaMapa()
      void precargarVistaExplorar()
      void precargarVistaCifras()
    }
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(precargar)
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(precargar, 0)
    return () => window.clearTimeout(id)
  }, [])
}

function Armazon({ aleatorioEntrada }: PropsApp) {
  const ubicacion = useLocation()
  usePrecargaDePaginas()
  // La entrada animada sale solo si la página se abre en Inicio; no cambia al navegar después.
  const [entraPorInicio] = useState(
    () => ubicacion.pathname === RUTAS.inicio && !tieneSeleccion(ubicacion.search),
  )

  const pagina: ReactNode = (
    <div className="app">
      <Cabecera />
      <main>
        <Suspense fallback={<EstadoCarga etiqueta={TEXTO_CARGANDO_PAGINA} />}>
          <Routes>
            <Route path={RUTAS.inicio} element={<RutaInicio />} />
            <Route path={RUTAS.mapa} element={<RutaMapa />} />
            <Route path={RUTAS.arboles} element={<VistaExplorar />} />
            <Route path={RUTAS.cifras} element={<VistaCifras />} />
            <Route path="*" element={<VistaNoEncontrada />} />
          </Routes>
        </Suspense>
      </main>
      <Pie />
    </div>
  )

  return entraPorInicio ? (
    <VistaEntrada aleatorio={aleatorioEntrada}>{pagina}</VistaEntrada>
  ) : (
    pagina
  )
}

export default function App({ aleatorioEntrada }: PropsApp) {
  return (
    <BrowserRouter>
      <ProveedorTransicionDePagina>
        <Armazon aleatorioEntrada={aleatorioEntrada} />
      </ProveedorTransicionDePagina>
    </BrowserRouter>
  )
}
