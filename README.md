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

### Correr el front contra el back
1. Levanta el back y carga sus datos (en `backend-MAN.OGG`, ver su README): `docker compose up -d`, `migrate`, `importar_sectores` e `importar_planilla`.
2. En el `.env` del front, apunta a la API y apaga los mocks:

```ini
VITE_API_URL=http://localhost:8000/api/v1   # el puerto es API_PUERTO del .env del back
VITE_USAR_MOCKS=false
```

3. `npm run dev` y abre `http://localhost:5173/` (el puerto es `PUERTO_DEV`). El back debe aceptar ese origen en `CORS_ORIGENES_PERMITIDOS`.

Sin árboles cargados, los sectores dicen «Aún sin árboles registrados». Si el back no responde, la pantalla muestra el mensaje de error con «Reintentar». El sector y el árbol abiertos quedan en la URL (`?sector=1&arbol=S01-A001`), así que se puede compartir el enlace.

Antes de abrir un PR: `npm test`, `npm run lint`, `npm run formato:verificar`, `npm run tipos`, `npm run verificar:colores` y `npm run build`.

## Documentación
- [AGENTS.md](AGENTS.md): reglas del repo (también para Claude Code, vía [CLAUDE.md](CLAUDE.md)).
- [CONTRIBUTING.md](CONTRIBUTING.md): cómo dejar tu PC lista y el flujo diario.
- [docs/ESTADO.md](docs/ESTADO.md): estado actual y siguiente ticket.
- [docs/requerimientos.md](docs/requerimientos.md): qué pide el stakeholder.
- [docs/CANARIOS.md](docs/CANARIOS.md): registro de canarios.
- [docs/tickets/](docs/tickets/): un archivo por ticket.
