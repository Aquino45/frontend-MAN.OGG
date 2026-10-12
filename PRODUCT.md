# Product

<!-- impeccable:product-schema 1 -->

> Armado sin entrevista (modo piloto automático del ticket): sale de `docs/requerimientos.md` v0.3, `AGENTS.md`, `docs/ESTADO.md` y las decisiones ya tomadas. Lo que no tiene fuente va marcado «por confirmar» y no se inventa.

## Platform

web

## Users

- **Visitante** (único actor de la v1): cualquier persona que abre el sitio y solo mira. Quiere ubicar un árbol del campus UPeU Ñaña y ver sus características. Se usa en celular (360 px) y en laptop (1440 px). Perfil detallado y contexto de uso: por confirmar.
- **Stakeholder del censo:** quien pidió el sitio y calcula el CO₂ en gabinete. Evalúa que se vea «muy innovador» y que los datos sean veraces.
- **Administración y edición del censo:** trabajan en el panel del servidor, fuera de este repo. No usan este front.

## Product Purpose

Mostrar el censo arbóreo del campus UPeU Ñaña: un mapa dividido en 5 sectores, la lista de árboles de cada uno y la cartilla de cada árbol con sus 19 campos y su foto. Éxito: el visitante llega de un sector a un árbol en pocos pasos y entiende qué datos son de campo y cuáles de ejemplo. Métricas de éxito: por confirmar.

## Positioning

Un censo propio del campus, no un mapa genérico: los sectores y los puntos salen de los polígonos y coordenadas reales (WGS84), con la fuente de cada árbol, y el sitio nunca presenta un dato de ejemplo o simulado como real.

## Operating Context

- La planilla de la brigada de campo alimenta la base de datos; el back (Django + DRF + GeoDjango + PostgreSQL/PostGIS) expone la API con un contrato OpenAPI del que el front genera sus tipos.
- Hoy solo el sector 1 tiene datos de campo (34 árboles); los sectores 2 a 5 usan árboles de ejemplo marcados «Dato de ejemplo». El CO₂ de todos se muestra como «Simulado» hasta que llegue el dato real.
- Presentación de la v1 el 12/10/2026 a las 17:00, con congelamiento a las 15:00.
- Despliegue final y dominio: por confirmar.

## Capabilities and Constraints

- Rutas: Inicio, Mapa (con la cartilla), Árboles (lista con buscador y filtros en la URL) y Cifras (tablero con filtros, tabla accesible y campo/ejemplo siempre separados).
- Un campo vacío dice «Sin dato»; nunca se inventa. Cada árbol lleva `fuente`; los de ejemplo, `demo: true`.
- Vista satelital (RF-10): fuente Esri World Imagery con clave de API restringida por *referrer*; sin clave no hay botón.
- Navegadores: las 2 últimas versiones de Chrome, Edge, Firefox y Safari. Carga inicial < 3 s en 4G.
- Repos públicos: ni `.env`, ni claves, ni datos personales en git.
- Acceso escondido al panel de administración (mantener presionado el árbol de Inicio 10 s), fuera de las docs públicas.

## Brand Commitments

- **Paleta del árbol del stakeholder** (RF-08): carmín, magenta, magenta oscuro, noche y sombra violeta, más un neutro de lectura. Los valores de `src/styles/tokens.css` no cambian.
- **El árbol pixel** (sprite animado por cuadros, glifo y horizonte de copa) como protagonista; gráficos vectoriales, sin pixelado.
- **Logo «Vivero»** (baldosas isométricas pixel, insignia con check y «CENSO / Arbóreo») con co-marca UPeU usando el logo oficial tal cual.
- **Tipografía:** Bricolage Grotesque; Silkscreen solo en la variante alterna de la entrada.
- **Nombre público:** «Censo arbóreo UPeU Lima».
- **Movimiento corto y suave;** «reducir movimiento» apaga todo.
- Voz: textos de interfaz en español que nombran su acción y errores que dicen qué pasó y cómo seguir. Registro formal o cercano: por confirmar.

## Evidence on Hand

- 34 árboles reales del sector 1 (planilla del stakeholder, 11/10) con foto; 73 árboles de ejemplo en los sectores 2 a 5.
- Polígonos de los sectores: S1 desde el croquis; S2 a S5 propuestos por el equipo, provisionales (límites punteados en el mapa).
- No hay testimonios, métricas de uso ni cifras de visitas; no se inventan.

## Product Principles

1. **Veracidad antes que vistosidad:** lo de ejemplo y lo simulado se dice siempre, donde se ve.
2. **El árbol es el protagonista:** la audacia visual se gasta en el árbol y en la entrada al sector; el resto es lectura clara.
3. **Mismo lugar en todas las vistas:** sectores y árboles caen donde la geografía dice, en la vista ilustrada y en la satelital.
4. **Menos es más:** un solo camino claro del sector al árbol; sin adornos que compitan con los datos.
5. **Se usa con el pulgar y con el teclado:** celular primero y recorrido completo sin ratón.

## Accessibility & Inclusion

Contraste de texto de al menos 4.5:1 (WCAG AA) en los 2 temas; el carmín solo en títulos grandes y acentos. Foco visible, objetivos táctiles de 44 px o más, sin scroll horizontal a 360 px, sectores recorribles con Tab y Enter, y `prefers-reduced-motion` respetado. Nada se distingue solo por color (campo y ejemplo: liso y rayado).
