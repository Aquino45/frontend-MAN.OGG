# ESTADO — frontend-MAN.OGG

Actualizado: 09/10/2026 (ticket DOC-002).

## Dónde estamos
- El front es levantable: React + Vite + TypeScript, tokens con la paleta del GIF, constantes de negocio, lectura de entorno validada y CI (`lint`, `tests`, `build`). Sin mapa, cartilla ni easter egg todavía.
- La arquitectura del front está escrita en `docs/ARQUITECTURA.md`: modular por funcionalidad (`src/modulos/<modulo>/` con su `index.ts`), capas y fronteras entre módulos. Los agentes la leen antes de empezar y la QA bloquea un archivo fuera de su capa o módulo.
- Hito M0 (disciplina) en curso.

## Último ticket
- DOC-002 — arquitectura escrita en el front (EN REVISIÓN, Issue #3). Resumen en `docs/tickets/DOC-002.md`.
- Antes: FE-001 — React + Vite + TypeScript y CI mínimo (mergeado, #2).

## Siguiente ticket
- FE-002 — mapa. Sigue `docs/ARQUITECTURA.md`: módulos `mapa` y `tema`, `api/`, `mocks/`, `compartido/` y la regla de ESLint de fronteras (ver su § 7).

## Pendiente fuera de este repo
- Protección de `main` (PR obligatorio con aprobación de Code Owner, solo squash) y, tras el merge de FE-001, agregar `lint`, `tests` y `build` como checks obligatorios.
- Requerimientos del stakeholder aprobados y contrato v0 (BE-002); de ahí salen los tipos del front.

## Al arrancar una sesión
`docs/ESTADO.md` → `git log --oneline -5` → `git status` → canario.
