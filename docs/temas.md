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

## Cómo añadir un tema

1. Crea `estilos/temas/<id>.css` con el selector `:root[data-tema="<id>"]`, `color-scheme` y **todas** las variables de la tabla de abajo (lo más fácil es copiar `oscuro.css`).
2. Añade una entrada a `TEMAS` en `scripts/temas.js`: `{ id: '<id>', nombre: 'Nombre visible', icono: 'sol' | 'luna' | 'terminal' }`. Para un icono nuevo, añádelo al mapa `ICONOS` de `scripts/opciones.js`.
3. Enlaza el CSS en `index.html`, después de `claro.css`.

## Variables obligatorias

| Variable | Uso |
| --- | --- |
| `--fuente-base` | Tipografía de toda la página. |
| `--color-fondo` | Fondo de la página y de la cabecera. |
| `--color-fondo-suave` | Fondo de títulos de sección, botones de contacto y de Opciones, filtros, hover de entradas y pie. |
| `--color-fondo-suave-hover` | Hover sobre `--color-fondo-suave` (títulos de sección y filtros) y sobre los temas del bocadillo de Opciones. |
| `--color-panel` | Fondo del panel destacado. |
| `--color-texto` | Texto principal. |
| `--color-texto-suave` | Texto secundario: introducción, subtítulo de la cabecera, flechas, separadores, título del bocadillo de Opciones. |
| `--color-titulo` | Nombre de la cabecera, títulos de sección, de entradas y del panel destacado (en Claro, igual que `--color-texto`). |
| `--color-fecha` | Fechas de las líneas de tiempo (en Claro, igual que `--color-texto-suave`). |
| `--color-subtitulo` | Subtítulo de las entradas: empresa, institución o tecnología (en Claro, igual que `--color-texto-suave`). |
| `--color-acento` | Hover de contacto y de Opciones, filtro activo y tema activo en el bocadillo. |
| `--color-texto-sobre-acento` | Texto o icono sobre `--color-acento`. |
| `--color-enlace` | Enlaces a proyectos. |
| `--color-foco` | Contorno de foco con teclado. |
| `--color-menu-fondo` | Fondo del bocadillo de Opciones y de su pico. |
| `--color-sombra` | Sombra del bocadillo de Opciones. |
| `--color-degradado-cabecera-inicio` | Inicio del degradado bajo la cabecera (normalmente `var(--color-fondo)`). |
| `--color-degradado-cabecera-fin` | Final del degradado (normalmente `transparent`). |
| `--color-linea-tiempo` | Línea vertical de las líneas de tiempo. |
| `--color-punto-tiempo` | Punto de cada entrada. |
| `--color-resaltado` | Parpadeo del proyecto destino de "Ver proyecto" (semitransparente). |
| `--color-miniatura-provisional` | Miniaturas e imagen del visor sin imagen real. |
| `--color-destacado-provisional` | Cuadrado provisional del panel destacado. |
| `--color-fondo-visor` | Fondo oscurecido tras la imagen ampliada. |
| `--color-boton-visor` | Botón de cerrar del visor. |
| `--color-boton-visor-hover` | Botón de cerrar del visor al pasar el ratón. |
| `--color-boton-visor-texto` | Aspa del botón de cerrar del visor. |
| `--color-boton-panel` | Botón-pestaña del panel destacado. |
| `--color-boton-panel-texto` | Flecha del botón-pestaña. |
