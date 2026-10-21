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
  - 2026-10-21: P38 pasa a no urgente porque ahora no se pisa ningún nombre; este punto sigue abierto hasta que se vuelva a ver el problema con datos reales.
- [ ] **P03 · Revisar**: espacio vacío encima de los nombres (la altura se calcula para el nombre más largo posible).
- [ ] **P38 · Hacer** (no urgente): cuando una experiencia y un estudio, o dos experiencias, comparten periodo o sus títulos se solapan, desplazar uno a la izquierda de su centro y el otro a la derecha.
  - 2026-10-21: ahora mismo no se pisa ningún texto de la Línea de tiempo; se hará solo si vuelve a pasar.
  - Relacionado con P02 (decisión de separarlos automáticamente) y P39 (3 o más).
- [ ] **P41 · Hacer** (no urgente, pospuesto): si algún día hay fechas posteriores al mes actual, el degradado del eje empieza tras la última fecha, pero el de las barras en curso sigue terminando en el mes actual + 2, así que no acabarían a la par.
  - Decisión (2026-10-14): no tiene sentido mostrar algo que todavía no ha sucedido. Al abordarlo, las fechas posteriores al mes actual se limitarán (se "fijarán") al mes actual en la cronología, de modo que el eje y las barras en curso siempre terminen a la par. Implementación pendiente.
- [ ] **P39 · Decidir**: cómo evitar que los textos se pisen si coinciden 3 o más estudios o experiencias (caso poco probable).
  - Relacionado con P38.

## Logos de empresa

- [ ] **P60 · Decidir** (añadido 2026-10-21): retocar los logos de empresa de la sección Experiencia en móvil (petición del usuario; qué cambiar, por decidir).
- [ ] **P59 · Decidir** (no urgente, añadido 2026-10-17): valorar logos de institución en Estudios. `crearEntradaRango` ya admite `logo` y `logoAclararEnOscuro`; faltaría el campo en `datos/datos-estudios.json` y pasarlos en `montarEstudios`.

## Proyectos y ventana de detalle

- [ ] **P08 · Decidir**: pausar el carrusel del Destacado mientras la ventana de detalle está abierta.
- [ ] **P10 · Revisar**: esquinas redondeadas y barra de scroll de la ventana en los 4 temas (tras `overflow: visible`).
- [ ] **P11 · Revisar**: una banda de año con una sola tarjeta deja mucho espacio; al filtrar se funde todo el bloque, incluidas las tarjetas que siguen visibles.
- [ ] **P12 · Revisar**: un lector de pantalla puede no anunciar "Enlace copiado" dos veces seguidas.

## Méritos

- [ ] **P51 · Decidir** (añadido 2026-10-16): si las tarjetas de proyecto dentro de los méritos se quedan con el formato compacto actual (9rem, imagen 16:9 recortada, título en una línea con «…») o pasan a ser iguales que las tarjetas de proyecto del resto de la web.

## Contenido

- [ ] **P19 · Decidir**: si un `\n` dentro de un texto debe crear un salto de línea (ahora se ignora; hay uno sobrante en la introducción).
- [ ] **P45 · Decidir** (añadido 2026-10-15): fijar un tamaño máximo por imagen de `recursos/Imagenes/` (peso en KB y/o resolución en píxeles, por decidir).
  - Hecho 2026-10-15: todas las imágenes de proyectos están convertidas a WebP con dos versiones, `_low` y `_high` (ya no queda ningún PNG). Solo queda abierto el tamaño máximo.
  - Relacionado con P16 (creación de `recursos/`, ya hecho).
- [ ] **P46 · Hacer** (añadido 2026-10-15): confirmar las tecnologías y las habilidades personales (`tecnologia` y `aptitudes`) tanto en Estudios ([`datos/datos-estudios.json`](../datos/datos-estudios.json)) como en Experiencia.
  - Decidido 2026-10-15: la etiqueta de aptitudes pasa a «Habilidades personales:» (el campo JSON sigue siendo `aptitudes`) y el título «Referencias» se quita solo en Estudios.
  - Decidido 2026-10-17: el título «Referencias» también se quita en Experiencia (la lista conserva `aria-label`); queda un segundo separador antes de las tarjetas si hay tecnología o aptitudes tras la descripción.

## Diseño

Puntos abiertos del [documento de diseño](diseno-portfolio.md).

- [ ] **P21 · Hacer**: "Efectos divertidos" (interruptor en Opciones y animaciones de los títulos).
  - 2026-10-16: interruptor hecho (`scripts/efectos.js`) y estado inicial decidido: apagado. Pendientes: las animaciones de los títulos y cómo se activan en táctil.
- [ ] **P22 · Decidir**: panel Destacado en móvil fijo abajo o al final del documento.
- [ ] **P24 · Decidir**: versión en inglés.
- [ ] **P25 · Decidir**: alinear la introducción con el borde de las cajas de sección (actual) o con el texto de dentro.
- [ ] **P49 · Hacer** (añadido 2026-10-15): añadir iconos SVG a los botones de tema (Claro, Oscuro, Código) del menú Opciones, que ahora no tienen SVG. Petición del usuario.
- [ ] **P57 · Revisar** (no urgente, añadido 2026-10-16): en móvil a 360x640, un destacado sin imagen con tres o más botones de enlace no cabe en alto (la caja de enlaces se recorta unos 27 px por abajo). Hoy no afecta a ningún dato real.

## Publicación e infraestructura

Sin puntos abiertos.

## Limpieza menor

- [ ] **P40 · Hacer** (no urgente): que el error de un JSON mal escrito en `datos/` diga qué archivo falla (ahora solo los errores HTTP lo nombran).
- [ ] **P31 · Revisar**: `.proyecto-tarjeta { position: relative }` quizá sobre desde que se quitó el resaltado.
- [ ] **P32 · Revisar**: el aviso de consola por tipos de enlace desconocidos se repite cada vez que se abre la ventana.

## Hechos

- [x] **P43 · Revisar** (2026-10-21): probar los cambios de la sombra del Panel destacado y su botón-pestaña (sombra animada, botón unido al panel, variables de tema nuevas) en los 3 temas y en móvil.
  - Nota: revisado por el usuario en los 3 temas y en móvil; todo correcto, sin cambios de código.
- [x] **P07 · Revisar** (2026-10-21): vista de móvil con los datos reales.
  - Nota: revisado por el usuario en móvil con los datos finales; la Línea de tiempo, la introducción, Proyectos, Méritos, Estudios y Experiencia se ven bien (los logos de empresa quedan en P60).
- [x] **P33 · Hacer** (2026-10-21): ajustes de móvil y pulido de la Línea de tiempo.
  - Nota: el usuario confirma que en móvil la Línea de tiempo se ve perfecta, sin cambios de código.
- [x] **P42 · Revisar** (2026-10-21): los nombres a 45° de periodos cercanos se pisaban ("QA Tester…" y "Desarrollador de videojuegos").
  - Nota: el usuario confirma que ya no se pisan los nombres de la Línea de tiempo; si vuelve a pasar, se resolverá con P38.
- [x] **P34 · Revisar** (2026-10-21): el hueco reservado a la estrella cortaba antes los títulos de las tarjetas con mérito.
  - Nota: revisado por el usuario y dado por bueno, sin cambios de código (los títulos de las tarjetas con estrella se leen bien).
- [x] **P14 · Hacer** (2026-10-21): sustituir el contenido "[Provisional]".
  - Nota: comprobado que ya no queda ninguna marca "Provisional" en `datos/`.
- [x] **P17 · Hacer** (2026-10-21): crear los proyectos reales y cambiar sus referencias del catálogo por el id del proyecto.
  - Nota: el usuario confirma que todos los proyectos reales están creados.
- [x] **P18 · Revisar** (2026-10-21): "Proyecto provisional 1" tenía `enCurso: true` puesto para pruebas.
  - Nota: el proyecto provisional ya no existe.
- [x] **P16 · Hacer** (2026-10-21): crear `recursos/` con las imágenes `low`/`high` de los proyectos y las `img` del catálogo de referencias.
  - Nota: el usuario confirma que todas las imágenes están subidas.
- [x] **P26 · Hacer** (2026-10-19): activar GitHub Pages y comprobar la web publicada.
  - Nota: GitHub Pages activado; el usuario ha comprobado que la web en https://popletox.github.io/Portfolio_web/ funciona bien.
- [x] **P27 · Revisar** (2026-10-19): revisión tras publicar.
  - Nota: el usuario ha revisado el menú de compartir en móvil, los navegadores y el lector de pantalla, y funciona correctamente.
- [x] **P28 · Hacer** (2026-10-19): rellenar el [`.gitignore`](../.gitignore).
  - Nota: reglas preventivas agrupadas: entorno (`.env`, `.env.*`), dependencias (`node_modules/`), logs (`*.log`, `npm-debug.log*`), sistema (`Thumbs.db`, `desktop.ini`, `.DS_Store`), editor (`.vscode/`) y Claude Code (`.claude/settings.local.json`). En `.claude/` solo se ignora `settings.local.json`; `settings.json` y `agents/` siguen en el repositorio. Ningún archivo rastreado queda ignorado.
- [x] **P15 · Hacer** (2026-10-19): sustituir los enlaces provisionales `#`.
  - Nota: ya no quedan enlaces `#` ni `[TODO]` en `datos/` ni en `index.html`. El último era el LinkedIn del proyecto «Portfolio web» (subido en el commit 4a8dd7f, donde también se quitó un botón «Ver Web» sin URL).
- [x] **P58 · Hacer** (2026-10-17): recortar el logo de Playoffnations (`recursos/Logos/playoffnations-logo.webp`), que se veía pequeño por el margen transparente.
  - Nota: recortado por el usuario con un editor.
- [x] **P29 · Hacer** (2026-10-17): corregir [`docs/estructura-proyecto.md`](estructura-proyecto.md), que decía que `recursos/` aún no existía.
  - Nota: la carpeta `recursos/` ya existe (`Documentos/`, `Iconos/`, `Imagenes/` y `Logos/`) y el documento la describe correctamente; no quedaba nada más por hacer.
- [x] **P09 · Revisar** (2026-10-16): el bocadillo "Enlace copiado" sale debajo del botón en proyectos largos y en móvil.
  - Nota: revisado por el usuario y dado por bueno, sin cambios de código.
- [x] **P56 · Revisar** (2026-10-16): enlaces de ejemplo del primer destacado de `datos/datos-destacados.json`.
  - Nota: sustituidos por los reales; el primer destacado enlaza al GitHub del repositorio (https://github.com/popletox/Portfolio_web) y ya no hay «Ver más» a `example.com`.
- [x] **P20 · Hacer** (descartado 2026-10-16): diseño propio del tema Cómic.
  - Nota: el tema Cómic se ha eliminado por decisión del usuario (quedan Claro, Oscuro y Código). Los puntos históricos que hablan de «4 temas» o de Cómic (P48, P50) se refieren al estado anterior.
- [x] **P06 · Decidir** (2026-10-16): arrastrar con el ratón o un "slider" visible para desplazar la Línea de tiempo.
  - Decisión: arrastre con el ratón, sin slider visible. Ver [`diseno-portfolio.md`](diseno-portfolio.md).
- [x] **P55 · Hacer** (2026-10-16): blindar las llamadas a `window.matchMedia` de `main.js` y `opciones.js`.
  - Decisión: sin `matchMedia` (o si falla) se asume que el visitante prefiere reducir el movimiento. Resuelto con `consultarMedios`; ver [`diseno-portfolio.md`](diseno-portfolio.md).
- [x] **P23 · Decidir** (2026-10-16): tema inicial Claro o seguir el del sistema.
  - Decisión: sigue al sistema (guardado > `prefers-color-scheme: dark` → Oscuro > Claro) y, mientras no se elija tema, sigue sus cambios en vivo. Ver [`temas.md`](temas.md).
- [x] **P54 · Hacer** (2026-10-16): sustituir los méritos provisionales por los reales.
  - Nota: `datos/datos-meritos.json` ya contiene los cuatro méritos reales, todos con entidad y proyecto.
- [x] **P35 · Hacer** (2026-10-16): estrella de reconocimiento en todas las tarjetas de proyecto con mérito (Proyectos, Referencias de Experiencia y Estudios, Línea de tiempo), salvo la del proyecto dentro de la tarjeta de mérito.
  - Nota: ver [`diseno-portfolio.md`](diseno-portfolio.md).
- [x] **P13 · Decidir** (2026-10-16): no se navega a los méritos ni tienen ventana propia.
  - Decisión: los méritos referencian al proyecto; desde el proyecto solo se ven sus méritos, en la franja «Reconocimiento» de su detalle.
- [x] **P53 · Hacer** (2026-10-16): paso 3 del rediseño de méritos: franja «Reconocimiento» en el detalle del proyecto, entre el contenido y los enlaces, con el título y la descripción del premio.
  - Nota: ver [`diseno-portfolio.md`](diseno-portfolio.md).
- [x] **P36 · Decidir** (2026-10-16): rework de la sección «Méritos y reconocimientos» y de cómo se muestran los méritos en la web.
  - Nota: hechos los tres pasos (tarjeta fija de mérito, estrella sin tooltip en P52 y franja en el detalle en P53). Sigue abierto P51 (formato de las tarjetas de proyecto en los méritos); P54 (méritos reales) ya está hecho.
- [x] **P52 · Hacer** (2026-10-16): paso 2 del rediseño de méritos: quitar el tooltip de la estrella de la Línea de tiempo.
  - Nota: la estrella es solo una marca decorativa (`aria-hidden`); los títulos se anuncian en el `aria-label` de la tarjeta.

- [x] **P04 · Decidir** (2026-10-15): el primer año no tenía etiqueta si el eje empezaba a mitad de año.
  - Decisión: el eje empieza siempre en enero del año del dato más antiguo (con su marca y etiqueta de año) y, por la izquierda, tiene el mismo degradado que hacia el futuro por la derecha (simétrico). Ver [`diseno-portfolio.md`](diseno-portfolio.md).
- [x] **P01 · Decidir** (2026-10-15): qué hacer cuando el conector de una tarjeta de proyecto queda tapado por otra tarjeta en proyectos de meses consecutivos.
  - Decisión: el conector se desvanece sutilmente antes de la tarjeta que lo tapa y reaparece gradualmente al otro lado, sin lógica en la línea; se hace con «halos» en las tarjetas (variables `--alto-halo-tarjeta-cronologia` y `--ranura-halo-tarjeta-cronologia`). Ver [`diseno-portfolio.md`](diseno-portfolio.md).
  - Ajuste de esquinas (2026-10-15): cada halo se extiende `--radio-medio` bajo la tarjeta en color sólido para que el conector no reaparezca en las esquinas redondeadas.
  - Superada (2026-10-15): la limitación de dos proyectos del mismo mes a distinta altura (el conector del de abajo caía en la ranura del de arriba) ya no existe: hay una sola línea por mes hasta la tarjeta más alejada (clase `cronologia-proyecto--atravesada`).
  - Limitación: el efecto depende de que el fondo tras las tarjetas sea `--color-fondo-suave` (los 4 temas usan color liso).
- [x] **P50 · Decidir** (2026-10-15): hover de los iconos de marca en la cabecera. En los temas Claro y Cómic el fondo de acento (`#1a73e8`) casi se confundía con el azul del logo de LinkedIn (`#0077B7`).
  - Nota: resuelto usando `--color-boton-enlaces-hover` como fondo al pasar el ratón (y con Opciones abierto) en los botones de la cabecera; el icono conserva `--color-texto`.
- [x] **P37 · Hacer** (2026-10-15): rediseñar los enlaces de la ventana de detalle de un proyecto. El JSON tendrá más categorías de enlace (steam, github, itch.io y posiblemente más); dejarán de mostrarse como URL de texto y pasarán a ser botones circulares con el logo de su categoría. Los logos serán SVG guardados en `recursos/`.
  - Relacionado con P16 (creación de `recursos/`).
  - Relacionado con P32 (aviso de consola por tipos de enlace desconocidos): conviene revisarlo al ampliar las categorías.
  - Nota: hecho en la ventana de detalle, la cabecera y el visor (iconos en `recursos/Iconos/`, máscara CSS `.icono-mascara`; desde 2026-10-16 todos son monocromos, sin colores de marca). Ver [`diseno-portfolio.md`](diseno-portfolio.md).
  - Decisión: botones de icono por categoría implementados (github, itch.io, steam, linkedin, instagram, pdf-download, más web-generico como botón de texto). Si hace falta un tipo nuevo, se abrirá un pendiente aparte.
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
