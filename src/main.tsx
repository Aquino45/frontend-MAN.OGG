import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/global.css'
import App from './App'
import { arrancarCargaTemprana } from './arranqueTemprano'
import { obtenerEntorno } from './config/entorno'
import { iniciarModalidadEntrada } from './compartido/modalidadEntrada'
import { aplicarTemaInicial } from './modulos/tema'

// Falla temprano y con mensaje claro si el .env está mal configurado.
obtenerEntorno()

// El tema se aplica antes del primer render para que la página no parpadee.
aplicarTemaInicial()

// Con el teclado no se anima nada; el CSS lo lee de un atributo en <html>.
iniciarModalidadEntrada()

// Lo que la primera página va a pedir se pide ya, en paralelo con el dibujo.
arrancarCargaTemprana(window.location.pathname)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
