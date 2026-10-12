---
name: Censo arbóreo UPeU Lima
description: Sitio de un censo arbóreo con la paleta del árbol del stakeholder, el árbol pixel como protagonista y lectura clara de datos.
colors:
  copa-carmin: "#e02040"
  copa-magenta: "#c00080"
  copa-magenta-oscuro: "#a00080"
  tronco-noche: "#202040"
  sombra-violeta: "#413e59"
  texto-lectura: "#f6eef2"
  superficie-tarjeta: "#2b2a52"
  texto-tenue: "#d9cfe3"
  texto-suave: "#e7dcee"
  blanco: "#ffffff"
  destacado-ambar: "#ffd166"
typography:
  display:
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 1.25rem + 7vw, 6rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw + 1rem, 3rem)"
    lineHeight: 1.05
  title:
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif"
    fontSize: "1.4rem"
    lineHeight: 1.05
  body:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.125rem"
    lineHeight: 1.5
  label:
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.08em"
rounded:
  chip: "4px"
  control: "8px"
  tarjeta: "16px"
  pildora: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  xxl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.copa-carmin}"
    textColor: "{colors.blanco}"
    rounded: "{rounded.control}"
    height: "52px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.texto-lectura}"
    rounded: "{rounded.control}"
    height: "44px"
  card:
    backgroundColor: "{colors.superficie-tarjeta}"
    textColor: "{colors.texto-lectura}"
    rounded: "{rounded.tarjeta}"
    padding: "16px"
  chip-estado-regular:
    backgroundColor: "{colors.copa-magenta-oscuro}"
    textColor: "{colors.blanco}"
    rounded: "{rounded.chip}"
---

# Design System: Censo arbóreo UPeU Lima

## Overview

**Creative North Star: "El vivero de píxeles"**

El sitio es un vivero digital: un árbol dibujado pixel a pixel crece sobre un fondo noche y alrededor de él se ordena un censo de datos. La paleta es la del árbol que dio el stakeholder (carmín, magenta, noche), con un neutro claro para leer. Los datos se ven sobrios y vectoriales; el pixel queda reservado al árbol, al logo y al horizonte de copa.

La densidad es media: aire entre bloques, tarjetas de un solo nivel y una sola sombra. La audacia se gasta en dos lugares, el árbol de la portada y la entrada al sector; el resto es lectura. Todo estado se dice con texto y forma además del color (campo liso, ejemplo rayado; «Dato de ejemplo», «Simulado»).

**Key Characteristics:**
- Tema oscuro por defecto (noche) y tema claro (neutro de lectura), que redefinen solo los alias semánticos.
- Un solo protagonista visual: el árbol pixel animado por cuadros.
- Movimiento corto (menos de 300 ms en la interfaz) y «reducir movimiento» apaga todo.
- Gráficos vectoriales, nunca pixelados.

## Colors

Paleta cerrada de cinco colores del árbol más neutros de lectura. No se agregan colores de marca.

### Primary
- **Carmín de copa** (#e02040): botón principal, acentos y títulos grandes. Sobre noche da solo 3.32:1: nunca en párrafos.

### Secondary
- **Magenta** (#c00080): estados secundarios, bordes del mapa en oscuro, pulgar del scroll.
- **Magenta profundo** (#a00080): sectores resaltados, chip «regular», bordes en reposo, selección. El texto blanco encima da 7.48:1.

### Neutral
- **Noche de tronco** (#202040): fondo del tema oscuro y texto del tema claro.
- **Sombra violeta** (#413e59): superficies, pistas de indicadores y separadores.
- **Neutro de lectura** (#f6eef2): texto del tema oscuro y fondo del claro (13.7:1 sobre noche).
- **Tarjeta** (#2b2a52), **texto tenue** (#d9cfe3) y **texto suave** (#e7dcee): cartilla y franja de cifras.
- **Ámbar de destacado** (#ffd166): solo la estrella de los árboles destacados, con borde noche.

### Named Rules
**The Cinco Colores Rule.** Todo color sale de `src/styles/tokens.css`; ningún hex suelto en componentes y los valores de la paleta no cambian. Un token de color nuevo solo se propone, con su contraste AA en los 2 temas.

**The Carmín Rule.** El carmín va en títulos grandes y acentos, nunca en texto corrido.

## Typography

**Display Font:** Bricolage Grotesque (con la pila del sistema de respaldo)
**Body Font:** pila del sistema (system-ui, Segoe UI, Roboto)
**Label/Pixel Font:** Silkscreen, solo en la variante alterna de la entrada

**Character:** un display con carácter y un cuerpo neutro que no compite con los datos.

### Hierarchy
- **Display** (700, clamp 2.75–6rem, 1.0, -0.03em): título de portada (un paso más grande, hasta 5.25rem) y de franja.
- **Headline** (clamp 1.75–3rem, 1.05): título de cada página.
- **Title** (1.4rem a 2.25rem, 1.05): títulos de panel, cartilla y tarjetas.
- **Body** (1.125rem, 1.5, medida de 65ch): párrafos y ayudas.
- **Label** (600, 0.75rem, mayúsculas, 0.08em): rótulos pequeños; es el mínimo absoluto y solo en mayúsculas.

### Named Rules
**The Silkscreen Rule.** Silkscreen no se amplía: se queda en la variante alterna de la entrada.

## Layout

Cabecera fija de una fila (76 px: control de 44 + 2 × 16) con marca, navegación (Inicio · Mapa · Árboles · Cifras; «Menú» en celular) y tema. Espaciado base 4: 4, 8, 12, 16, 24, 32, 40 y 64 px. Franjas de Inicio con 64 px arriba y abajo y un ancho máximo de 77.5rem; el mapa, 72rem. En el mapa, el panel del sector es lateral (28rem) desde 56rem y una hoja inferior arrastrable (85dvh) en celular. Se usa bien a 360 y 1440 px sin scroll horizontal.

## Elevation & Depth

Plano por capas tonales (fondo, superficie, tarjeta) con una sola sombra para lo que flota. Las tarjetas vivas suben 3 px con el cursor y su sombra aparece con opacidad, sin animarse.

### Shadow Vocabulary
- **Flotante** (`0 -8px 24px` de noche al 55 %): hoja inferior y menú.
- **Elevada** (`0 10px 22px` de noche al 55 %): tarjeta con el cursor.
- **Sector activo** (`drop-shadow(0 6px 10px …)`): fija, no se anima.

### Named Rules
**The Una Sombra Rule.** No se agregan sombras nuevas; no se anima ninguna sombra.

## Shapes

Esquinas por uso: 4 px chips, sellos y miniaturas; 8 px filas, campos y botones; 16 px tarjetas, cartilla y hoja; píldora (999 px) para etiquetas. El árbol y el logo son pixel art en rejilla entera con `crispEdges`; los mapas y gráficos son vectoriales.

## Components

### Buttons
- **Shape:** 8 px.
- **Primary:** fondo carmín, texto blanco en 18 px o más y semibold (4.72:1); 52 px de alto en los grandes, 44 px mínimo.
- **Secondary:** borde del texto tenue sobre el fondo.
- **Hover / Focus:** hover solo con puntero fino; `:active` con escala 0.96; foco visible de 2 px con 3 px de separación.

### Chips de estado
- **Style:** bueno = neutro de lectura sobre noche; regular = magenta profundo con blanco; malo = carmín con blanco; otro = superficie.

### Cards / Containers
- **Corner Style:** 16 px. **Background:** tarjeta. **Border:** ninguno. **Padding:** 16 px.

### Navigation
- Enlaces con `:active`; en celular, menú que abre con opacidad y 4 px de desplazamiento en 160 ms.

### Árbol animado (componente firma)
Sprite de 40 × 40 celdas dibujado por cuadros, hasta 70 % del alto de la ventana, con celda entera en px. Crece al abrir el sitio, respira y se inclina hacia el puntero fino. Con «reducir movimiento» se dibuja completo y quieto.

### Horizonte de copa
Silueta pixel entre secciones. Su tratamiento debe ser el mismo en todos los cortes (ver Do's and Don'ts).

### Mapa de sectores
SVG generado desde los polígonos del contrato: reposo en superficie, resaltado en magenta profundo, los demás al 35 %; límites provisionales punteados; puntos de árboles claros con borde noche; destacados con estrella ámbar.

## Do's and Don'ts

### Do:
- **Do** mantener la paleta, el sprite del árbol (`ArbolAnimado`, `dibujoArbol.ts`, `piezasArbol.ts`, `rasterizar*`) y el glifo pixel sin rediseñarlos: se les da mejor escenario.
- **Do** conservar el horizonte de copa como único motivo pixel decorativo, y que se vea igual en todos los cortes: silueta rellena con el color de la sección que entra y borde magenta, en los dos sentidos y en los 2 temas.
- **Do** conservar el acceso escondido (mantener presionado el árbol 10 s) y la tipografía vigente (Bricolage; Silkscreen solo en la alterna).
- **Do** usar solo `transform`, `opacity` y `clip-path` para animar, con las duraciones de `movimiento.tokens.css` y sin animar acciones de teclado.
- **Do** apagar todo el movimiento con «reducir movimiento», incluido WAAPI y `requestAnimationFrame`.
- **Do** marcar siempre lo de ejemplo («Dato de ejemplo») y lo simulado («Simulado»), y decir «Sin dato» donde falte un valor.
- **Do** gastar la audacia en el árbol y en la entrada al sector.

### Don't:
- **Don't** cambiar un valor de color de `tokens.css` ni escribir un hex fuera de él.
- **Don't** usar carmín en párrafos ni distinguir campo de ejemplo solo por color.
- **Don't** pixelar gráficos de datos: son vectoriales.
- **Don't** volver a los motivos pixel de FE-010 que se quitaron (viñeta, esquina y hojas de fondo).
- **Don't** animar con `transition: all`, `ease-in`, `scale(0)` ni `will-change` permanente; ninguna transición de 300 ms o más en la interfaz (salvo el zoom y el árbol).
- **Don't** inventar datos del censo, ni poner la clave de Esri en git.
