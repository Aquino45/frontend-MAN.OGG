# ESTADO — frontend-MAN.OGG

Actualizado: 08/10/2026 (ticket FE-001).

## Dónde estamos
- El front es levantable: React + Vite + TypeScript, tokens con la paleta del GIF, constantes de negocio, lectura de entorno validada y CI (`lint`, `tests`, `build`). Sin mapa, cartilla ni easter egg todavía.
- Hito M0 (disciplina) en curso.

## Último ticket
- FE-001 — React + Vite + TypeScript y CI mínimo (EN REVISIÓN). Resumen en `docs/tickets/FE-001.md`.

## Siguiente ticket
- FE-002 — mapa.

## Pendiente fuera de este repo
- Protección de `main` (PR obligatorio con aprobación de Code Owner, solo squash) y, tras el merge de FE-001, agregar `lint`, `tests` y `build` como checks obligatorios.
- Requerimientos del stakeholder aprobados y contrato v0 (BE-002); de ahí salen los tipos del front.

## Al arrancar una sesión
`docs/ESTADO.md` → `git log --oneline -5` → `git status` → canario.
