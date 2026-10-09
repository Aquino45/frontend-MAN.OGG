import { VistaMapa } from '@/modulos/mapa'
import { InterruptorTema } from '@/modulos/tema'

export default function App() {
  return (
    <div className="app">
      <header className="cabecera">
        <div>
          <h1 className="cabecera__titulo">MAN.OGG</h1>
          <p className="cabecera__linea">Censo arbóreo · UPeU Ñaña</p>
        </div>
        <InterruptorTema />
      </header>
      <main>
        <VistaMapa />
      </main>
    </div>
  )
}
