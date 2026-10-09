import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/global.css'
import App from './App'
import { obtenerEntorno } from './config/entorno'

// Falla temprano y con mensaje claro si el .env está mal configurado.
obtenerEntorno()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
