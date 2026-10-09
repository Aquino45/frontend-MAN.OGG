# ESTADO — frontend-MAN.OGG

Actualizado: 09/10/2026 (ticket FE-005, fase A).

## Dónde estamos
- El front muestra el **mapa ilustrado de los 5 sectores**, dibujado desde los polígonos del contrato: hover, teclado y toque resaltan un sector y atenúan los demás; click o Enter **entran** al sector (el mapa se acerca, los demás quedan atenuados) y abren su panel con la lista de árboles, que también se dibujan como puntos en su posición real. Los límites provisionales van punteados.
- **Cartilla del árbol** con los 19 campos (foto, indicadores de altura, copa y DAP, CO₂ y estados), con el sello «Dato de ejemplo» en los demo y «Sin dato» donde falta un valor. El sector y el árbol abiertos viven en la URL (`?sector=<id>&arbol=<codigo>`), y «atrás» y `Esc` los cierran.
- Con mocks solo el sector 1 trae árboles (S01-A001 y S01-A012 tienen cartilla; A002 y A015 dicen «No encontramos el árbol»). El nombre público es «Censo arbóreo UPeU Lima».
- **Tema claro y oscuro:** arranca según el sistema y el interruptor lo recuerda en el navegador.
- **Variantes de adorno:** `lib/elegirVariante` con tablas de pesos (frases de carga y glifos decorativos).
- Tipos generados del contrato (`npm run contrato:tipos`), cliente de la API con mocks (`VITE_USAR_MOCKS`) y regla de ESLint de fronteras entre módulos.
- Hito M0 (disciplina) en curso.

## Último ticket
- FE-005 — front v1 completo, por fases. **Fase A hecha** (PR en borrador, Issue #7): recorrido mapa → sector → árbol con mocks, panel con la lista, cartilla de 19 campos, tokens y fuentes, estado en la URL y nombre público «Censo arbóreo UPeU Lima». Faltan la fase B (API real, celular y accesibilidad), la C (entrada con variantes) y la D (cierre). Resumen en `docs/tickets/FE-005.md`.
- Antes: FE-002 — mapa de sectores, tema y variantes (mergeado, #6); DOC-002 — arquitectura escrita (mergeado, #4); FE-001 — base del front (mergeado, #2).

## Siguiente ticket
- FE-005, fase B: API real, celular y accesibilidad (FE-003 y FE-004 quedan como anexos).

## Pendiente fuera de este repo
- Protección de `main` (PR obligatorio con aprobación de Code Owner, solo squash) y agregar `lint`, `tests` y `build` como checks obligatorios.
- Aprobar en el PR de FE-002 el color nuevo `--superficie-clara` del tema claro.

## Al arrancar una sesión
`docs/ESTADO.md` → `git log --oneline -5` → `git status` → canario.
