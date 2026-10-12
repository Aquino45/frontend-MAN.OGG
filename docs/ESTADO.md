# ESTADO — frontend-MAN.OGG

Actualizado: 11/10/2026 (ticket DOC-003, en revisión).

## Dónde estamos
- **Rutas** con `react-router`: `/` Inicio, `/mapa` el mapa y la cartilla (con `?sector=&arbol=`), `/arboles` Explorar, `/cifras` Cifras y una página «no encontrada» para lo demás. Los enlaces viejos `/?sector=…` o `/?arbol=…` redirigen a `/mapa` con la misma consulta. Una sola cabecera (marca, Inicio · Mapa · Árboles · Cifras, con «Menú» en celular, y el tema) y un pie con la nota de los datos —calculada con la API, sin afirmar nada mientras carga o si falla— y el crédito de OpenStreetMap (ODbL).
- **Página de Inicio:** portada, franja con el mapa compacto de los 5 sectores (cada uno enlaza a `/mapa?sector=<id>`, con su conteo de campo o de ejemplo), los árboles destacados (tarjetas que abren su árbol en `/mapa`) y las cifras del censo calculadas desde la API (árboles de campo, sectores, especies identificadas y árboles de ejemplo). Cada bloque tiene su esqueleto de carga y su error con «Reintentar». La entrada animada sale solo al abrir el sitio en Inicio.
- **Explorar (`/arboles`):** lista de todos los árboles del campus con buscador por código, nombre común y científico, y filtros por sector, estado general, destacado y origen del dato (campo o ejemplo), guardados en la URL; contador de resultados y vacío con «Limpiar filtros». Cada árbol abre `/mapa?sector=…&arbol=…`.
- **Cifras (`/cifras`):** árboles por sector, por estado general, por especie (las más frecuentes y «Otras») y destacados por sector, con los datos de campo y los de ejemplo siempre separados, barras en CSS y una tabla accesible debajo de cada gráfico. No suma CO₂.
- **Cápsulas «?» y «Sobre este árbol»:** en la cartilla, un botón «?» junto a cada dato con ayuda abre una burbuja con el texto de la API (hover solo con cursor fino; clic, toque, Esc, clic fuera o foco que se va la cierran; una a la vez). La sección «Sobre este árbol» explica el estado, el motivo si es destacado y la ficha de la especie si viene; si no hay nada que decir, no sale. Tipos del contrato 0.4.0; la API real aún no publica cápsulas ni fichas, y con ella la cartilla queda sin botones ni sección.
- **Sistema de diseño:** escala tipográfica, espaciado base 4, radios, una sola sombra, duraciones y curvas en tokens; botones y estados de carga, vacío y error compartidos; 360 px sin cortes; con movimiento reducido no hay animaciones.
- **Caché del campus:** sectores y árboles se piden una vez para todo el sitio, vencen a los 5 minutos y «Reintentar» recarga también el pie.
- **Tipografía:** las etiquetas usan `--fuente-etiqueta` (Bricolage 600, mayúsculas y espaciado).
- El front muestra el **mapa ilustrado de los 5 sectores**, dibujado desde los polígonos del contrato: hover, teclado y toque resaltan un sector y atenúan los demás; click o Enter **entran** al sector (el mapa se acerca, los demás quedan atenuados) y abren su panel con la lista de árboles, que también se dibujan como puntos en su posición real. Los límites provisionales van punteados.
- **Cartilla del árbol** con los 19 campos (foto, indicadores de altura, copa y DAP, CO₂ y estados), con el sello «Dato de ejemplo» en los demo y «Sin dato» donde falta un valor. El sector y el árbol abiertos viven en la URL (`?sector=<id>&arbol=<codigo>`), y «atrás» y `Esc` los cierran.
- Con mocks solo el sector 1 trae árboles (S01-A001 y S01-A012 tienen cartilla; A002 y A015 dicen «No encontramos el árbol»). El nombre público es «Censo arbóreo UPeU Lima».
- **Tema claro y oscuro:** arranca según el sistema y el interruptor lo recuerda en el navegador.
- **Variantes de adorno:** `lib/elegirVariante` con tablas de pesos (frases de carga y glifos decorativos).
- Tipos generados del contrato (`npm run contrato:tipos`), cliente de la API con mocks (`VITE_USAR_MOCKS`) y regla de ESLint de fronteras entre módulos.
- Hito M0 (disciplina) en curso.

## Último ticket
- DOC-003 — docs públicas neutras y marcas de exportación para la entrega limpia (Issue #15): `export-ignore` de los archivos del proceso, `docs/requerimientos.md` v0.3 literal, README con enlaces solo a lo que se exporta y `.codex/` en `.gitignore`. Resumen en `docs/tickets/DOC-003.md`.
- FE-008 — remake del front v1 (Issue #13, PR #14 en borrador): sistema de diseño, Inicio completo, cápsulas «?» y «Sobre este árbol», Explorar y Cifras. Resumen en `docs/tickets/FE-008.md`.
- FE-006 — árboles destacados (Issue #11): estrella en el mapa (más grande y por encima), orden y leyenda en el panel del sector, texto accesible con el motivo e insignia en la cartilla. Resumen en `docs/tickets/FE-006.md`.
- FE-007 — rutas y página de Inicio (Issue #9). Resumen en `docs/tickets/FE-007.md`.
- FE-005 — front v1 completo, por fases. **Fases A, B y C hechas** (PR #8 en borrador, Issue #7): recorrido mapa → sector → árbol con mocks, panel con la lista, cartilla de 19 campos, tokens y fuentes, estado en la URL y nombre público «Censo arbóreo UPeU Lima». La fase B verificó el recorrido con la API real, el celular y la accesibilidad. La fase C suma la entrada al mapa con 2 variantes que se sortean en cada carga. Falta la fase D (cierre). Resumen en `docs/tickets/FE-005.md`.
- Antes: FE-002 — mapa de sectores, tema y variantes (mergeado, #6); DOC-002 — arquitectura escrita (mergeado, #4); FE-001 — base del front (mergeado, #2).

## Siguiente ticket
- DOC-004 del front: nombre público y docs neutras, hasta que el exportador de la entrega salga con código 0.
- Cuando el back publique cápsulas y fichas de especie, comprobar la cartilla con la API real.
- FE-005, fase D: cierre, con `build` + `preview` y la revisión final (FE-003 y FE-004 quedan como anexos).

## Pendiente fuera de este repo
- Protección de `main` (PR obligatorio con aprobación de Code Owner, solo squash) y agregar `lint`, `tests` y `build` como checks obligatorios.
- Aprobar en el PR de FE-002 el color nuevo `--superficie-clara` del tema claro.

## Al arrancar una sesión
`docs/ESTADO.md` → `git log --oneline -5` → `git status` → canario.
