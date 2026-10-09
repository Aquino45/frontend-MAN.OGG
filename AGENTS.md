# AGENTS.md — frontend-MAN.OGG

Reglas del repo para cualquier integrante y para su Claude Code. Si algo choca con el master plan, manda este archivo.

## 1. Qué es MAN.OGG y qué es este repo
MAN.OGG es un sistema web de **censo arbóreo** con un mapa del campus UPeU Ñaña dividido en 5 sectores, para ver las características de cada árbol. Son dos repos de GitHub: `Aquino45/backend-MAN.OGG` y `Aquino45/frontend-MAN.OGG`.

Este repo es el **front**: SPA con React + Vite + TypeScript + Framer Motion (+ MapLibre GL opcional para el mapa real). Consume la API del back y genera sus tipos desde su contrato.

Stack completo: back Django 5 + DRF + GeoDjango + PostgreSQL/PostGIS en Docker; front React + Vite + TypeScript + Framer Motion (+ MapLibre GL opcional).

## 2. Reglas de oro
- **Todo nace de un ticket** (Issue en GitHub + `docs/tickets/<ID>.md`).
- **Solo se tocan los «Archivos permitidos»** del ticket. La config de agentes (`.claude/`) también cambia solo por ticket.
- El contrato `contrato/openapi.yaml` (en `backend-MAN.OGG`) manda. El front genera sus tipos desde el contrato y nunca los escribe a mano. Un campo nuevo exige primero el ticket de contrato en el back.
- **Nunca se inventan datos del censo.** Todo árbol lleva `fuente`; los datos de prueba van solo en fixtures, con `demo: true`.
- **Tests obligatorios** en cada pieza nueva. Nunca push con tests en rojo.
- **Nunca** push a `main`, merge, force-push ni `.env` en git. Los repos son públicos: tampoco claves ni datos personales.

## 3. Cero hardcoding
- Configuración y secretos: `.env` + `.env.example`.
- Constantes de negocio en `src/config/constantes.ts`. Configuración en `.env` (prefijo `VITE_`, documentado en `.env.example`), leída con `import.meta.env`.
- Colores, tipografía y espacios: tokens en `src/styles/tokens.css` (front). Ningún hex suelto en los componentes.
- Datos (sectores, árboles, catálogos): salen de la BD por la API, nunca de listas escritas en el código.
- URLs y puertos salen del entorno, nunca `localhost` escrito a mano.
- Nombres iguales al contrato (`codigo`, `dap_cm`, `co2_almacenado_kg`…), con la unidad incluida (`_m`, `_cm`, `_kg`). Variables descriptivas: nada de `x`, `data2` ni `tmp`. TypeScript en `camelCase` para variables y `PascalCase` para componentes; constantes en `MAYUSCULAS`.
- Archivos de ~300 líneas como máximo. Agregar un sector, un árbol o un campo no debe exigir tocar la lógica.

## 4. Flujo de un ticket
1. Issue → rama `ticket/<ID>-<slug>` o `claude --worktree <ID>`.
2. Tests primero.
3. Commits `[ID] descripción`.
4. Ticket en EN REVISIÓN con un resumen de ≤10 líneas que incluye «Hice fuera de lo pedido» y la línea del canario.
5. PR con `Closes #n` → CI verde → aprobación del Code Owner → squash.

## 5. Canario
- Apertura de toda respuesta: `Zapatito roto.`
- Cierre: `Zapatito roto · <ROL> · <palabra>`.
- La palabra del ticket se asigna al despachar.
- Un informe sin canario o con la palabra equivocada se rechaza y se relanza con contexto fresco.
- Familia de palabras de este repo: front = rocas metamórficas. Registro en `docs/CANARIOS.md`.

## 6. Sesiones
- Máximo 3 tickets por sesión de orquestador.
- `/clear` al cerrar el lote, cerca de ~150k tokens y tras 2 correcciones fallidas.
- Al arrancar, en este orden: `docs/ESTADO.md` → `git log --oneline -5` → `git status` → canario.

## 7. Evidencia o no pasó
Cada afirmación del informe lleva un test, un comando corrido o un `archivo:línea`. Si no, va marcada «(sin verificar)».

## 8. Comandos
Requiere Node 22 o más y npm. Antes del primer `npm run dev`: `cp .env.example .env`.

| Comando | Qué hace |
|---|---|
| `npm install` | Instala las dependencias (versiones exactas). |
| `npm run dev` | Servidor de desarrollo en el puerto de `PUERTO_DEV`. |
| `npm run build` | Compila para producción. |
| `npm run preview` | Sirve el build local. |
| `npm test` | Tests con Vitest (`vitest run`). |
| `npm run lint` | ESLint. |
| `npm run formato` / `npm run formato:verificar` | Prettier: aplica / solo verifica. |
| `npm run tipos` | Chequeo de tipos con TypeScript. |
| `npm run verificar:colores` | Falla si hay colores literales fuera de `src/styles/tokens.css`. |
