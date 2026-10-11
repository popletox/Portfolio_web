# Estructura del proyecto

Portfolio de una sola página con HTML, CSS y JavaScript, sin frameworks.

| Ruta | Función |
| --- | --- |
| `index.html` | Página principal, en la raíz. Define el contenido y la estructura, sin estilos visuales incrustados. |
| `estilos/` | CSS común (`comun.css`): distribución, adaptación a móvil y transiciones. Sin colores ni fuentes fijos. |
| `estilos/temas/` | Un archivo CSS por tema, incluido el principal (`claro.css`, tema por defecto). Define colores, tipografías y estilos propios mediante variables compartidas. Lista de variables en `docs/temas.md`. |
| `scripts/` | JavaScript para desplegables, filtros, temas y otros comportamientos. `temas.js` se carga en el `<head>` sin `defer` para aplicar el tema guardado antes del primer pintado. |
| `datos/` | Contenido editable de la web en JSON (`contenido.json`): introducción, experiencia, proyectos, méritos y estudios. Formato en `docs/formato-datos.md`. |
| `recursos/` | Imágenes, iconos y otros recursos visuales. |
| `docs/` | Documentación: este archivo, `diseno-portfolio.md`, con los requisitos de diseño, y `formato-datos.md`, con el formato de `datos/contenido.json`, y `temas.md`, con las variables que debe definir cada tema. |

Antes de implementar una tarea, consulta `docs/diseno-portfolio.md` y respeta esta organización. Crea los archivos necesarios y conecta correctamente HTML, CSS y JavaScript.
