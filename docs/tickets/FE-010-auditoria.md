# FE-010 — Fase 0: auditoría (solo lectura)

Sesión ORQ-CA «basanita», 11/10/2026. No se tocó código. Se leyeron completos el ticket, la guía de FE-008, `ARQUITECTURA.md`, `tokens.css`, `escala.tokens.css`, `movimiento.tokens.css`, `global.css`, `base.estilos.css`, `botones.estilos.css` y todos los CSS y las vistas de `armazon`, `entrada`, `inicio`, `mapa`, `cartilla`, `explorar`, `cifras` y `compartido`. El sitio se midió con el dev del worktree con mocks (`:5174`, Chrome instalado, 1440 y 360 px). La sonda vive fuera del repo.

Evidencia: `archivo:línea`, o la medición con su valor. Lo que no se pudo comprobar va marcado «(sin verificar)».

## 0. Lo que ya está bien (se conserva)

- **Movimiento reducido ya apaga todo en CSS** (`styles/base.estilos.css:47-61`): medido con `emulateMedia('reduce')`, `document.getAnimations().length` es **0** en Inicio, Mapa, sector, cartilla, Árboles y Cifras, tanto al cargar como tras mover el cursor y tabular. La base del criterio 4 ya se cumple; el árbol nuevo (WAAPI) es lo que podría romperla, porque el CSS no frena a WAAPI.
- No hay `transition: all`, ni `ease-in`, ni `will-change`, ni `scale(0)` en el CSS de `src/`. La curva `--curva-salida` es `cubic-bezier(0.23, 1, 0.32, 1)`.
- `:active` con escala en botones, filas, tarjetas, enlaces de la cabecera y cápsulas; hover protegido con `(hover: hover) and (pointer: fine)` en todos los `:hover`.
- A 360 px no hay desborde horizontal en ninguna ruta (`scrollWidth` = 360 en las seis medidas).
- Línea base de calidad: `npm test` 620 de 620, `lint`, `tipos`, `formato:verificar` y `verificar:colores` en verde.

## 1. Hallazgos de mayor impacto (resumen)

1. **Choque de clases entre Explorar y el panel del mapa.** Las dos hojas definen `.fila-arbol` y sus partes (`explorar/estilos.css:107` y `mapa/estilos.css:107`, más `__miniatura`, `__nombre`, `__cientifico`, `__destacado`). Con el sitio completo en una sola hoja gana la del mapa: en `/arboles` la fila mide `display: flex`, relleno 8 px y radio 8 px, cuando la hoja de Explorar pide `grid`, 16 px y 16 px (medido en el 5174). En build el orden podría cambiar (sin verificar). Hay que darles nombres propios por módulo.
2. **Hay movimiento donde el teclado lo dispara.** Al tabular entre sectores o puntos, el resaltado anima `opacity` y `transform` (`styles/global.css:85-88`, `mapa/estilos.css:27-47`), y al abrir un sector con Enter entra la hoja del celular. El ticket pide cero movimiento en acciones de teclado.
3. **El mapa se acerca con un `setState` por cuadro.** Al entrar a un sector se cambia el `viewBox` 45 veces en 800 ms y cada cambio vuelve a dibujar el SVG (`mapa/hooks/useRecuadroAnimado.ts:21-52`, medido). Además usa su propia curva ease-out en vez de `--curva-movimiento`, que el token documenta como la del zoom.
4. **La hoja del celular no se puede arrastrar ni tiene salida.** Solo tiene un keyframe de entrada (`mapa/hoja.estilos.css:41-44,82`) y en pantallas anchas el panel aparece de golpe. Es el encargo central de la Fase D.
5. **Entradas apiladas al abrir Inicio.** A los 120 ms de cargar corren a la vez `aparecer-vista` (300 ms, sobre toda la app) y 4 `inicio-aparecer` de 200 ms (medido). Dos de esas cuatro son secciones bajo el pliegue (`CifrasCenso.tsx:28`, `FranjaSectores.tsx:24`) que animan mientras nadie las ve.
6. **Las barras de CO₂ se deforman al crecer.** `scaleX(0)→1` (`cifras/co2.estilos.css:84-97`) aplasta el rayado de los datos de ejemplo mientras crece, parte de cero y dura 400 ms (`constantes.ts:433`). Son 32 animaciones simultáneas y se repiten en cada visita a `/cifras`.
7. **La cartilla repite un escalonado cada vez que se abre un árbol** (`cartilla/indicadores.estilos.css:234-259`, 7 animaciones medidas). Abrir árboles es una acción frecuente: la regla de frecuencia pide quitarlo o reducirlo mucho.
8. **Escalas de movimiento fuera de regla:** `--duracion-media: 300ms` (la entrada estándar y el desvanecido usan 300 ms, no «menos de 300») y `--duracion-zoom: 320ms`; `--escala-presion: 0.96` está huérfano y compite con `--escala-activo: 0.97`.
9. **Faltan `:active` y otros estados en piezas que se presionan:** sectores y puntos del mapa (SVG), sectores del mapa compacto de Inicio, la marca de la cabecera y la casilla de Explorar. El menú del celular abre y cierra sin ninguna transición.
10. **`constantes.ts` ya mide 494 líneas** (el límite del repo es ~300). Agregarle el árbol y el movimiento lo empeora; ver la pregunta 3 al final.

## 2. a) Antes | Después | Por qué, por módulo

El área de cada fila va entre corchetes: [Tipografía] [Ritmo] [Jerarquía] [Estados] [Micro] [Páginas] [Gestos] [Capas] [Rendimiento] [Accesibilidad].

### `styles` (global, botones, tokens)

| Antes | Después | Por qué |
| --- | --- | --- |
| [Micro] `--duracion-media: 300ms`, `--duracion-zoom: 320ms` (`movimiento.tokens.css:5,14`) | `--duracion-media` pasa a 240 ms y el zoom a 280 ms; nada de la UI llega a 300 ms | La UI dura menos de 300 ms; solo el árbol (pieza de presentación) pasa de ahí |
| [Micro] `--escala-presion: 0.96` sin uso y `--escala-activo: 0.97` | Un solo token de presión (`--escala-activo`); `--escala-presion` se retira y el test de tokens se actualiza | Dos tokens para lo mismo invitan a valores sueltos |
| [Accesibilidad] Movimiento reducido solo en CSS (`base.estilos.css:47-61`) | La misma capa, más un hook `usePideMenosMovimiento` (ya existe `CONSULTA_MOVIMIENTO_REDUCIDO`) que los componentes con WAAPI consultan y escuchan | El CSS no frena a WAAPI ni a `requestAnimationFrame`; sin el hook el árbol rompería el criterio 4 |
| [Micro] Los cambios de resaltado animan aunque los dispare el teclado | Una capa global de «modalidad de entrada» (un atributo en `<html>` que pasa a `teclado` con la primera tecla y a `puntero` con el primer puntero) apaga las transiciones de estado en modo teclado | Una sola regla en vez de parches por componente; el teclado no anima |
| [Estados] `:active` solo en `.boton`, filas, tarjetas, enlaces de la cabecera y cápsulas | Se suma a sectores y puntos del mapa, sectores del mapa compacto, la marca y la casilla de Explorar | Todo lo que se presiona confirma la pulsación |
| [Micro] `body` hace fundido de fondo y color en el cambio de tema (`global.css:28-31`) mientras tarjetas y superficies saltan | El cambio de tema pasa por View Transitions cuando hay soporte (fundido de 200 ms de toda la página) y se quita la transición del `body` | Hoy solo el fondo se funde y el resto cambia de golpe |
| [Capas] Una sola sombra (`--sombra-flotante`); `drop-shadow` fijo en el sector activo | Se conserva; no se anima ninguna sombra | Ya cumple |
| [Tipografía] Escala `--texto-*` con razón ~1.25, mínimo 0.75 rem solo en mayúsculas | Se conserva; se revisa a 360 px que ningún texto corrido baje de 0.875 rem | Ya cumple la guía de FE-008 |

### `armazon` (cabecera, pie, no encontrada)

| Antes | Después | Por qué |
| --- | --- | --- |
| [Micro] Menú del celular: `display: none` ↔ visible, sin transición (`armazon/estilos.css:121-123`) | Abre con opacidad y `translateY(-4px)` en 160 ms (ease-out) usando `@starting-style`; cierra en 100 ms. El contenido se sigue empujando (el diseño no cambia) | Lo que aparece sin transición se siente roto; la salida va más rápida que la entrada |
| [Micro] Abrir con Enter o Esc animaría igual | Con la capa de teclado no anima | Nada animado en acciones de teclado |
| [Estados] La marca (enlace al Inicio) sin `:active` | `:active` con escala 0.97 | Confirma la pulsación |
| [Páginas] El cambio de ruta es un corte seco | Transición de página con View Transitions (Fase C) | Evita el salto y da continuidad |
| [Accesibilidad] Esc cierra el menú y devuelve el foco (ya) | Se conserva y se cubre con test del menú animado | No se debe perder al agregar movimiento |
| [Ritmo] Cabecera de 76 px fija en una fila | Se conserva | Ya cumple |

### `entrada`

| Antes | Después | Por qué |
| --- | --- | --- |
| [Micro] `aparecer-vista`: escala 0.98 de **toda la app** en 300 ms (`entrada/estilos.css:4-12`) | Fundido de opacidad de 200 ms, sin escala | Escalar la página entera mueve la cabecera y crea un bloque contenedor para lo `fixed` mientras dura |
| [Micro] Desvanecido de la alterna en 300 ms (`:38-45`, `DURACION_SALIDA_ENTRADA_MS = 300`) | 200 ms | Las salidas son más rápidas que las entradas |
| [Rendimiento] `max-block-size: 80vh` (`:31`) | `80dvh` | En el celular `vh` ignora la barra del navegador |
| [Páginas] Nadie sabe cuándo termina la entrada | `modulos/entrada` expone `useEntradaTerminada()` por su `index.ts` | El árbol de Inicio debe arrancar cuando termina la entrada, sin competir con ella |

### `inicio`

| Antes | Después | Por qué |
| --- | --- | --- |
| [Micro] `GlifoPixelArbol` fijo en la portada (`Portada.tsx:52`) con `inicio-aparece--tarde` | `ArbolAnimado` nuevo (ver c); el glifo fijo queda para fotos pendientes y miniaturas | Es el encargo de la Fase B |
| [Rendimiento] `inicio-aparece` en secciones bajo el pliegue anima al cargar (`CifrasCenso.tsx:28`, `FranjaSectores.tsx:24`) | Entran cuando se acercan a la pantalla (`IntersectionObserver`, una sola vez) | Hoy se animan sin que nadie las vea |
| [Micro] La entrada de Inicio y `aparecer-vista` coinciden al abrir el sitio | `inicio-aparece` solo al llegar por navegación; al abrir el sitio manda la entrada | Dos entradas juntas se estorban |
| [Estados] Las tarjetas destacadas, los sectores del mapa compacto y el enlace «Ver destacados» ya tienen esqueleto, error y hover | Se conservan; el mapa compacto suma `:active` y deja de animar `stroke-width` (propiedad de pintura) | Solo `transform` y `opacity` |
| [Jerarquía] Un CTA por objetivo (ya) | Se conserva | Ya cumple |
| [Ritmo] Franjas con `--espacio-6` arriba y abajo | Se conserva; se revisa el aire sobre el h1 de la portada a 360 px | Ya cumple, se verifica en la Fase A |

### `mapa`

| Antes | Después | Por qué |
| --- | --- | --- |
| [Micro] Zoom: un `setState` por cuadro y ease-out propio (`useRecuadroAnimado.ts`) | El hook escribe el `viewBox` y `--escala-zoom` directo en el elemento (sin volver a dibujar con React), con `--curva-movimiento` y 280 ms | 45 renders en 800 ms (medido); es movimiento en pantalla, va con ease-in-out |
| [Estados] `.sector` anima `opacity` y `transform` también al tabular (`global.css:85-88`) | Con el puntero, igual; con el teclado, el cambio es inmediato | Nada animado con el teclado |
| [Estados] `.punto-arbol--resaltado` y `:focus-visible` crecen a 1.45 con transición (`mapa/estilos.css:27-47`) | Crece con puntero; con foco por teclado cambia de golpe y mantiene su trazo de foco | Idem |
| [Estados] Sin `:active` en sectores ni puntos | `:active` con escala 0.97 en el punto; en el sector, atenuación breve | Confirma la pulsación; en SVG el origen es el propio elemento (`transform-box: fill-box`) |
| [Gestos] Hoja del celular: keyframe `translateY(100%)` de 240 ms, sin arrastre ni salida (`hoja.estilos.css:41-44,82`) | Hoja arrastrable con pointer events y captura: cierra con velocidad > 0.11 px/ms o por distancia, con amortiguación en los bordes y protección contra el multitáctil; la salida dura 160 ms | Es el patrón de hoja que el ticket pide; si se complica, pregunto antes de proponer `motion` |
| [Páginas] Panel lateral (≥ 56rem) aparece sin animación | Entra con opacidad y `translateX(8px)` en 200 ms, solo con puntero | Aparecer de golpe se siente roto |
| [Estados] `PanelSector` se vuelve a montar al volver de la cartilla | Se mantiene montado cuando se puede, para no repetir entradas | Menos movimiento repetido |
| [Capas] Hoja `fixed` a `z-index: 2`, cabecera a `3` | Se conserva | Ya cumple |
| [Accesibilidad] Esc cierra la cartilla y luego el sector; el foco vuelve al origen (`useRetornoDeFoco`) | Se conserva y se cubre con tests del gesto | No se debe perder |

### `cartilla`

| Antes | Después | Por qué |
| --- | --- | --- |
| [Micro] `.cartilla > *` entra con escalonado de 40 ms cada vez que se abre un árbol (`indicadores.estilos.css:234-259`) | Un solo fundido de 150 ms de toda la cartilla, sin escalonado; con teclado no anima | Abrir árboles es frecuente; el escalonado se reserva a primeras cargas |
| [Micro] Cápsulas: burbuja con escala 0.98 desde el botón (200 ms entra, 150 ms sale) | Se conserva. Si hay otra cápsula abierta y se pasa a la vecina, la nueva entra sin animación | Los popovers salen de su disparador; la segunda es instantánea |
| [Estados] Foto: fundido de opacidad 200 ms al cargar (`estilos.css:78`) | Se conserva | Previene el salto de la imagen |
| [Jerarquía] Bloque de CO₂ y «Simulado» como en FE-009 | Se conserva | Ya cumple |
| [Accesibilidad] Foco programático al título sin anillo (`base.estilos.css:23-32`) | Se conserva | Ya cumple |

### `explorar`

| Antes | Después | Por qué |
| --- | --- | --- |
| [Capas] `.fila-arbol` choca con el panel del mapa | Nombres propios por módulo (`explorar-fila…`, `panel-fila…`) y sus tests de CSS al día | Hoy la fila de Explorar se ve con el estilo del panel (medido) |
| [Micro] La lista aparece de golpe | Escalonado corto (40 ms, 5 pasos como máximo, 200 ms) solo en la primera carga; al filtrar no anima | El escalonado no puede estorbar a quien filtra |
| [Estados] Carga con esqueleto, vacío con «Limpiar filtros», error con «Reintentar» | Se conservan; el paso esqueleto → lista es un fundido de 150 ms | Evita el salto |
| [Estados] Casilla de «destacados» sin `:active` | Escala 0.97 sobre el control | Confirma la pulsación |
| [Ritmo] Filtros en rejilla `auto-fit` con 12 rem | Se conserva; se revisa a 360 px | Ya cumple |
| [Accesibilidad] El contador es `aria-live="polite"` | Se conserva | Ya cumple |

### `cifras`

| Antes | Después | Por qué |
| --- | --- | --- |
| [Micro] Barras de CO₂: `scaleX(0)→1`, 400 ms, 32 a la vez, en cada visita (`co2.estilos.css:84-97`) | Se revelan con `clip-path: inset(0 100% 0 0)→inset(0)` en 360 ms, con escalonado de 30 ms por fila y una sola vez por carga de la página, cuando entran en pantalla | El rayado del ejemplo no se aplasta; empieza desde la base; no se repite |
| [Micro] Los otros gráficos y tarjetas aparecen sin movimiento | Se mantienen quietos; solo los gráficos de CO₂ crecen | El resto es lectura, no presentación |
| [Estados] Carga, vacío y error con `compartido` | Fundido de 150 ms entre estados | Evita el salto |
| [Accesibilidad] Tabla bajo cada gráfico con región enfocable | Se conserva | Ya cumple |
| [Ritmo] `DURACION_ENTRADA_GRAFICOS_MS = 400` | 360 ms (token compartido de gráficos) | Cercano al límite de la UI, pero es presentación de datos |

### `compartido` (estados, glifo, sellos)

| Antes | Después | Por qué |
| --- | --- | --- |
| [Estados] `EstadoCarga` es un esqueleto estático | Se conserva sin brillo animado | Menos movimiento en lo que se ve a cada rato |
| [Estados] Cambio carga → contenido sin transición | Cada vista envuelve su contenido en un fundido corto (`FundidoEstado`, nuevo en `compartido`) | Una sola pieza para las cuatro vistas |
| [Micro] `GlifoPixelArbol` fijo | Se conserva sin cambios (fotos que faltan y miniaturas) | Lo pide el ticket |

## 3. b) Inventario del movimiento

Frecuencia: **A** = decenas por día o más, **O** = ocasional, **R** = rara o de primera vez. Curvas: SAL = `--curva-salida`, MOV = `--curva-movimiento`, HOJ = `--curva-hoja`, H = `ease`.

| # | Qué | Dónde | Frec. | Propósito | Curva | Hoy | Decisión |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Entrada estándar (escala 0.98) | `entrada/estilos.css:12` | R | Evitar un corte al abrir el sitio | SAL | 300 ms | Cambia: solo opacidad, 200 ms |
| 2 | Entrada alterna (pantalla completa y desvanecido) | `entrada/estilos.css:44` | R | Presentación | SAL | 3000 + 300 ms | Conserva, desvanecido a 200 ms |
| 3 | Aparición de secciones de Inicio | `inicio/estilos.css:20` | O | Que no aparezcan de golpe | SAL | 200 ms | Cambia: solo por navegación y al entrar en pantalla |
| 4 | Fondo y color del `body` | `global.css:28` | O (tema) | — | H | 160 ms | Quita; el tema pasa a View Transitions |
| 5 | Sector: opacidad y elevación | `global.css:85` | A | Qué sector está activo | SAL | 200 ms | Conserva con puntero; **quita con teclado** |
| 6 | Relleno y trazo del sector | `global.css:108` | A | Estado | H | 160 ms | Conserva con puntero; quita con teclado |
| 7 | Zoom del mapa | `useRecuadroAnimado.ts` | O | Continuidad espacial | cúbica propia | 320 ms | Cambia: MOV, 280 ms, sin `setState` por cuadro |
| 8 | Punto del árbol crece al resaltar | `mapa/estilos.css:27` | A | Estado | SAL | 160 ms | Conserva con puntero; **quita con teclado** |
| 9 | Fila de árbol: `:active` y borde | `mapa/estilos.css:122` | A | Retroalimentación | SAL / H | 120 / 160 ms | Conserva |
| 10 | Hoja del celular (entrada) | `hoja.estilos.css:82` | O | Continuidad espacial | HOJ | 240 ms | Cambia: arrastrable, salida 160 ms, sin animar con teclado |
| 11 | Panel lateral | — | O | — | — | ninguna | Agrega: 200 ms, solo con puntero |
| 12 | Bloques de la cartilla | `indicadores.estilos.css:242` | A | Entrada | SAL | 200 ms + 4×40 | **Quita el escalonado**; fundido de 150 ms |
| 13 | Cápsulas «?» (burbuja) | `capsulas.estilos.css:106,117` | A | Origen en el disparador | SAL | 200 / 150 ms | Conserva; la segunda seguida, instantánea |
| 14 | Cápsulas «?» (botón) | `capsulas.estilos.css:29` | A | Retroalimentación | SAL / H | 120 / 160 ms | Conserva |
| 15 | Foto de la cartilla | `cartilla/estilos.css:78` | A | Evitar el salto | SAL | 200 ms | Conserva |
| 16 | Barras de CO₂ | `cifras/co2.estilos.css:97` | R (por carga) | Explicación de datos | MOV | 400 ms | Cambia: `clip-path`, 360 ms, una vez, en pantalla |
| 17 | Botones: `:active` y hover | `botones.estilos.css:32` | A | Retroalimentación | SAL / H | 120 / 160 ms | Conserva |
| 18 | Cabecera: enlaces | `armazon/estilos.css:89` | A | Retroalimentación | SAL / H | 120 / 160 ms | Conserva |
| 19 | Tarjeta destacada | `inicio/destacados.estilos.css:54` | A | Retroalimentación | SAL / H | 120 / 160 ms | Conserva |
| 20 | Mapa compacto: grosor del borde | `inicio/mapa.estilos.css:21` | A | Estado | H | 160 ms | Cambia: sin animar `stroke-width` |
| 21 | Control de Explorar | `explorar/estilos.css:62` | A | Estado | H | 160 ms | Conserva |
| 22 | Menú del celular | `armazon/estilos.css:121` | A | — | — | ninguna | Agrega: 160 ms entra, 100 ms sale |
| 23 | Cambio de ruta | `App.tsx` | A | Continuidad | — | corte seco | Agrega: View Transitions, 200 ms (Fase C) |
| 24 | Árbol de Inicio | `inicio` (nuevo) | R | Identidad | ver c | — | Agrega, pieza de presentación |
| 25 | Estados carga → contenido | `compartido`, vistas | A | Evitar el salto | SAL | ninguna | Agrega fundido de 150 ms |

**Lo que se quita:** el escalonado de la cartilla (12), la transición del `body` (4), la animación de `stroke-width` del mapa compacto (20), el movimiento de todo lo que dispara el teclado (5, 6, 8 y 10 con teclado) y el `scaleX` de las barras (16, que se cambia por un `clip-path`).

**Se anima solo `transform`, `opacity` y `clip-path`.** Los dos casos hoy fuera de esa lista son el relleno y el trazo del sector (color, 160 ms, con puntero) y el `stroke-width` del mapa compacto, que se quita. El `filter: drop-shadow` del sector activo es fijo y no se anima (`global.css:97`).

## 4. c) El árbol de Inicio: dos guiones

**Base común.** Componente nuevo `ArbolAnimado` en `modulos/inicio/componentes/`, `aria-hidden`, en una rejilla SVG de **24 × 24** que conserva la silueta del glifo de 12 × 12 (cada pixel actual son 2 × 2 celdas y se le agrega detalle fino). Colores: los mismos tokens de `glifo-pixel` (copa alta, media y baja, y tronco). La rejilla es dato del módulo (`inicio/lib/rejillaArbol.ts`), no código de la animación. `shape-rendering: crispEdges`. Solo `transform`, `opacity` y `clip-path`; sin `will-change` permanente (se pone solo mientras una animación corre).

**Reglas comunes de vida.**
- **Arranque:** cuando `useEntradaTerminada()` pasa a verdadero, más 120 ms. En navegación normal (sin entrada) arranca al montarse.
- **Pausa:** `visibilitychange` (pestaña oculta) e `IntersectionObserver` (fuera de pantalla) pausan los `Animation` de WAAPI con `pause()` y detienen el bucle de `requestAnimationFrame`; al volver reanudan.
- **Movimiento reducido:** el árbol se dibuja completo y quieto, no se crea ninguna animación; se re-evalúa si el sistema cambia la preferencia mientras la página está abierta. Test unitario del componente.
- **Respuesta (solo con `(hover: hover) and (pointer: fine)`):** la copa se inclina hacia el puntero; el valor objetivo lo da la posición, el valor mostrado se interpola con `requestAnimationFrame` (factor 0.12 por cuadro) y se escribe solo como `transform`. Al presionar, una sacudida corta. En táctil, el toque dispara solo la sacudida.

### Guion A — «Brote por franjas» (sobrio)

Pensado para que se lea como un árbol que crece y respira. Total de crecimiento: **1,2 s**.

| Tiempo | Qué pasa |
| --- | --- |
| 0 ms | Todo en `opacity: 0`; solo el suelo (base del tronco, 2 × 2 celdas) aparece en 120 ms |
| 0–360 ms | **Tronco** sube: `clip-path: inset(100% 0 0 0)→inset(0)`, ease-out (`--curva-salida`) |
| 300 ms | **Copa** empieza: 5 franjas de la más baja a la más alta (escalonado 70 ms) |
| 300–580 ms | Franja 1 (copa baja angosta): `opacity 0→1`, `translateY(+1 celda)→0` y `clip-path: inset(0 50% 0 50%)→inset(0)` (se abre desde el centro) |
| 370–650 ms | Franja 2 (copa baja ancha), igual |
| 440–720 ms | Franja 3 (copa media), igual |
| 510–790 ms | Franja 4 (copa alta ancha), igual |
| 580–860 ms | Franja 5 (punta de la copa), igual |
| 860–1060 ms | Asentamiento: todo el árbol `scale(1)→1.02→1` desde la base, 200 ms |
| 1200 ms | Termina el crecimiento; pasa al reposo |
| Reposo | **Mecido:** cada franja de la copa oscila `translateX` entre −0,5 y +0,5 celda (la punta hasta ±1), ease-in-out, ciclo de 5 s, con 80 ms de desfase entre franjas |
| Detalle | **Hojas que caen:** cada 7 a 11 s (sorteo con `elegirVariante`) se desprende 1 pixel (2 × 2 celdas) de copa magenta; cae hasta el suelo con `translateY` lineal de 2,2 s y un vaivén de ±1 celda, y se desvanece en el último 30 %. Máximo 2 a la vez |
| Respuesta | Con puntero fino: la copa se inclina hasta ±2° y ±1 celda hacia el cursor, suavizada. Al presionar: sacudida de 240 ms (3 oscilaciones de ±1 celda que decaen, ease-out) y se desprenden 2 hojas |

### Guion B — «Pixel a pixel» (más vistoso)

El árbol se arma como pixel art que se dibuja a sí mismo y tiene más vida en reposo. Total de crecimiento: **1,5 s**.

| Tiempo | Qué pasa |
| --- | --- |
| 0–120 ms | Aparece la semilla: 1 pixel (2 × 2 celdas) de tronco en la base, con un latido `scale(0.9)→1` |
| 120–520 ms | **Tronco** sube de a 2 celdas con `steps(4, end)` (cada paso es un pixel), 100 ms por paso |
| 480–1380 ms | **Copa por filas:** 16 filas, de abajo hacia arriba, cada una entra con `clip-path: inset(0 50% 0 50%)→inset(0)` (de adentro hacia los lados) en 160 ms, escalonado de 50 ms (primera fila a 480 ms, última a 1230 ms) |
| 1380–1500 ms | Destello de acabado: una franja de `--texto-lectura` al 35 % de opacidad recorre la copa de izquierda a derecha, recortada a la silueta (`clip-path`), 120 ms |
| 1500 ms | Termina el crecimiento |
| Reposo | **Respiración:** la copa completa `scale(1)↔1.025` desde la base, ease-in-out, ciclo de 4 s; sobre ella, el mecido de ±1 celda con desfase por franja, ciclo de 6 s |
| Detalle | **Barrido de luz:** cada ~10 s, la misma franja del destello recorre la copa en 900 ms (ease-in-out). Además, cada 5 a 8 s parpadea un pixel de copa alta (carmín ↔ magenta), 600 ms |
| Respuesta | Con puntero fino: la copa se inclina hacia el cursor (igual que A) y la respiración se acelera un 30 % mientras el cursor está encima. Al presionar: ráfaga de 5 hojas que se desprenden en abanico y la copa hace un rebote de 200 ms |

**Recomendación:** A. Es más fácil de mantener (menos elementos animados a la vez: 5 franjas + 2 hojas en vez de 16 filas + destellos), deja más margen para los 55 fps con el resto de la página y se parece más a la identidad sobria de FE-008. B luce más pero cuesta más rendimiento y se acerca al máximo de 1,6 s. Decide Cristhian.

## 5. d) Tokens

Colores: **ninguno** (no se cambia ni se propone ningún valor de `tokens.css`).

Los tokens nuevos van en `movimiento.tokens.css` y `escala.tokens.css` (sin color). `tokens.css` queda como está: mide 278 líneas y un test limita cada archivo de tokens a 300.

| Token | Valor | Archivo | Para qué |
| --- | --- | --- | --- |
| `--duracion-media` (ajuste) | 240 ms (hoy 300) | movimiento | Entrada estándar y desvanecido |
| `--duracion-zoom` (ajuste) | 280 ms (hoy 320) | movimiento | Zoom del mapa |
| `--duracion-menu` | 160 ms | movimiento | Menú del celular (entrada); la salida usa `--duracion-salida` (150 ms) |
| `--duracion-fundido` | 150 ms | movimiento | Cartilla y estados carga → contenido |
| `--duracion-pagina` | 200 ms | movimiento | Cambio de ruta y de tema |
| `--duracion-grafico` | 360 ms | movimiento | Barras de CO₂ |
| `--retraso-escalonado` | 40 ms, ya existe | tokens (sin tocar) | Se reutiliza; Cifras usa 30 ms con una variable local |
| `--curva-hoja` | ya existe | — | Hoja del celular |
| `--velocidad-cierre-hoja` | 0.11 (px/ms) | movimiento | Cierre por velocidad |
| `--distancia-cierre-hoja` | 25 % del alto | movimiento | Cierre por distancia |
| `--arbol-celda` | derivado de `--glifo-portada / 24` | escala | Una celda de la rejilla (tamaños del árbol y de las amplitudes) |
| `--arbol-ciclo-meceo` | 5 s (A) o 6 s (B) | movimiento | Ciclo del mecido |
| `--arbol-duracion-crecimiento` | 1,2 s (A) o 1,5 s (B) | movimiento | Crecimiento (pieza de presentación) |
| `--escala-presion` | se retira | movimiento | Duplicaba `--escala-activo` |

Las constantes del árbol que no son de estilo (cada cuántos segundos cae una hoja, cuántas a la vez, el factor de suavizado del puntero) van en `config/constantes.ts`; ver la pregunta 3.

## 6. e) Fases, archivos y riesgos

Cada fase: tests primero, un commit `[FE-010] Fase X: …`, una QA corta (`qa-revisor`, contexto limpio) y el «Avance» del ticket. Los archivos son los esperados; la auditoría ya los ordena de forma que lo transversal va primero.

| Fase | Contenido | Archivos | Riesgos |
| --- | --- | --- | --- |
| **A — Fundamentos** | Tokens de movimiento; hook de movimiento reducido; capa de modalidad de entrada (teclado/puntero); `:active` faltantes; renombrar las clases de `.fila-arbol`; escala tipográfica y espacios; test estático de los CSS (sin `transition: all`, sin `ease-in` suelto, sin `scale(0)`) | `styles/*`, `config/constantes.ts`, `compartido/*`, `mapa/estilos.css`, `explorar/estilos.css` y sus tests, `lib/` | Renombrar clases rompe tests que leen el CSS; se actualizan junto con el cambio. El test estático debe tratar `steps()` y `ease-in-out` sin falsos positivos |
| **B — Inicio** | `ArbolAnimado`, `rejillaArbol`, `useEntradaTerminada`, aparición por pantalla, pausa y reducido; portada y secciones | `inicio/*`, `entrada/*` (solo `index.ts`, hook y `estilos.css`) | Mantener ≥ 55 fps con el árbol a 1440; no romper `getAnimations() = 0` con reducido |
| **C — Navegación** | View Transitions con `viewTransition` de React Router (8.4.0) y degradación sin animación; cambio de tema; menú del celular con `@starting-style`; foco y cabecera | `App.tsx`, `armazon/*`, `tema/*`, `styles/*`, `index.html` solo si hiciera falta (preguntando) | **Riesgo mayor:** `viewTransition` está documentado para los routers de datos y la app usa `BrowserRouter` declarativo (sin verificar). Se hace un spike primero; si exige `createBrowserRouter`, se cambia `App.tsx` (permitido) |
| **D — Mapa y cartilla** | Resaltado solo con puntero; zoom sin `setState` por cuadro; panel lateral; **hoja arrastrable**; cartilla sin escalonado; cápsulas (instantánea entre vecinas) | `mapa/*`, `cartilla/*` | **Riesgo mayor:** la hoja con captura de puntero, velocidad y amortiguación. Si se complica, me detengo y pregunto antes de proponer `motion` (solo para la hoja) |
| **E — Explorar y Cifras** | Lista con escalonado solo en la primera carga; barras de CO₂ con `clip-path`, una vez y en pantalla; fundidos entre estados | `explorar/*`, `cifras/*`, `compartido/*` | «Primera carga» se define por una marca en memoria por carga de la página; hay que probar que filtrar no reanima |
| **F — Cierre** | QA de rendimiento y accesibilidad, script de paleta contra `main`, tamaño del build, capturas (360 y 1440, claro y oscuro, contra la API real), videos | `docs/*` y, si hace falta, ajustes | Para capturar contra la API real hay que bajar y volver a subir el dev de `main` (5173), solo con tu OK; al final se comprueba que responde 200 |

Cada fase puede reordenarse si se prefiere: por ejemplo, B antes de A no es viable porque el árbol necesita los tokens y el hook de movimiento reducido.

## 7. f) Línea base

**Build (`npm run build`, antes de cualquier cambio):**

| Archivo | Bruto | Gzip |
| --- | --- | --- |
| `index-*.js` | 341,74 kB | 104,34 kB (Vite) |
| `index-*.css` | 63,79 kB | 10,58 kB (Vite) |
| `EntradaAlterna-*.css` | 7,53 kB | 5,43 kB |
| `EntradaAlterna-*.js` | 0,79 kB | 0,47 kB |
| `mocks-*.js` | 16,45 kB | 4,37 kB |

El presupuesto del criterio 6 es que el **JS con gzip suba a lo sumo 10 kB** (de 104,34 a 114,34 kB). La comparación se hace con el mismo comando antes y después.

**Rendimiento — cómo se va a medir:**
- **Fps del árbol:** Playwright con el Chrome instalado, 1440 × 900, dejando pasar la entrada, y `requestAnimationFrame` durante 5 s; se reporta la mediana del intervalo entre cuadros y los percentiles 5 y 95. Umbral: mediana ≥ 55 fps. Base sin árbol, medida hoy en Inicio: 827 cuadros en 5 s, mediana de 6,1 ms (≈ 164 fps, Chrome sin límite de cuadros). Como el umbral exige 55, se repite también con la CPU ralentizada 4× por el protocolo de DevTools, para comprobar el margen en una máquina floja.
- **Pausa:** simular `visibilitychange` oculto y comprobar que no hay animaciones corriendo ni cuadros del bucle del árbol.
- **Movimiento reducido:** `emulateMedia({ reducedMotion: 'reduce' })` y `document.getAnimations().length === 0` en Inicio, Mapa, Árboles, Cifras y con la cartilla abierta, tras interactuar. Base hoy: 0 en todas.
- **Zoom del mapa:** número de cambios de `viewBox` y de renders de React durante la entrada a un sector. Base: 45 cambios en 800 ms.
- **Paleta:** un script compara los valores de color de `tokens.css` contra `main`; la salida va en el PR.

## 8. Preguntas para Cristhian (antes del OK)

1. **¿A o B para el árbol?** (recomiendo A).
2. **Choque `.fila-arbol`:** al renombrar las clases de Explorar y del panel cambia el aspecto de las filas de Explorar (hoy se ven con el estilo del panel por el choque). ¿Quieres que queden con el estilo que escribió la hoja de Explorar (rejilla, 16 px)? (recomiendo que sí: es lo que dice su CSS).
3. **`config/constantes.ts` mide 494 líneas.** Propongo no agregarle más que unas pocas constantes y poner la rejilla del árbol en `inicio/lib/rejillaArbol.ts`; partir `constantes.ts` en varios archivos sería otro ticket. ¿De acuerdo?
4. **View Transitions:** si `viewTransition` exige cambiar `BrowserRouter` por un router de datos, ¿lo hago dentro de la Fase C? (la ruta y los tests de `App` cambian de forma).
5. **Cartilla sin escalonado:** quito el escalonado de bloques de la cartilla (solo queda un fundido de 150 ms). ¿Te parece bien, o prefieres conservarlo al abrir el primer árbol?

Estado: **a la espera del OK.** No se toca código antes.

Zapatito roto · ORQ-CA · basanita
