# Pendientes

Registro de tareas, revisiones y decisiones pendientes del proyecto. Se actualiza al terminar o decidir cada punto.

Etiquetas: **Hacer** (trabajo por hacer), **Revisar** (comprobar o corregir), **Decidir** (falta una decisión).

Cómo mantenerlo:

- Cada punto tiene un número estable (`P01`, `P02`…) para poder citarlo; no se renumera.
- Al completarlo se marca `- [x]` y se mueve a [Hechos](#hechos) con la fecha (AAAA-MM-DD).
- Las decisiones tomadas se anotan en una línea bajo el punto.
- Los puntos nuevos toman el siguiente número libre.

## Línea de tiempo

- [ ] **P02 · Revisar**: los nombres inclinados de periodos cercanos se pisan (p. ej. "QA Tester…" y "Técnico Desarrollo…"). Revisar con datos reales y, si sigue pasando, separarlos automáticamente.
  - Decisión: separarlos automáticamente desplazándolos a izquierda y derecha; se hace en P38 (y P39 para 3 o más).
- [ ] **P03 · Revisar**: espacio vacío encima de los nombres (la altura se calcula para el nombre más largo posible).
- [ ] **P04 · Decidir**: el primer año no tiene etiqueta si el eje empieza a mitad de año.
- [ ] **P06 · Decidir**: añadir arrastrar con el ratón o un "slider" visible para desplazar la franja (ahora solo hay scroll nativo).
- [ ] **P07 · Revisar**: vista de móvil con los datos reales.
- [ ] **P33 · Hacer**: ajustes de móvil y pulido de la Línea de tiempo.
- [ ] **P34 · Revisar**: el hueco reservado a la estrella hace que los títulos de las tarjetas con mérito se corten antes (p. ej. en el tema Código "Proyecto provisional 1" se ve como "Proyecto provisional…").
- [ ] **P38 · Hacer**: cuando una experiencia y un estudio, o dos experiencias, comparten periodo o sus títulos se solapan, desplazar uno a la izquierda de su centro y el otro a la derecha.
  - Relacionado con P02 (decisión de separarlos automáticamente) y P39 (3 o más).
- [ ] **P41 · Hacer** (no urgente, pospuesto): si algún día hay fechas posteriores al mes actual, el degradado del eje empieza tras la última fecha, pero el de las barras en curso sigue terminando en el mes actual + 2, así que no acabarían a la par.
  - Decisión (2026-10-14): no tiene sentido mostrar algo que todavía no ha sucedido. Al abordarlo, las fechas posteriores al mes actual se limitarán (se "fijarán") al mes actual en la cronología, de modo que el eje y las barras en curso siempre terminen a la par. Implementación pendiente.
- [ ] **P42 · Revisar** (no urgente): los nombres a 45° de periodos cercanos se pisan (ahora, "QA Tester…" y "Desarrollador de videojuegos"). Ya pasaba antes del degradado.
  - Relacionado con P02 y P38.
- [ ] **P39 · Decidir**: cómo evitar que los textos se pisen si coinciden 3 o más estudios o experiencias (caso poco probable).
  - Relacionado con P38.

## Proyectos y ventana de detalle

- [ ] **P08 · Decidir**: pausar el carrusel del Destacado mientras la ventana de detalle está abierta.
- [ ] **P09 · Revisar**: el bocadillo "Enlace copiado" sale debajo del botón en proyectos largos y en móvil.
- [ ] **P10 · Revisar**: esquinas redondeadas y barra de scroll de la ventana en los 4 temas (tras `overflow: visible`).
- [ ] **P11 · Revisar**: una banda de año con una sola tarjeta deja mucho espacio; al filtrar se funde todo el bloque, incluidas las tarjetas que siguen visibles.
- [ ] **P12 · Revisar**: un lector de pantalla puede no anunciar "Enlace copiado" dos veces seguidas.

## Méritos

- [ ] **P13 · Decidir**: cómo navegar a un mérito (no hay forma desde el paso 3 de Proyectos y la estrella de la línea de tiempo no hace nada propio: abre el proyecto). ¿Ventana propia como los proyectos?
  - Relacionado con P36: depende del rework de los méritos.
- [ ] **P35 · Decidir**: mostrar también la estrella de reconocimiento en las tarjetas de la sección Proyectos (ahora solo está en la Línea de tiempo).
  - Relacionado con P36: depende del rework de los méritos.
- [ ] **P36 · Decidir**: rework de la sección "Méritos y reconocimientos" y de cómo se muestran los méritos en la web (sección, tarjetas de Referencias, estrellas de la Línea de tiempo). Pendiente de definir el planteamiento.

## Contenido

- [ ] **P14 · Hacer**: sustituir el contenido "[Provisional]" (85 marcas a 2026-10-14 en los archivos de [`datos/`](../datos/)).
- [ ] **P15 · Hacer**: sustituir los enlaces provisionales `#` (p. ej. Revlon en el catálogo `referencias` y `"web": "#"` de los proyectos).
- [ ] **P16 · Hacer**: crear `recursos/` con las imágenes `low`/`high` de los proyectos y las `img` del catálogo de referencias.
- [ ] **P17 · Hacer**: crear los proyectos reales (Fire Lunar Rush, Color Switch Race…) y cambiar sus referencias del catálogo por el id del proyecto.
- [ ] **P18 · Revisar**: "Proyecto provisional 1" tiene `enCurso: true` puesto para pruebas.
- [ ] **P19 · Decidir**: si un `\n` dentro de un texto debe crear un salto de línea (ahora se ignora; hay uno sobrante en la introducción).
- [ ] **P45 · Decidir** (añadido 2026-10-15): especificaciones de las imágenes de `recursos/Imagenes/`. Convertirlas a WebP y fijar un tamaño máximo por imagen (peso en KB y/o resolución en píxeles, por decidir). Ahora son 31 PNG y algunos pasan de 2 MB (p. ej. `recursos/Imagenes/DungeonStaff/IMG-01.png`, 2,7 MB).
  - Estado: pendiente de decidir y aplicar. La conversión se pospone porque se siguen preparando las imágenes.
  - Relacionado con P16 (creación de `recursos/`).
- [ ] **P46 · Hacer** (añadido 2026-10-15): rellenar `aptitudes` (habilidades personales) en `datos/datos-estudios.json` y confirmar los valores provisionales de `tecnologia` (Grado: Java, Python, C++, Linux; Máster: Unity, Unreal Engine, Perforce, Jira).
  - Decidido 2026-10-15: la etiqueta de aptitudes pasa a «Habilidades personales:» (el campo JSON sigue siendo `aptitudes`) y el título «Referencias» se quita solo en Estudios.

## Diseño

Puntos abiertos del [documento de diseño](diseno-portfolio.md).

- [ ] **P20 · Hacer**: diseño propio del tema Cómic (ahora es una copia de Claro).
  - Al hacerlo, revisar `--color-fondo-enlaces` y `--color-boton-enlaces-hover`.
- [ ] **P21 · Hacer**: "Efectos divertidos" (interruptor en Opciones y animaciones de los títulos).
- [ ] **P22 · Decidir**: panel Destacado en móvil fijo abajo o al final del documento.
- [ ] **P23 · Decidir**: tema inicial Claro o seguir el del sistema.
- [ ] **P24 · Decidir**: versión en inglés.
- [ ] **P25 · Decidir**: alinear la introducción con el borde de las cajas de sección (actual) o con el texto de dentro.
- [ ] **P43 · Revisar**: los cambios sobre la sombra del Panel destacado y su botón-pestaña se juntaron con la Línea de tiempo durante una fusión automática: sombra animada del panel, botón de color sólido (`--color-panel`) unido al panel como una sola pieza (filo, `drop-shadow` y `clip-path`), variables de tema nuevas (`--color-enlace-panel`, `--color-borde-boton-panel`, `--color-sombra-panel`, `--desenfoque-sombra-panel`; se quita `--color-boton-panel`), `--color-panel` más oscuro en Claro y Cómic y `docs/temas.md` actualizado. Falta probarlos en los 4 temas y en móvil.
- [ ] **P49 · Hacer** (añadido 2026-10-15): añadir iconos SVG a los botones de tema (Claro, Oscuro, Código, Cómic) del menú Opciones, que ahora no tienen SVG. Petición del usuario.

## Publicación e infraestructura

- [ ] **P26 · Hacer**: activar GitHub Pages (Settings → Pages → rama `main`, carpeta raíz) y comprobar la web publicada en https://popletox.github.io/Portfolio_web/ (rutas relativas, carga del JSON).
- [ ] **P27 · Revisar** (tras publicar): menú de compartir en móvil (requiere HTTPS), Safari, Firefox y lector de pantalla.
- [ ] **P28 · Hacer**: añadir reglas al [`.gitignore`](../.gitignore) (ahora vacío): `.env`, `node_modules/`, logs y archivos del sistema (`Thumbs.db`, `.DS_Store`).
- [ ] **P29 · Hacer**: corregir [`docs/estructura-proyecto.md`](estructura-proyecto.md), que menciona la carpeta `recursos/` aunque aún no existe.

## Limpieza menor

- [ ] **P40 · Hacer** (no urgente): que el error de un JSON mal escrito en `datos/` diga qué archivo falla (ahora solo los errores HTTP lo nombran).
- [ ] **P31 · Revisar**: `.proyecto-tarjeta { position: relative }` quizá sobre desde que se quitó el resaltado.
- [ ] **P32 · Revisar**: el aviso de consola por tipos de enlace desconocidos se repite cada vez que se abre la ventana.

## Hechos

- [x] **P01 · Decidir** (2026-10-15): qué hacer cuando el conector de una tarjeta de proyecto queda tapado por otra tarjeta en proyectos de meses consecutivos.
  - Decisión: el conector se desvanece sutilmente antes de la tarjeta que lo tapa y reaparece gradualmente al otro lado, sin lógica en la línea; se hace con «halos» en las tarjetas (variables `--alto-halo-tarjeta-cronologia` y `--ranura-halo-tarjeta-cronologia`). Ver [`diseno-portfolio.md`](diseno-portfolio.md).
  - Ajuste de esquinas (2026-10-15): cada halo se extiende `--radio-medio` bajo la tarjeta en color sólido para que el conector no reaparezca en las esquinas redondeadas.
  - Limitaciones: con dos proyectos del mismo mes en filas distintas, el conector del de abajo cae en la ranura del de arriba y no se difumina ahí; el efecto depende de que el fondo tras las tarjetas sea `--color-fondo-suave` (los 4 temas usan color liso).
- [x] **P50 · Decidir** (2026-10-15): hover de los iconos de marca en la cabecera. En los temas Claro y Cómic el fondo de acento (`#1a73e8`) casi se confundía con el azul del logo de LinkedIn (`#0077B7`).
  - Nota: resuelto usando `--color-boton-enlaces-hover` como fondo al pasar el ratón (y con Opciones abierto) en los botones de la cabecera; el icono conserva `--color-texto`.
- [x] **P37 · Hacer** (2026-10-15): rediseñar los enlaces de la ventana de detalle de un proyecto. El JSON tendrá más categorías de enlace (steam, github, itch.io y posiblemente más); dejarán de mostrarse como URL de texto y pasarán a ser botones circulares con el logo de su categoría. Los logos serán SVG guardados en `recursos/`.
  - Relacionado con P16 (creación de `recursos/`).
  - Relacionado con P32 (aviso de consola por tipos de enlace desconocidos): conviene revisarlo al ampliar las categorías.
  - Nota: hecho en la ventana de detalle, la cabecera y el visor (iconos en `recursos/Iconos/`, máscara CSS `.icono-mascara` para los monocromo). Ver [`diseno-portfolio.md`](diseno-portfolio.md).
- [x] **P47 · Revisar** (2026-10-15): contraste de la región de enlaces del detalle de proyecto en el tema Código.
  - Nota: resuelto con la variable de tema nueva `--color-fondo-enlaces` (más `--color-boton-enlaces-hover`), en los cuatro temas.
- [x] **P48 · Revisar** (2026-10-15): región de enlaces en el tema Cómic.
  - Nota: comprobado en el navegador, se ve bien. Cómic usa los valores de Claro; el ajuste propio queda en P20.
- [x] **P44 · Hacer** (2026-10-15): descarga de PDFs en los proyectos.
  - Nota: resuelto con la clave `pdf-download` de `enlaces` (botón con icono y atributo `download`); el PDF del TFG se asignó a Beans out (`recursos/Documentos/videojuego_procedural_unity_tfg.pdf`). Documentado en [`formato-datos.md`](formato-datos.md).
- [x] **P05 · Hacer** (2026-10-14): paso 4 de la Línea de tiempo, estrellas de mérito en los proyectos con mérito.
  - Nota: estrellas de mérito hechas; los ajustes de móvil y el pulido pasan a P33.
- [x] **P30 · Decidir** (2026-10-14): añadir a [`.claude/agents/programador.md`](../.claude/agents/programador.md) que no cierre procesos que no haya abierto él (al probar en el navegador cerró el Chrome del usuario).
  - Decisión: norma añadida a `programador.md` (sección Prohibido): cerrar solo el proceso propio y no dejar archivos de prueba en el repositorio.
