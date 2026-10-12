# FE-011 — Fase 0: auditoría (corta, sin tocar la UI)

Sesión ORQ-CA «dunita», 12/10/2026. Base: `origin/main` en `23cd31c` (FE-010 mergeado, #22); la rama nació de `7f01b1c` y se rebasó con `git rebase --onto origin/main 7f01b1c`.

Evidencia: `archivo:línea`, un comando corrido o la medición. Lo que no se pudo comprobar va marcado «(sin verificar)».

## 0. Límites de esta Fase 0 (honestos)

| Qué | Estado | Por qué |
| --- | --- | --- |
| `PRODUCT.md` | hecho, **sin entrevista** | Modo piloto automático; lo que falta va como «por confirmar» |
| `DESIGN.md` y `.impeccable/design.json` | hechos desde el código (`tokens.css`, `escala.tokens.css`, `movimiento.tokens.css`, `marca.estilos.css`) | Sin render para muestrear estilos calculados (sin verificar) |
| `critique` por superficie y `audit` /20 | **no se corrieron** | El motor de Impeccable no está descargado (`~/.impeccable` no existe): se trabaja con `reference\*.md` sin lanzador. No hay puntaje /20; la línea base del criterio 8 queda como **rúbrica manual en la Fase F** (se compara antes/después con los mismos criterios) |
| `detect --json src` | **no se corrió** | Mismo motivo |
| Prueba del satélite con imagen real | **bloqueada** | No hay `VITE_ESRI_CLAVE` ni `.env` en el worktree. Lo comprobable sin clave va en la sección 4 |
| Capturas «antes» | pendientes (se toman con Playwright al abrir la Fase A, un script a la vez) | Primero lo barato |

## 1. Línea base medida

| Qué | Valor | Comando |
| --- | --- | --- |
| Tests | 860 de 860 en 103 archivos | `npm test` |
| `lint`, `tipos`, `formato:verificar`, `verificar:colores` | en verde | `npm run …` |
| JS inicial | `index-*.js` 317,20 kB · **101,44 kB gzip** | `npm run build` |
| Tope de la Fase F (criterio 7) | **111,44 kB gzip** (+10 kB) | — |
| Chunks por ruta | VistaMapa 9,19 · VistaCifras 12,39 · VistaExplorar 2,86 · SpriteArbol 1,58 kB gzip | `npm run build` |
| CSS inicial | `index-*.css` 41,83 kB · 8,17 kB gzip | `npm run build` |
| Dependencia nueva | `maplibre-gl` **6.11.2** (24/09/2026, la última estable con más de 2 semanas; 6.12.0 es del 03/10 y 6.14.0 del 11/10) | `npm view maplibre-gl time` |

## 2. Antes | Después | Por qué, por módulo

Solo composición, jerarquía y acabado; la identidad fija no se toca. Las filas son el plan, no un hallazgo ya medido en pantalla (sin verificar hasta las capturas de la Fase A).

### `styles` y `compartido` (sistema)

| Antes | Después | Por qué |
| --- | --- | --- |
| Escala de espacio con saltos irregulares en los nombres (`--espacio-12`, `--espacio-32` junto a 1 a 6) (`escala.tokens.css:7,10`) | Una escala con nombres ordenados y un ritmo vertical por tipo de bloque (sección, grupo, fila) | Un ritmo fijo hace que las 4 rutas se lean como una sola pieza |
| Estados de carga, vacío y error ya compartidos | Se rehacen con un mismo marco, voz que dice qué pasó y cómo seguir, y un vacío que invita a actuar | Idea tomada de Frontend Design: errores útiles y vacíos con salida |
| Tokens de color en `tokens.css` | Sin cambios | Identidad fija |

### `armazon` (cabecera, navegación, pie)

| Antes | Después | Por qué |
| --- | --- | --- |
| Cabecera de una fila con marca, 4 enlaces y tema | Misma estructura, jerarquía más clara de la ruta activa y del tema | Operate: la navegación se reconoce sin leerla |
| Logo «Vivero» **cortado arriba** en la cabecera (punto 10a; `marca.estilos.css:58-62` fija el alto del símbolo con `block-size` y `inline-size: auto`) | `viewBox` que contiene todo el dibujo, caja con el alto del dibujo completo y sin `overflow` que recorte, múltiplos enteros de la grilla a 40 y 32 px, y el favicon | Defecto que vio Cristhian (08:16). **Primero en la Fase A** |
| Pie con nota de datos y crédito de OSM | Suma la atribución de Esri solo cuando la vista satelital está activa | Términos de Esri |

### `inicio` (Persuade contenido)

| Antes | Después | Por qué |
| --- | --- | --- |
| Portada, cifras, destacados y franja de sectores como bloques apilados | El árbol como protagonista en un escenario nuevo; el resto baja de tono | Gastar la audacia en un solo lugar |
| `HorizontePixel` pinta la silueta con el fondo de la sección que sigue y una sombra magenta oscuro (`HorizontePixel.tsx:19-45`); se usa en 3 cortes (`VistaInicio.tsx:61,68,70`) | Un solo tratamiento: silueta rellena con el color de la sección que entra y borde magenta, en los dos sentidos (claro → oscuro y oscuro → claro) y en los 2 temas | Punto 10b: en un corte se ve rellena y en otro solo la línea (causa por confirmar con capturas: el relleno depende de `fondo`, y el color de la sección de arriba no entra en el dibujo) |
| Cifras grandes de Inicio, tarjetas de destacados | Se conservan como contenido; se reordenan | Choque conocido con Impeccable: ver sección 3 |

### `mapa` (Operate) y vista satelital

| Antes | Después | Por qué |
| --- | --- | --- |
| Solo vista ilustrada (SVG desde los polígonos del contrato) | Se conserva como vista accesible por defecto; panel, hoja, leyenda y puntos rehechos | RF-01/RF-09 siguen en «hecho» |
| No hay vista real | Botón «Ilustrado / Satélite», «Teñido» opcional, atribución, chunk aparte (sección 4) | RF-10 |

### `cartilla` (Read)

| Antes | Después | Por qué |
| --- | --- | --- |
| 19 campos con foto, indicadores, CO₂ y cápsulas «?» | Medida de lectura de ~65ch, jerarquía de título, foto, indicadores y datos; «Sin dato» con el mismo peso visual que un dato | Read: se lee de corrido sin perder el dato |
| Cápsulas «?» (hover solo con cursor fino) | Se conservan | Ya cumple |

### `explorar` (Operate) y `cifras` (Operate)

| Antes | Después | Por qué |
| --- | --- | --- |
| Filtros en la URL, contador `aria-live`, vacío con «Limpiar filtros» | Filtros, filas y contador con la jerarquía del sistema nuevo | Coherencia con las otras rutas |
| Tablero con KPIs, mapa de calor, dona, estado, nativas, dispersión, histograma y top 10 (FE-010) | Cifras tabulares, separación clara de campo y ejemplo, y CO₂ | Fase E |

## 3. Choques con identidad (se reportan; no se eliminan solos)

Reglas por defecto de Impeccable que chocan con compromisos de marca. Decisión del orquestador en piloto automático: **se conservan** y se anotan para Cristhian.

| Regla de Impeccable | Dónde choca | Decisión |
| --- | --- | --- |
| Etiquetas en mayúsculas | `--fuente-etiqueta` (Bricolage 600, mayúsculas, 0.08em) y el wordmark «CENSO» | Se conserva |
| Cifras grandes tipo «hero metric» | Cifras de Inicio | Se conserva como contenido real de la API |
| Tarjetas de destacados repetidas | Destacados de Inicio | Se conserva (RF-14) |
| «?» de las cápsulas | Cartilla (RF-17) | Se conserva |
| Estrella de destacado | Mapa y cartilla (RF-14) | Se conserva |

## 4. Prueba del satélite (RF-10)

**Sin clave, no se pudo cargar imagen de Esri.** Resuelto sin ella:

| Punto | Resultado |
| --- | --- |
| Versión de MapLibre | `maplibre-gl@6.11.2`, versión exacta (sin `^`), en su chunk con `import()` al activar «Satélite» |
| Fuente | Esri World Imagery por la fuente raster con URL del servicio nuevo y clave en `VITE_ESRI_CLAVE`; el plugin de Esri **no entra** salvo que la atribución dinámica no alcance (se pregunta antes) |
| Atribución | A mano en la fuente raster, junto al crédito de OSM del pie. Qué texto exacto pide Esri para la capa: **por confirmar** en los términos |
| Encuadre | `fitBounds` con el recuadro calculado desde los polígonos (sin coordenadas escritas a mano) |
| Movimiento reducido | `jumpTo` en lugar de `flyTo` |
| Peso del chunk | Se mide al integrarlo (sin verificar) |
| Sectores calzan | Se comprueba con capturas superpuestas al integrarlo (sin verificar) |

**Falta de Cristhian:** la clave en `.env` del worktree (`VITE_ESRI_CLAVE`) y las URL de referencia `http://localhost:5173`, `:5175` y `:5176` en su credencial (sin `/*`). Sin ella se construye todo el código y los tests (con la fuente simulada) y se verifica "sin clave no hay botón"; la comprobación con imagen real queda abierta.

**`.env.example`:** en este entorno no se puede leer (los permisos lo bloquean). Al documentar las `VITE_` del satélite se corrige también el ejemplo de `VITE_URL_PANEL` de `/admin/` a `/panel-censo/` (autorizado por el asesor, 12/10) y se declara en «Hice fuera de lo pedido». **Si el bloqueo sigue, queda como pendiente a mano de Cristhian.**

### Auditoría del «Teñido» (12/10, a pedido de Cristhian: «no aporta, justifica su existencia»)

| Qué aportaba | Qué costaba | Veredicto |
| --- | --- | --- |
| Armonía con la paleta | Volvía la foto gris: se pierde lo que justifica un satélite (verde de árboles, techos, caminos, el cauce) | El color de la paleta ya lo ponen el contorno, el relleno y el nombre de cada sector |
| Ninguna tarea del visitante lo necesita | Un control más junto a «Ilustrado / Satélite», una preferencia guardada, una capa de mezcla (`mix-blend-mode`) y su CSS, 6 tests | No hay un caso de uso que lo justifique |
| «Se ve de marca» | Contraste de los sectores sobre una foto teñida de magenta: relleno y foto se confundían (visto en el 5175) | Con la foto natural el sector resalta más |

**Decisión: se quita.** Se borraron el botón, el hook de la preferencia, la capa CSS, las constantes y sus tests; un test comprueba que ya no hay botón «Teñido».

### Calles (12/10)
Con la clave actual solo `World_Imagery` responde en el host de claves de Esri; los servicios de calles de Esri (`World_Street_Map`, `World_Basemap_v2`, estilos de Basemap Styles) devolvieron 404 (medido con Playwright, 12/10). Para «Calles» se usan las teselas estándar de OpenStreetMap, sin clave y con su atribución. **Por confirmar con Cristhian:** la política de uso de las teselas públicas de OpenStreetMap permite uso ligero pero no está pensada para tráfico alto; si el sitio crece, conviene un proveedor propio (`VITE_URL_CALLES` ya permite cambiarlo sin tocar código).

## 5. Dirección de composición por superficie (decisiones del orquestador)

| Superficie | Modo | Dirección |
| --- | --- | --- |
| `/` | Persuade contenido | Árbol grande sobre un escenario con profundidad (suelo y horizonte); un solo CTA por objetivo |
| `/mapa` | Operate | El mapa llena la pantalla; panel y hoja son secundarios; leyenda mínima; vista ilustrada por defecto |
| Cartilla | Read | Una columna con medida; foto y título arriba; datos agrupados por tema; CO₂ y «Simulado» como bloque propio |
| `/arboles` | Operate | Filtros fijos arriba, lista densa y escaneable, contador visible |
| `/cifras` | Operate | Tablero con cifras tabulares; campo y ejemplo siempre separados (liso/rayado) |

No hay duda real que justifique 2 opciones por superficie; la dirección se ajusta con las capturas.

## 6. Orden de trabajo acordado (piloto automático)

Satélite en un commit propio → **A** (empieza por el punto 10: logo y horizonte) → B → C ilustrado → D → E → F. Corte duro 13:30; PR listo 14:00.

## 7. Cierre: rúbrica manual antes → después (12/10, sin el motor de Impeccable)

**No es el puntaje /20 del motor:** el motor nunca estuvo descargado, así que esta rúbrica la puso el orquestador a ojo, con las mismas 5 dimensiones de `audit` (0 a 4) y con la evidencia al lado. Cristhian o un segundo revisor la pueden contradecir.

| Dimensión | Antes | Después | Evidencia |
| --- | --- | --- | --- |
| Accesibilidad | 3 | 3 | Mapa real usable con teclado (botones de sectores y de vista con `aria-pressed`), atribución visible; 0 animaciones con «reducir movimiento» en 14 mediciones (7 superficies × 2 anchos). Sin avance real: no se midió contraste con herramienta |
| Rendimiento | 4 | 4 | JS inicial 101,44 → 103,09 kB gzip (tope 111,44); MapLibre (281 kB gzip) en su chunk y su worker aparte, solo al activar Calles o Satélite |
| Tema (claro y oscuro) | 3 | 4 | Paleta sin cambios contra `main` (0 de 179 tokens); horizonte igual en los 3 cortes y 2 temas; el escenario del árbol, el mapa real y los créditos usan solo tokens |
| Responsive | 3 | 4 | A 360 px: botones de vista sin palabras partidas, pie sin separador suelto, sello de ejemplo en su renglón en Explorar; cabecera sin la UPeU debajo de 32rem |
| Anti-patrones | 3 | 3 | Los choques con la identidad (sección 3) se conservaron a propósito |
| **Total** | **16** | **18** | |

## 8. Lo que no se hizo (recorte por hora, decidido por el asesor)

C ilustrado, D (cartilla y Árboles) y E (Cifras) pasan a M2, salvo lo que era trivial y ya estaba en lo tocado (sello de Explorar, pie). Sin `critique` con 2 subagentes ni `detect`: sin motor. Capturas «antes y después» completas: solo se guardaron «antes» de la cabecera, el pie, el favicon y las rutas en oscuro; las de «después» están en `D:\MAN.OGG\capturas-FE-011\finales\`.

Zapatito roto · ORQ-CA · dunita
