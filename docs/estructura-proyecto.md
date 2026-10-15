# Estructura del proyecto

Portfolio de una sola página con HTML, CSS y JavaScript, sin frameworks.

| Ruta | Función |
| --- | --- |
| `index.html` | Página principal, en la raíz. Define el contenido y la estructura, sin estilos visuales incrustados. |
| `estilos/` | CSS común (`comun.css`): distribución, adaptación a móvil y transiciones. Sin colores ni fuentes fijos. |
| `estilos/temas/` | Un archivo CSS por tema, incluido el principal (`claro.css`, tema por defecto). Define colores, tipografías y estilos propios mediante variables compartidas. Lista de variables en `docs/temas.md`. |
| `scripts/` | JavaScript para desplegables, filtros, temas y otros comportamientos. `temas.js` se carga en el `<head>` sin `defer` para aplicar el tema guardado antes del primer pintado. |
| `datos/` | Contenido editable de la web en JSON, repartido en `datos-genericos.json`, `datos-destacados.json`, `datos-proyectos.json`, `datos-experiencia.json`, `datos-meritos.json` y `datos-estudios.json`: introducción, destacados, proyectos, referencias, experiencia, méritos y estudios. Formato en `docs/formato-datos.md`. |
| `recursos/` | Imágenes, iconos y otros recursos. Subcarpetas: `Imagenes/` (una carpeta por motor, `Unity/` y `UnrealEngine/`, y dentro una por proyecto, p. ej. `Unity/BeansOut/` y `UnrealEngine/GloomReaper/`, con capturas `IMG-xx.png` y `Title.png`), `Documentos/` (PDF descargables de proyectos, p. ej. el del TFG de Beans out) e `Iconos/` (10 SVG de los botones: `github-icon.svg`, `itch-io-icon.svg`, `steam-icon.svg`, `linkedin-icon.svg`, `instagram-icon.svg`, `download-pdf-icon.svg`, `email-icon.svg`, `settings-icon.svg`, `share-icon.svg` y `close-icon.svg`). El contenido de `Imagenes/` y `Documentos/` actual son archivos de prueba, no definitivos. |
| `docs/` | Documentación: este archivo, `diseno-portfolio.md`, con los requisitos de diseño, y `formato-datos.md`, con el formato de los archivos JSON de `datos/`, `temas.md`, con las variables que debe definir cada tema, y `pendientes.md`, con el registro de tareas, revisiones y decisiones pendientes. |

Antes de implementar una tarea, consulta `docs/diseno-portfolio.md` y respeta esta organización. Crea los archivos necesarios y conecta correctamente HTML, CSS y JavaScript.
