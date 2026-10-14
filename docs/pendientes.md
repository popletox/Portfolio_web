# Pendientes

Registro de tareas, revisiones y decisiones pendientes del proyecto. Se actualiza al terminar o decidir cada punto.

Etiquetas: **Hacer** (trabajo por hacer), **Revisar** (comprobar o corregir), **Decidir** (falta una decisión).

Cómo mantenerlo:

- Cada punto tiene un número estable (`P01`, `P02`…) para poder citarlo; no se renumera.
- Al completarlo se marca `- [x]` y se mueve a [Hechos](#hechos) con la fecha (AAAA-MM-DD).
- Las decisiones tomadas se anotan en una línea bajo el punto.
- Los puntos nuevos toman el siguiente número libre.

## Línea de tiempo

- [ ] **P01 · Decidir**: qué hacer cuando el conector de una tarjeta de proyecto queda tapado por otra tarjeta en proyectos de meses consecutivos.
- [ ] **P02 · Revisar**: los nombres inclinados de periodos cercanos se pisan (p. ej. "QA Tester…" y "Técnico Desarrollo…"). Revisar con datos reales y, si sigue pasando, separarlos automáticamente.
- [ ] **P03 · Revisar**: espacio vacío encima de los nombres (la altura se calcula para el nombre más largo posible).
- [ ] **P04 · Decidir**: el primer año no tiene etiqueta si el eje empieza a mitad de año.
- [ ] **P05 · Hacer**: paso 4, estrellas de mérito (sin acción) en los proyectos con mérito y ajustes de móvil.
- [ ] **P06 · Decidir**: añadir arrastrar con el ratón o un "slider" visible para desplazar la franja (ahora solo hay scroll nativo).
- [ ] **P07 · Revisar**: vista de móvil con los datos reales.

## Proyectos y ventana de detalle

- [ ] **P08 · Decidir**: pausar el carrusel del Destacado mientras la ventana de detalle está abierta.
- [ ] **P09 · Revisar**: el bocadillo "Enlace copiado" sale debajo del botón en proyectos largos y en móvil.
- [ ] **P10 · Revisar**: esquinas redondeadas y barra de scroll de la ventana en los 4 temas (tras `overflow: visible`).
- [ ] **P11 · Revisar**: una banda de año con una sola tarjeta deja mucho espacio; al filtrar se funde todo el bloque, incluidas las tarjetas que siguen visibles.
- [ ] **P12 · Revisar**: un lector de pantalla puede no anunciar "Enlace copiado" dos veces seguidas.

## Méritos

- [ ] **P13 · Decidir**: cómo navegar a un mérito (no hay forma desde el paso 3 de Proyectos y la estrella de la línea de tiempo no hará nada). ¿Ventana propia como los proyectos?

## Contenido

- [ ] **P14 · Hacer**: sustituir el contenido "[Provisional]" (58 marcas a 2026-10-14 en [`datos/contenido.json`](../datos/contenido.json)).
- [ ] **P15 · Hacer**: sustituir los enlaces provisionales `#` (p. ej. Revlon en el catálogo `referencias` y `"web": "#"` de los proyectos).
- [ ] **P16 · Hacer**: crear `recursos/` con las imágenes `low`/`high` de los proyectos y las `img` del catálogo de referencias.
- [ ] **P17 · Hacer**: crear los proyectos reales (Fire Lunar Rush, Color Switch Race…) y cambiar sus referencias del catálogo por el id del proyecto.
- [ ] **P18 · Revisar**: "Proyecto provisional 1" tiene `enCurso: true` puesto para pruebas.
- [ ] **P19 · Decidir**: si un `\n` dentro de un texto debe crear un salto de línea (ahora se ignora; hay uno sobrante en la introducción).

## Diseño

Puntos abiertos del [documento de diseño](diseno-portfolio.md).

- [ ] **P20 · Hacer**: diseño propio del tema Cómic (ahora es una copia de Claro).
- [ ] **P21 · Hacer**: "Efectos divertidos" (interruptor en Opciones y animaciones de los títulos).
- [ ] **P22 · Decidir**: panel Destacado en móvil fijo abajo o al final del documento.
- [ ] **P23 · Decidir**: tema inicial Claro o seguir el del sistema.
- [ ] **P24 · Decidir**: versión en inglés.
- [ ] **P25 · Decidir**: alinear la introducción con el borde de las cajas de sección (actual) o con el texto de dentro.

## Publicación e infraestructura

- [ ] **P26 · Hacer**: activar GitHub Pages (Settings → Pages → rama `main`, carpeta raíz) y comprobar la web publicada en https://popletox.github.io/Portfolio_web/ (rutas relativas, carga del JSON).
- [ ] **P27 · Revisar** (tras publicar): menú de compartir en móvil (requiere HTTPS), Safari, Firefox y lector de pantalla.
- [ ] **P28 · Hacer**: añadir reglas al [`.gitignore`](../.gitignore) (ahora vacío): `.env`, `node_modules/`, logs y archivos del sistema (`Thumbs.db`, `.DS_Store`).
- [ ] **P29 · Hacer**: corregir [`docs/estructura-proyecto.md`](estructura-proyecto.md), que menciona la carpeta `recursos/` aunque aún no existe.

## Limpieza menor

- [ ] **P31 · Revisar**: `.proyecto-tarjeta { position: relative }` quizá sobre desde que se quitó el resaltado.
- [ ] **P32 · Revisar**: el aviso de consola por tipos de enlace desconocidos se repite cada vez que se abre la ventana.

## Hechos

- [x] **P30 · Decidir** (2026-10-14): añadir a [`.claude/agents/programador.md`](../.claude/agents/programador.md) que no cierre procesos que no haya abierto él (al probar en el navegador cerró el Chrome del usuario).
  - Decisión: norma añadida a `programador.md` (sección Prohibido): cerrar solo el proceso propio y no dejar archivos de prueba en el repositorio.
