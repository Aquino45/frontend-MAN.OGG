import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

// El primer test de cada archivo paga la carga fría de jsdom y de los módulos: en una máquina o un CI
// lentos la espera de 1 s de Testing Library no alcanza aunque la pantalla esté bien.
configure({ asyncUtilTimeout: 4000 })

afterEach(() => cleanup())
