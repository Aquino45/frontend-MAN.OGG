import { NOMBRE_PRODUCTO } from '@/config/constantes'
import { VistaEntrada } from '@/modulos/entrada'
import { VistaMapa } from '@/modulos/mapa'
import { InterruptorTema } from '@/modulos/tema'

interface PropsApp {
  // Fuente de azar del sorteo de la entrada; se inyecta en los tests.
  aleatorioEntrada?: () => number
}

export default function App({ aleatorioEntrada }: PropsApp) {
  return (
    <VistaEntrada aleatorio={aleatorioEntrada}>
      <div className="app">
        <header className="cabecera">
          <h1 className="cabecera__titulo">{NOMBRE_PRODUCTO}</h1>
          <InterruptorTema />
        </header>
        <main>
          <VistaMapa />
        </main>
      </div>
    </VistaEntrada>
  )
}
