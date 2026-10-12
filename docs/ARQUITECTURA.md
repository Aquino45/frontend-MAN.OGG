# Arquitectura del front — Censo arbóreo UPeU Lima

Este archivo manda sobre dónde va cada cosa en este repo (el front). **Antes de crear un archivo, ubícalo aquí.** Si no encaja en ninguna capa, el agente se detiene y pregunta; nunca inventa una carpeta nueva.

## 1. Idea en una línea
SPA React + Vite + TypeScript, **modular por funcionalidad** (cada pantalla o pieza del producto es un módulo en `src/modulos/`) y **en capas dentro de cada módulo: vista → hook → cliente de la API → contrato**. Los datos tienen la forma de `contrato/openapi.yaml` (en el back). Los tipos se generan desde el contrato y nunca se escriben a mano.

## 2. Equivalencias (para quien viene de Spring)
| Idea | Aquí | Archivo |
|---|---|---|
| DTO | tipos **generados** desde el contrato | `src/api/schema.d.ts` (no se edita) |
| Repository / cliente HTTP | cliente de la API: un fetch por ruta, con la URL del entorno | `src/api/cliente.ts` |
| Fuente alternativa (mock) | mocks con la forma exacta del contrato | `src/mocks/` |
| Service | **hook** que pide los datos y maneja carga y error | `src/modulos/<modulo>/hooks/use<Cosa>.ts` |
| Controller + vista | **vista** (pantalla) que arma componentes | `src/modulos/<modulo>/vistas/` |
| Componentes de UI | piezas sin fetch: del módulo, o compartidas si las usan 2 módulos o más | `src/modulos/<modulo>/componentes/` o `src/compartido/` |
| `application.properties` | entorno tipado | `src/config/entorno.ts` |
| Constantes | módulo único | `src/config/constantes.ts` |
| Tema | tokens de diseño | `src/styles/tokens.css` |
| Paquete por funcionalidad (package-by-feature) | **módulo** | `src/modulos/<modulo>/` |
| API pública del paquete | `index.ts` del módulo: lo único que otro módulo puede importar | `src/modulos/<modulo>/index.ts` |

## 3. Árbol
```text
censo-arboreo-frontend/
├── src/
│   ├── main.tsx, App.tsx      ← arranque, rutas y proveedor del tema
│   ├── vite-env.d.ts          ← tipos de Vite
│   ├── config/
│   │   ├── entorno.ts         ← ÚNICO lugar que lee import.meta.env
│   │   └── constantes.ts      ← constantes de negocio (MAYÚSCULAS)
│   ├── styles/
│   │   ├── tokens.css         ← ÚNICO lugar con colores (tema oscuro y claro)
│   │   ├── escala.tokens.css  ← escala tipográfica, espaciado base 4, radios y la sombra única
│   │   ├── movimiento.tokens.css ← duraciones y curvas (con movimiento reducido todo queda en 0)
│   │   ├── botones.estilos.css ← sistema único de botones
│   │   ├── base.estilos.css   ← estilos base de los elementos
│   │   └── global.css
│   ├── api/
│   │   ├── schema.d.ts        ← generado con openapi-typescript (no se edita)
│   │   └── cliente.ts         ← obtenerSectores(), obtenerArbolesDeSector(id), obtenerArbol(codigo)
│   ├── mocks/                 ← datos de los ejemplos del contrato; se eligen con VITE_USAR_MOCKS
│   ├── compartido/            ← lo que usan 2 módulos o más: SelloDemo, SinDato, GlifoPixelArbol, los estados de carga, vacío y error, y los hooks del campus con su caché (`cacheCampus`, `useSectoresDelCampus`, `useArbolesDelCampus`)
│   ├── lib/                   ← funciones puras que usan 2 módulos o más (formatear unidades, elegirVariante)
│   ├── test/                  ← setup.ts de Vitest
│   └── modulos/               ← una carpeta por funcionalidad
│       ├── mapa/              ← mapa ilustrado, hover y selección de sector
│       │   ├── componentes/   ← MapaSectores, PanelSector…
│       │   ├── hooks/         ← useSectores, useArbolesDeSector
│       │   ├── vistas/        ← VistaMapa
│       │   └── index.ts       ← API pública del módulo
│       ├── tema/              ← modo claro/oscuro: useTema + InterruptorTema
│       ├── cartilla/          ← cartilla del árbol: componentes/ (incluye las cápsulas «?» y «Sobre este árbol»), hooks/ (useArbol), lib/, vistas/, index.ts
│       ├── entrada/           ← animación de entrada al mapa, con variantes
│       ├── armazon/           ← cabecera, navegación, pie y página «no encontrada»: lo común a todas las rutas
│       ├── inicio/            ← página de Inicio: portada, mapa compacto de sectores, destacados y cifras del censo
│       ├── explorar/          ← `/arboles`: lista de todos los árboles con buscador y filtros guardados en la URL; componentes/, hooks/, lib/ (filtros), vistas/
│       └── cifras/            ← `/cifras`: cifras del censo por sector, estado y especie y 4 gráficos de CO₂ (almacenado por sector y por especie, captura anual por sector y top 10 de árboles), con campo y ejemplo separados; `lib/cifrasCenso.ts` y `lib/cifrasCo2.ts` son puros
├── public/                    ← estáticos sin import (favicon). Las ilustraciones NO van aquí: se importan desde su módulo
├── scripts/                   ← verificar-colores.mjs, generar-tipos
└── docs/                      ← ARQUITECTURA (este) y requerimientos
```
Cada módulo usa solo las subcarpetas que necesita (`componentes/`, `hooks/`, `vistas/`, `lib/`, `recursos/` para sus imágenes) y siempre tiene `index.ts`. **Módulo nuevo (replicable):** se agrega primero a este árbol, se crea con la misma forma que `modulos/mapa/` y entra a la regla de fronteras de ESLint, que se arma recorriendo `src/modulos/` y no con una lista escrita a mano.

## 4. Reglas de capas
| Capa | Puede usar | No puede |
|---|---|---|
| `modulos/*/vistas/` | hooks y componentes de su módulo, `compartido/`, el `index.ts` de otro módulo | hacer fetch, leer `import.meta.env` |
| `modulos/*/componentes/` y `compartido/` | props, tokens, `lib/` | hacer fetch o llamar hooks de datos (reciben los datos por props) |
| `modulos/*/hooks/` | `api/cliente.ts` | armar URLs, saber si hay mocks |
| `api/cliente.ts` | `config/entorno.ts`, `schema.d.ts`, `mocks/` | guardar estado de UI, importar de `modulos/` |
| `lib/` (raíz o de un módulo) | nada de React | efectos secundarios |

- **Caché del campus:** `compartido/cacheCampus.ts` guarda en memoria la petición de sectores y la de árboles del campus (una sola llamada aunque la pidan Inicio, el pie, Explorar y Cifras). Un error no se guarda, lo guardado vence pasado `TIEMPO_VIDA_CACHE_CAMPUS_MS` y «Reintentar» invalida esa parte y avisa a los hooks montados para que vuelvan a pedir.
- Ningún color, tamaño ni duración escrito a mano: siempre `var(--token)`. Lo vigila `npm run verificar:colores`.
- Un campo sin dato se muestra «Sin dato»; un registro con `demo: true` lleva el sello «Dato de ejemplo».
- Los tests van junto al archivo (`*.test.ts(x)`). Un archivo de más de ~300 líneas se parte.
- **Fronteras entre módulos:** un módulo importa de otro **solo** por su `index.ts`, nunca desde `modulos/<otro>/componentes/…`. `compartido/`, `lib/`, `api/` y `config/` nunca importan de `modulos/`. Lo vigila ESLint con `no-restricted-imports`. Un componente pasa a `compartido/` cuando lo usan 2 módulos, no antes.
- **Variantes de adorno:** las frases de carga, las ilustraciones decorativas del mapa y la animación de entrada eligen su variante con `lib/elegirVariante(pesos, aleatorio)` y una tabla de pesos en `config/constantes.ts` (`PESOS_…`). Cada vista se sortea de nuevo; no hay contadores. Las ilustraciones se importan desde su módulo (`recursos/`, con nombre de archivo neutro y hash de Vite) y toda variante que no sea la estándar se carga con `import()` solo cuando sale. El aleatorio se inyecta, así que los tests no dependen de la suerte.
- **Tema claro y oscuro:** arranca según `prefers-color-scheme` y un interruptor manual lo cambia; la elección se recuerda en el navegador (con `try/catch`, y sin ella la página sigue andando). El tema solo pone un atributo en `<html>`, y `tokens.css` redefine los alias semánticos (`--color-fondo`, `--color-texto`…). Los componentes no saben qué tema hay. El nombre del atributo, los valores de tema y la clave de almacenamiento son constantes de `config/constantes.ts` (por ejemplo `ATRIBUTO_TEMA`, `TEMAS`, `CLAVE_TEMA_GUARDADO`), nunca texto suelto.

## 5. Receta: mostrar un dato nuevo
0. ¿A qué módulo pertenece? Si no encaja en ninguno, se pregunta.
1. ¿Está en el contrato? Si no, primero va un ticket BE de contrato.
2. Se regeneran los tipos (`npm run contrato:tipos`).
3. Función en `api/cliente.ts`, más su mock en `mocks/`.
4. Hook en `modulos/<modulo>/hooks/`, con estado de carga y de error.
5. Componente en `modulos/<modulo>/componentes/` (o en `compartido/` si ya lo usan 2 módulos), que recibe el dato por props, con su test.
6. Se usa desde la vista del módulo. Si otro módulo lo necesita, se exporta en su `index.ts`.

## 6. Seguridad mínima
- Nada secreto en el front: todo lo `VITE_*` es público.
- Las URLs salen de `VITE_API_URL`; ningún `localhost` escrito a mano.
- Nada de `dangerouslySetInnerHTML` con datos de la API.
