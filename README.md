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
- Proyectos en bandas por año con tarjetas y filtros por tecnología, generados a partir de los datos. Cada tarjeta abre una ventana de detalle (descripción, apartados opcionales como retos o tecnología, aptitudes, enlaces e imágenes) que se cierra también con el botón Atrás. Cada proyecto tiene enlace directo (`…/#<id>` abre su ventana) y un botón de compartir en la ventana (menú de compartir del sistema en móvil; en ordenador copia el enlace y avisa con "Enlace copiado").
- Visor de imágenes para ampliar las imágenes de la ventana de detalle y la del panel Destacado.
- Referencias en tarjetas (cuadrícula con título e imagen) en el detalle de Experiencia, Estudios y Méritos: las de proyectos toman solas su título y primera imagen; las demás, de un catálogo común del JSON. Las que enlazan a un proyecto (y el enlace interno del Destacado) abren su ventana de detalle sin mover la página.
- Panel Destacado en forma de carrusel (lateral en ordenador, inferior en móvil), cerrable y reabrible.
- Temas Claro, Oscuro, Código y Cómic, elegibles en el menú de Opciones y guardados en el navegador.
- Contenido cargado desde `datos/contenido.json`.
- Nota "Sobre esta web" en el pie.

### Pendiente

- Línea de tiempo horizontal (en construcción): ya tiene el bloque (sin título, debajo de Estudios), el contenedor desplazable a todo el ancho, el eje de meses y años y las barras de estudios (azul) y experiencias (rojo), en filas si se solapan y con su nombre a 45°, y las tarjetas de proyectos bajo su mes, en filas automáticas, que abren su ventana de detalle; faltan las estrellas de méritos y los ajustes finales.
- Contenido real: los textos de `datos/contenido.json` son provisionales.
- Diseño propio del tema Cómic (ahora es una copia provisional de Claro).
- Interruptor de "Efectos divertidos" en Opciones y sus animaciones en los títulos.
- Configuración y publicación en Firebase Hosting.

## Tecnologías

- HTML, CSS y JavaScript vanilla, sin frameworks ni bundlers.
- Alojamiento en GitHub Pages (pendiente de activar), publicando la rama `main` sin paso de compilación. URL prevista: https://popletox.github.io/Portfolio_web/

## Estructura de carpetas

```
index.html        Página principal
estilos/          CSS común y un archivo por tema en estilos/temas/
scripts/          JavaScript (contenido, interacción, línea de tiempo, temas y opciones)
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
