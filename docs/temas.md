# Temas

Cada tema es un archivo en `estilos/temas/<id>.css` que define **todas** las variables de esta lista. `estilos/comun.css` solo usa `var(--...)`: no contiene colores ni fuentes fijos.

- `claro.css` es el tema por defecto: su selector es `:root, :root[data-tema="claro"]`, así se aplica aunque falte `data-tema`.
- Los demás temas usan `:root[data-tema="<id>"]` (más específico que `:root`, así que ganan sin depender del orden) y se enlazan en `index.html` después de `claro.css`.
- Cada tema declara también `color-scheme` (`light` o `dark`).
- `scripts/temas.js` pone `data-tema` en `<html>` antes del primer pintado, guarda la elección en `localStorage` (clave `tema`) y expone `window.Temas = { lista, actual(), aplicar(id) }`. Al añadir un tema, súmalo a la lista `TEMAS` de ese archivo.

## Variables obligatorias

| Variable | Uso |
| --- | --- |
| `--fuente-base` | Tipografía de toda la página. |
| `--color-fondo` | Fondo de la página y de la cabecera. |
| `--color-fondo-suave` | Fondo de títulos de sección, botones de contacto, filtros, hover de entradas y pie. |
| `--color-fondo-suave-hover` | Hover sobre `--color-fondo-suave` (títulos de sección y filtros). |
| `--color-panel` | Fondo del panel destacado. |
| `--color-texto` | Texto principal. |
| `--color-texto-suave` | Texto secundario: introducción, subtítulos, fechas, flechas, separadores. |
| `--color-acento` | Hover de contacto y filtro activo. |
| `--color-texto-sobre-acento` | Texto o icono sobre `--color-acento`. |
| `--color-enlace` | Enlaces a proyectos. |
| `--color-foco` | Contorno de foco con teclado. |
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
