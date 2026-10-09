# frontend-MAN.OGG

Interfaz de **MAN.OGG**, sistema web de censo arbóreo del campus UPeU Ñaña con un mapa dividido en sectores. Este repo es el front: React + Vite + TypeScript + Framer Motion (+ MapLibre GL opcional). Consume la API del repo `backend-MAN.OGG` y genera sus tipos desde `contrato/openapi.yaml`.

## Levantar
Requiere Node 22 o más y npm.

```bash
cp .env.example .env   # y ajusta los valores si hace falta
npm install
npm run dev            # abre el puerto de PUERTO_DEV (5173 por defecto)
```

### Tipos del contrato
`src/api/schema.d.ts` se genera desde el contrato del back y se commitea; no se edita a mano. Con el repo del back clonado al lado (la ruta va en `CONTRATO_RUTA` del `.env`):

```bash
npm run contrato:tipos
```

Con `VITE_USAR_MOCKS=true` el front usa los ejemplos del contrato (`src/mocks/`); con `false`, la API de `VITE_API_URL`.

Antes de abrir un PR: `npm test`, `npm run lint`, `npm run formato:verificar`, `npm run tipos`, `npm run verificar:colores` y `npm run build`.

## Documentación
- [AGENTS.md](AGENTS.md): reglas del repo (también para Claude Code, vía [CLAUDE.md](CLAUDE.md)).
- [CONTRIBUTING.md](CONTRIBUTING.md): cómo dejar tu PC lista y el flujo diario.
- [docs/ESTADO.md](docs/ESTADO.md): estado actual y siguiente ticket.
- [docs/requerimientos.md](docs/requerimientos.md): qué pide el stakeholder.
- [docs/CANARIOS.md](docs/CANARIOS.md): registro de canarios.
- [docs/tickets/](docs/tickets/): un archivo por ticket.
