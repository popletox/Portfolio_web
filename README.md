# Portfolio web · Miguel Ángel Torrijos

Portfolio personal tipo currículum, de una sola página, de Miguel Ángel Torrijos (desarrollo de videojuegos y software).

Es un proyecto hecho por alguien que quiere aprender: lo uso para aprender a integrar agentes de IA en un proyecto de desarrollo, y es mi primer proyecto de este tipo. Yo dirijo el diseño y las funciones; el código lo genera una IA bajo mi revisión.

## Estructura de agentes

El trabajo se reparte entre agentes de Claude Code, definidos en `.claude/agents/`:

| Agente | Papel |
| --- | --- |
| `coordinador` | Habla con el usuario, planifica y reparte las tareas. No edita archivos. |
| `programador` | Edita los archivos del proyecto (HTML, CSS, JS, datos y documentación). |
| `git-gestor` | Hace los commits (Conventional Commits en español) y el push, solo con aprobación del usuario. |

Flujo: petición → coordinador → programador → revisión → (con permiso) git-gestor.

## Qué tiene la web

- Encabezado fijo con nombre, subtítulo, iconos de contacto y botón de Opciones; en móvil se compacta al bajar.
- Secciones desplegables (Experiencia, Proyectos, Méritos y reconocimientos, Estudios) con líneas de tiempo y entradas que se abren y cierran.
- Filtros de Proyectos por tecnología, generados a partir de los datos.
- Visor de imágenes para ampliar las miniaturas de los proyectos.
- Referencias en tarjetas (cuadrícula con título e imagen) en el detalle de Experiencia, Estudios y Méritos: las de proyectos toman solas su título y primera imagen; las demás, de un catálogo común del JSON. Las que enlazan a un proyecto lo abren, lo centran y lo resaltan; el botón Atrás vuelve al origen.
- Panel Destacado en forma de carrusel (lateral en ordenador, inferior en móvil), cerrable y reabrible.
- Temas Claro, Oscuro, Código y Cómic, elegibles en el menú de Opciones y guardados en el navegador.
- Contenido cargado desde `datos/contenido.json`.
- Nota "Sobre esta web" en el pie.

### Pendiente

- Contenido real: los textos de `datos/contenido.json` son provisionales.
- Diseño propio del tema Cómic (ahora es una copia provisional de Claro).
- Interruptor de "Efectos divertidos" en Opciones y sus animaciones en los títulos.
- Configuración y publicación en Firebase Hosting.

## Tecnologías

- HTML, CSS y JavaScript vanilla, sin frameworks ni bundlers.
- Alojamiento previsto en Firebase Hosting (todavía no hay configuración de Firebase en el repositorio).

## Estructura de carpetas

```
index.html        Página principal
estilos/          CSS común y un archivo por tema en estilos/temas/
scripts/          JavaScript (contenido, interacción, temas y opciones)
datos/            Contenido de la web en JSON
docs/             Documentación del proyecto
.claude/agents/   Definición de los agentes
```

Más detalle en:

- [docs/estructura-proyecto.md](docs/estructura-proyecto.md): organización de archivos.
- [docs/diseno-portfolio.md](docs/diseno-portfolio.md): requisitos de diseño.
- [docs/formato-datos.md](docs/formato-datos.md): formato de `datos/contenido.json`.
- [docs/temas.md](docs/temas.md): variables que define cada tema.

## Cómo verlo en local

El contenido se carga con `fetch` desde `datos/contenido.json`, así que abrir `index.html` directamente desde el disco no funciona: hace falta un servidor local. Cualquiera de estas opciones vale:

- Extensión **Live Server** de VS Code: clic derecho en `index.html` → "Open with Live Server".
- `npx serve` en la raíz del proyecto.
- `python -m http.server` en la raíz del proyecto y abrir `http://localhost:8000`.

## Licencia

El código está bajo licencia MIT; el contenido personal (datos, textos personales e imágenes) tiene todos los derechos reservados. Detalles en [LICENSE](LICENSE).
