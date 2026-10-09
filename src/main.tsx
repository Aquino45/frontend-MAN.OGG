import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/global.css'
import App from './App'
import { obtenerEntorno } from './config/entorno'
import { aplicarTemaInicial } from './modulos/tema'

// Falla temprano y con mensaje claro si el .env está mal configurado.
obtenerEntorno()

// El tema se aplica antes del primer render para que la página no parpadee.
aplicarTemaInicial()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
