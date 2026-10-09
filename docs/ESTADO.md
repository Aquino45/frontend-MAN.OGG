# ESTADO — frontend-MAN.OGG

Actualizado: 09/10/2026 (ticket FE-002).

## Dónde estamos
- El front muestra el **mapa ilustrado de los 5 sectores**, dibujado desde los polígonos del contrato: hover, teclado y toque resaltan un sector y atenúan los demás; click o Enter lo seleccionan y muestran la franja con su nombre y total. Los límites provisionales van punteados.
- **Tema claro y oscuro:** arranca según el sistema y el interruptor lo recuerda en el navegador.
- **Variantes de adorno:** `lib/elegirVariante` con tablas de pesos (frases de carga y glifos decorativos).
- Tipos generados del contrato (`npm run contrato:tipos`), cliente de la API con mocks (`VITE_USAR_MOCKS`) y regla de ESLint de fronteras entre módulos.
- Hito M0 (disciplina) en curso.

## Último ticket
- FE-002 — mapa de sectores, tema y variantes (EN REVISIÓN, Issue #5). Resumen en `docs/tickets/FE-002.md`.
- Antes: DOC-002 — arquitectura escrita (mergeado, #4); FE-001 — base del front (mergeado, #2).

## Siguiente ticket
- FE-003 — panel del sector, puntos de los árboles y cartilla.

## Pendiente fuera de este repo
- Protección de `main` (PR obligatorio con aprobación de Code Owner, solo squash) y agregar `lint`, `tests` y `build` como checks obligatorios.
- Aprobar en el PR de FE-002 el color nuevo `--superficie-clara` del tema claro.

## Al arrancar una sesión
`docs/ESTADO.md` → `git log --oneline -5` → `git status` → canario.
