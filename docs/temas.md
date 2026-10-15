# Temas

Cada tema es un archivo en `estilos/temas/<id>.css` que define **todas** las variables de esta lista. `estilos/comun.css` solo usa `var(--...)`: no contiene colores ni fuentes fijos.

- `claro.css` es el tema por defecto: su selector es `:root, :root[data-tema="claro"]`, así se aplica aunque falte `data-tema`.
- Los demás temas usan `:root[data-tema="<id>"]` (más específico que `:root`, así que ganan sin depender del orden) y se enlazan en `index.html` después de `claro.css`.
- Cada tema declara también `color-scheme` (`light` o `dark`).
- `scripts/temas.js` pone `data-tema` en `<html>` antes del primer pintado, guarda la elección en `localStorage` (clave `tema`) y expone `window.Temas = { lista, actual(), aplicar(id) }`.
- `scripts/opciones.js` genera los botones del bocadillo de Opciones (engranaje de la cabecera) a partir de `window.Temas.lista`. Al cambiar de tema pone durante un momento la clase `cambiando-tema` en `<html>` para que los colores cambien con una transición breve (sin ella si se prefiere movimiento reducido) y ajusta `<meta name="theme-color">` al `--color-fondo` del tema.

## Temas disponibles

| id | Nombre | Archivo | Descripción |
| --- | --- | --- | --- |
| `claro` | Claro | `claro.css` | Tema por defecto. |
| `oscuro` | Oscuro | `oscuro.css` | Provisional: fondo gris muy oscuro, texto claro y acento azul claro. |
| `codigo` | Código | `codigo.css` | Provisional: apariencia de editor oscuro, fuente monoespaciada y un color para títulos, fechas, subtítulos (tecnologías) y enlaces. |
| `comic` | Cómic | `comic.css` | Provisional: copia de Claro, pendiente de diseño. |

## Cómo añadir un tema

1. Crea `estilos/temas/<id>.css` con el selector `:root[data-tema="<id>"]`, `color-scheme` y **todas** las variables de la tabla de abajo (lo más fácil es copiar `oscuro.css`).
2. Añade una entrada a `TEMAS` en `scripts/temas.js`: `{ id: '<id>', nombre: 'Nombre visible', icono: 'sol' | 'luna' | 'terminal' | 'comic' }`. Para un icono nuevo, añádelo al mapa `ICONOS` de `scripts/opciones.js`.
3. Enlaza el CSS en `index.html`, después de `claro.css`.

## Variables obligatorias

| Variable | Uso |
| --- | --- |
| `--fuente-base` | Tipografía de toda la página. |
| `--color-fondo` | Fondo de la página y de la cabecera; píldoras de filtro dentro de Proyectos; tarjetas de Referencias y de Proyectos; ventana de detalle de un proyecto. |
| `--color-fondo-suave` | Fondo de títulos de sección (y de la sección entera cuando está abierta), botones de contacto y de Opciones, pie y franja de la Línea de tiempo (entra y sale con un degradado desde y hacia `--color-fondo`); fondo de los años del eje de la Línea de tiempo (tapa los conectores que pasan por debajo). |
| `--color-fondo-suave-hover` | Hover sobre `--color-fondo-suave` (títulos de sección, filtros, títulos de entradas y tarjetas de Referencias y de Proyectos) y sobre los temas del bocadillo de Opciones. |
| `--color-panel` | Fondo del panel destacado y de su botón-pestaña (forman una sola pieza). Debe distinguirse de `--color-fondo`. |
| `--color-fondo-enlaces` | Fondo de la región de enlaces del detalle de proyecto. Debe distinguirse de `--color-fondo`. Claro `#e3e7ed`, Oscuro `#2b2f33`, Código `#333337`, Cómic `#e3e7ed` (copia de Claro). |
| `--color-boton-enlaces-hover` | Fondo de los botones de esa región al pasar el ratón. Claro `#d3d9e1`, Oscuro `#3a3f44`, Código `#3c3c3c`, Cómic `#d3d9e1` (copia de Claro). |
| `--color-texto` | Texto principal; marcas de año del eje y nombres de estudios y experiencias de la Línea de tiempo. |
| `--color-texto-suave` | Texto secundario: introducción, subtítulo de la cabecera, flechas, separadores, título del bocadillo de Opciones; línea, marcas de mes, barra de scroll y conectores de las tarjetas de proyectos de la Línea de tiempo. |
| `--color-titulo` | Nombre de la cabecera, títulos de sección, de entradas y del panel destacado (en Claro, igual que `--color-texto`). |
| `--color-fecha` | Fechas de las líneas de tiempo y etiquetas de año de Proyectos y años del eje de la Línea de tiempo (en Claro, igual que `--color-texto-suave`). |
| `--color-subtitulo` | Subtítulo de las entradas: empresa o institución, y categoría (tecnología) de las tarjetas de Proyectos (en Claro, igual que `--color-texto-suave`). |
| `--color-acento` | Hover de contacto y de Opciones, filtro activo y tema activo en el bocadillo. |
| `--color-texto-sobre-acento` | Texto o icono sobre `--color-acento`. |
| `--color-enlace` | Enlaces fuera de las secciones y del panel destacado (p. ej. enlaces internos de la ventana de detalle de un proyecto). |
| `--color-enlace-seccion` | Enlaces dentro de las secciones, sobre `--color-fondo-suave` (contraste AA; puede ser `var(--color-enlace)`). |
| `--color-enlace-panel` | Enlaces del panel destacado, sobre `--color-panel` (contraste AA; puede ser `var(--color-enlace)`). |
| `--color-foco` | Contorno de foco con teclado. |
| `--color-menu-fondo` | Fondo del bocadillo de Opciones y del aviso de compartir, y de sus picos. |
| `--color-sombra` | Sombra del bocadillo de Opciones y del aviso de compartir. |
| `--color-degradado-cabecera-inicio` | Inicio del degradado bajo la cabecera (normalmente `var(--color-fondo)`). |
| `--color-degradado-cabecera-fin` | Final del degradado (normalmente `transparent`). |
| `--color-linea-tiempo` | Línea vertical de las líneas de tiempo y líneas horizontales de año de Proyectos. |
| `--color-punto-tiempo` | Punto de cada entrada. |
| `--color-periodo-estudio` | Barras de estudios de la Línea de tiempo, su conector vertical y el punto donde empieza el nombre (azul; más claro en temas oscuros). El nombre va en `--color-texto`. |
| `--color-periodo-experiencia` | Barras de experiencias de la Línea de tiempo, su conector vertical y el punto donde empieza el nombre (rojo; más claro en temas oscuros). El nombre va en `--color-texto`. |
| `--color-estrella` | Estrella de reconocimiento de las tarjetas de proyecto con mérito en la Línea de tiempo (dorado). |
| `--color-fondo-estrella` | Fondo circular de esa estrella. |
| `--color-miniatura-provisional` | Miniaturas, imagen del visor y tarjetas de Referencias y de Proyectos sin imagen real. |
| `--color-destacado-provisional` | Cuadrado provisional del panel destacado. |
| `--color-fondo-visor` | Fondo oscurecido tras la imagen ampliada y tras la ventana de detalle de un proyecto. |
| `--color-boton-visor` | Botón de cerrar del visor y botones de cerrar y compartir de la ventana de detalle. |
| `--color-boton-visor-hover` | Los mismos botones al pasar el ratón. |
| `--color-boton-visor-texto` | Aspa de cerrar e icono de compartir de esos botones. |
| `--color-boton-panel-texto` | Flecha del botón-pestaña, sobre `--color-panel` (contraste ≥ 3:1; normalmente `var(--color-texto-suave)`). |
| `--color-borde-boton-panel` | Filo de 1px del botón-pestaña con el panel cerrado, para distinguirlo de la página. |
| `--color-sombra-panel` | Sombra del panel destacado (solo abierto) y de su botón-pestaña, proyectada hacia la página para que parezcan por encima. Semitransparente; en temas oscuros, más opaca (p. ej. 0.6) para que se note. |
| `--desenfoque-sombra-panel` | Desenfoque de esa sombra (p. ej. `16px` en claros, algo más en oscuros). No pasar de unos `40px`: el botón recorta su sombra a `--margen-sombra-panel` (4rem, en `comun.css`). |
