# Temas

Cada tema es un archivo en `estilos/temas/<id>.css` que define **todas** las variables de esta lista. `estilos/comun.css` solo usa `var(--...)`: no contiene colores ni fuentes fijos.

- `claro.css` es el tema de reserva (el que se usa si no se puede saber la preferencia del sistema): su selector es `:root, :root[data-tema="claro"]`, así se aplica aunque falte `data-tema`.
- Los demás temas usan `:root[data-tema="<id>"]` (más específico que `:root`, así que ganan sin depender del orden) y se enlazan en `index.html` después de `claro.css`.
- Cada tema declara también `color-scheme` (`light` o `dark`).
- `scripts/temas.js` pone `data-tema` en `<html>` antes del primer pintado, guarda la elección en `localStorage` (clave `tema`) y expone `window.Temas = { lista, evento, actual(), aplicar(id, sinGuardar) }`.

## Tema inicial y seguimiento del sistema

El tema inicial se elige por prioridad:

1. Tema guardado y válido en `localStorage` (clave `tema`). Un tema guardado que ya no existe (p. ej. `comic`, eliminado) se ignora y cuenta como «sin elección»: se aplica el del sistema y se siguen sus cambios.
2. `prefers-color-scheme: dark` → `oscuro`.
3. `claro` (también si no se puede saber la preferencia).

- Se aplica en el `<head>`, antes del primer pintado.
- Mientras el visitante no haya elegido tema, la web sigue en vivo los cambios del sistema, con la misma transición que al elegir en Opciones, y actualiza `aria-pressed` y `<meta name="theme-color">`.
- Al elegir un tema en Opciones se guarda y el sistema deja de mandar. Un indicador en memoria lo garantiza aunque `localStorage` falle.
- No hay opción «Sistema» en el menú. Código nunca se elige automáticamente.

### Cómo funciona el seguimiento

- `scripts/temas.js` escucha `change` de `matchMedia('(prefers-color-scheme: dark)')` (con `addListener` como alternativa en navegadores antiguos). Lanza en `document` el evento cancelable `temasistema` (`detail.tema` = id del tema) y, si nadie lo cancela, aplica el tema él mismo.
- Si el navegador no tiene `matchMedia` (o falla), `temas.js` no sigue al sistema y el tema inicial es el claro.
- `scripts/opciones.js` escucha ese evento, lo cancela y llama a su `elegirTema(tema, true)`, que pinta con transición y actualiza botones y `theme-color` sin guardar.

### API de `window.Temas`

| Miembro | Descripción |
| --- | --- |
| `lista` | Temas disponibles (`id`, `nombre`, `icono`). |
| `evento` | Nombre del evento del sistema: `'temasistema'`. |
| `actual()` | Id del tema aplicado. |
| `aplicar(id, sinGuardar)` | Aplica el tema. Con `sinGuardar` a `true` solo lo pinta, sin guardarlo ni dejar de seguir al sistema. |
- `scripts/opciones.js` genera los botones del bocadillo de Opciones (engranaje de la cabecera) a partir de `window.Temas.lista`. Al cambiar de tema pone durante un momento la clase `cambiando-tema` en `<html>` para que los colores cambien con una transición breve (sin ella si se prefiere movimiento reducido) y ajusta `<meta name="theme-color">` al `--color-fondo` del tema.

## Temas disponibles

| id | Nombre | Archivo | Descripción |
| --- | --- | --- | --- |
| `claro` | Claro | `claro.css` | Tema de reserva; también el inicial si el sistema no prefiere oscuro. |
| `oscuro` | Oscuro | `oscuro.css` | Provisional: fondo gris muy oscuro, texto claro y acento azul claro. |
| `codigo` | Código | `codigo.css` | Provisional: apariencia de editor oscuro, fuente monoespaciada y un color para títulos, fechas, subtítulos (tecnologías) y enlaces. |

## Cómo añadir un tema

1. Crea `estilos/temas/<id>.css` con el selector `:root[data-tema="<id>"]`, `color-scheme` y **todas** las variables de la tabla de abajo (lo más fácil es copiar `oscuro.css`).
2. Añade una entrada a `TEMAS` en `scripts/temas.js`: `{ id: '<id>', nombre: 'Nombre visible', icono: 'sol' | 'luna' | 'terminal' }`. Para un icono nuevo, añádelo al mapa `ICONOS` de `scripts/opciones.js`.
3. Enlaza el CSS en `index.html`, después de `claro.css`.

## Variables obligatorias

| Variable | Uso |
| --- | --- |
| `--fuente-base` | Tipografía de toda la página. |
| `--color-fondo` | Fondo de la página y de la cabecera; píldoras de filtro dentro de Proyectos; tarjetas de Referencias y de Proyectos; ventana de detalle de un proyecto. |
| `--color-fondo-suave` | Fondo de títulos de sección (y de la sección entera cuando está abierta), botones de contacto y de Opciones, pie y franja de la Línea de tiempo (entra y sale con un degradado desde y hacia `--color-fondo`); fondo de los años del eje de la Línea de tiempo (tapa los conectores que pasan por debajo). |
| `--color-fondo-suave-hover` | Hover sobre `--color-fondo-suave` (títulos de sección, filtros, títulos de entradas y tarjetas de Referencias y de Proyectos) y sobre los temas y el interruptor Efectos del bocadillo de Opciones. |
| `--color-panel` | Fondo del panel destacado y de su botón-pestaña (forman una sola pieza). Debe distinguirse de `--color-fondo`. |
| `--color-fondo-enlaces` | Fondo de la región de enlaces y de la franja de reconocimiento del detalle de proyecto. Debe distinguirse de `--color-fondo`. Claro `#e3e7ed`, Oscuro `#2b2f33`, Código `#333337`. |
| `--color-boton-enlaces-hover` | Fondo al pasar el ratón de todos los botones redondos de icono (cabecera, región de enlaces, Compartir y Cerrar del detalle y Cerrar del visor), a través de `--boton-redondo-fondo-hover`. Claro `#d3d9e1`, Oscuro `#3a3f44`, Código `#3c3c3c`. |
| `--color-texto` | Texto principal; marcas de año del eje y nombres de estudios y experiencias de la Línea de tiempo. |
| `--color-texto-suave` | Texto secundario: introducción, subtítulo de la cabecera, flechas, separadores, título del bocadillo de Opciones, círculo del interruptor Efectos apagado; línea, marcas de mes, barra de scroll y conectores de las tarjetas de proyectos de la Línea de tiempo. |
| `--color-titulo` | Nombre de la cabecera, títulos de sección, de entradas y del panel destacado (en Claro, igual que `--color-texto`). |
| `--color-fecha` | Fechas de las líneas de tiempo y etiquetas de año de Proyectos y años del eje de la Línea de tiempo (en Claro, igual que `--color-texto-suave`). |
| `--color-subtitulo` | Subtítulo de las entradas: empresa o institución, y categoría (tecnología) de las tarjetas de Proyectos (en Claro, igual que `--color-texto-suave`). |
| `--color-acento` | Hover de contacto y de Opciones, filtro activo, tema activo en el bocadillo y píldora del interruptor Efectos encendido. |
| `--color-texto-sobre-acento` | Texto o icono sobre `--color-acento`; círculo del interruptor Efectos encendido. |
| `--color-enlace` | Enlaces fuera de las secciones y del panel destacado (p. ej. enlaces internos de la ventana de detalle de un proyecto). |
| `--color-enlace-seccion` | Enlaces dentro de las secciones, sobre `--color-fondo-suave` (contraste AA; puede ser `var(--color-enlace)`). |
| `--color-enlace-panel` | Enlaces del panel destacado, sobre `--color-panel` (contraste AA; puede ser `var(--color-enlace)`). |
| `--color-foco` | Contorno de foco con teclado (también en el interruptor Efectos). |
| `--color-menu-fondo` | Fondo del bocadillo de Opciones y del aviso de compartir, y de sus picos. |
| `--color-sombra` | Sombra del bocadillo de Opciones y del aviso de compartir. |
| `--color-degradado-cabecera-inicio` | Inicio del degradado bajo la cabecera (normalmente `var(--color-fondo)`). |
| `--color-degradado-cabecera-fin` | Final del degradado (normalmente `transparent`). |
| `--color-linea-tiempo` | Línea vertical de las líneas de tiempo y líneas horizontales de año de Proyectos; separador del interruptor Efectos en Opciones. |
| `--color-punto-tiempo` | Punto de cada entrada. |
| `--color-periodo-estudio` | Barras de estudios de la Línea de tiempo, su conector vertical y el punto donde empieza el nombre (azul; más claro en temas oscuros). El nombre va en `--color-texto`. |
| `--color-periodo-experiencia` | Barras de experiencias de la Línea de tiempo, su conector vertical y el punto donde empieza el nombre (rojo; más claro en temas oscuros). El nombre va en `--color-texto`. |
| `--color-estrella` | Estrella de reconocimiento (dorado) de todas las tarjetas de proyecto con mérito (Proyectos, Referencias y Línea de tiempo; no la del propio mérito) y del título de la franja de reconocimiento del detalle de proyecto. |
| `--color-fondo-estrella` | Fondo circular de esa estrella. |
| `--color-miniatura-provisional` | Cuadrado provisional (verde) de miniaturas, imagen del visor y tarjetas de Referencias y de Proyectos que no tienen imagen real. Con imagen, el fondo es `--color-fondo-imagen` (ver abajo). |
| `--color-destacado-provisional` | Cuadrado provisional del panel destacado. |
| `--color-fondo-visor` | Fondo oscurecido tras la imagen ampliada y tras la ventana de detalle de un proyecto. |
| `--color-boton-panel-texto` | Flecha del botón-pestaña, sobre `--color-panel` (contraste ≥ 3:1; normalmente `var(--color-texto-suave)`). |
| `--color-borde-boton-panel` | Filo de 1px del botón-pestaña con el panel cerrado, para distinguirlo de la página; también el borde de la región de enlaces y de la franja de reconocimiento del detalle de proyecto. |
| `--color-sombra-panel` | Sombra del panel destacado (solo abierto) y de su botón-pestaña, proyectada hacia la página para que parezcan por encima. Semitransparente; en temas oscuros, más opaca (p. ej. 0.6) para que se note. |
| `--filtro-logo-aclarado` | Filtro CSS de los logos de empresa de Experiencia con `logoAclararEnOscuro` (clase `.linea-tiempo-logo--aclarar-oscuro`). Claro `none`, Oscuro `brightness(0) invert(0.9)`, Código `brightness(0) invert(0.83)`. Si un tema no la define, se usa `none`. Se aplica también cuando el tema viene de `prefers-color-scheme`, porque `temas.js` pone `data-tema` en `<html>`. |
| `--desenfoque-sombra-panel` | Desenfoque de esa sombra (p. ej. `16px` en claros, algo más en oscuros). No pasar de unos `40px`: el botón recorta su sombra a `--margen-sombra-panel` (4rem, en `comun.css`). |

## Excepción: `--color-fondo-imagen`

`--color-fondo-imagen` (`#141414`, casi negro, no `#000`) es la única variable `--color-*` que NO se define en los temas: está fija en el `:root` de `estilos/comun.css` y es igual en todos. Es el fondo sobre el que se ven las zonas transparentes de las imágenes de proyecto (p. ej. un logo con fondo transparente) en miniaturas, tarjetas de Referencias, panel Destacado y visor; así el aspecto no depende del tema. No hay que añadirla a un tema nuevo.

`--margen-derecho-detalle-tiempo` también está solo en `estilos/comun.css` (no es de tema): margen fijo entre el contenido desplegado de las entradas de la línea de tiempo y el borde derecho de la sección (`calc(var(--espacio) * 1.25)`; `1rem` en `max-width: 768px`). No hay que añadirla a un tema nuevo.

`--alto-logo-tiempo` (2.5rem en escritorio, 1.75rem en `max-width: 768px`) y `--separacion-logo-tiempo` (0.375rem en escritorio, 0.25rem en móvil) también están solo en `estilos/comun.css` (no son de tema): alto máximo del logo de empresa en las entradas de Experiencia y `margin-top` del logo respecto a la fecha. No hay que añadirlas a un tema nuevo.

`--color-confeti-1…5`, `--duracion-caida-confeti`, `--factor-confeti` y `--giro-confeti` también están solo en `estilos/comun.css` (bloque "Efectos de las secciones", definidas en `.efecto-confeti`; no son de tema): colores y animación del confeti de Méritos. Por defecto los colores reutilizan `--color-acento`, `--color-periodo-experiencia` y `--color-estrella` (más dos fijos), así que siguen al tema; un tema puede sobrescribirlas si quiere otra paleta. No hay que añadirlas a un tema nuevo.

## Botones redondos de icono

Los temas no definen colores propios para los botones redondos (cabecera, enlaces del detalle, Compartir y Cerrar del detalle, Cerrar del visor): todos usan el patrón común de `:root` en `estilos/comun.css`, con variables sin prefijo `--color-` a propósito para que no sean variables de tema: `--boton-redondo-fondo` (= `--color-fondo-suave`), `--boton-redondo-fondo-hover` (= `--color-boton-enlaces-hover`) y `--boton-redondo-icono` (= `--color-texto`). Así siguen el tema, sin acento al pasar el ratón. Los antiguos `--color-boton-visor`, `--color-boton-visor-hover` y `--color-boton-visor-texto` se han eliminado. `--color-fondo-visor` se mantiene (fondo oscurecido tras el visor y la ventana de detalle). Detalle y modo de añadir un botón nuevo en [`diseno-portfolio.md`](diseno-portfolio.md).
