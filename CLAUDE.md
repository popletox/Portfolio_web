# Portfolio personal

Portfolio web tipo currículum, de una sola página, alojado en GitHub Pages.

## Decisiones del proyecto
- Stack: HTML, CSS y JavaScript vanilla. Sin frameworks ni bundlers.
- Hosting: GitHub Pages, publicando la rama `main` desde la raíz del repositorio, sin paso
  de compilación (sitio estático). Cada push a `main` publica la web.
- Sin base de datos ni backend. Si en el futuro hiciera falta algo interactivo, se valorará aparte.
- Repositorio en GitHub. Commits con Conventional Commits en español.
- Idioma de la web: español (por definir si habrá versión en inglés).

## Contenido previsto
- Datos de contacto (posible barra lateral plegable).
- Experiencia.
- Proyectos.
- Secciones desplegables para ampliar detalles sin recargar la primera vista.

## Estructura de archivos
Detalle en `docs/estructura-proyecto.md`. Resumen del proyecto para visitantes en `README.md`.

## Flujo de trabajo con agentes
- coordinador: habla con el usuario y reparte tareas.
- programador: edita el código y los datos (no los `.md`).
- documentador: mantiene la documentación Markdown (README, `docs/` y pendientes).
- git-gestor: commits y push, solo con aprobación del usuario.
- Flujo: coordinador → programador → documentador → (con permiso) git-gestor.

## Pendientes
- `docs/pendientes.md` es el registro de tareas, revisiones y decisiones pendientes.
- Cuando una tarea complete o decida un punto, o surja uno nuevo, el documentador lo
  actualiza en el mismo ciclo: marcar hecho con fecha, anotar la decisión o añadir el punto.

## README
- `README.md` debe reflejar el estado real del proyecto.
- Si un cambio es importante (nueva sección o funcionalidad, cambio de stack, hosting,
  estructura de carpetas o de agentes) o deja obsoleta alguna parte del README, el
  documentador lo actualiza en el mismo ciclo.
- Los cambios menores (estilos, textos, correcciones) no lo requieren.
