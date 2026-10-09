import { NOMBRE_PRODUCTO } from '@/config/constantes'
import { VistaMapa } from '@/modulos/mapa'
import { InterruptorTema } from '@/modulos/tema'

export default function App() {
  return (
    <div className="app">
      <header className="cabecera">
        <h1 className="cabecera__titulo">{NOMBRE_PRODUCTO}</h1>
        <InterruptorTema />
      </header>
      <main>
        <VistaMapa />
      </main>
    </div>
  )
}
