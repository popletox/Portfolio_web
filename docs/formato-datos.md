# Formato de datos (`datos/contenido.json`)

El contenido de la introducción, de las secciones Experiencia, Proyectos, Méritos y reconocimientos y Estudios, y del panel Destacado está en `datos/contenido.json`. La web lo carga con `fetch` al iniciarse. Para añadir o cambiar contenido, edita solo ese archivo. La cabecera y el pie siguen en `index.html`.

Guarda el archivo en UTF-8 (se pueden usar tildes y eñes sin problema).

## Estructura general

```json
{
  "introduccion": "...",
  "destacados": [ ... ],
  "referencias": { ... },
  "experiencia": [ ... ],
  "proyectos": [ ... ],
  "meritos": [ ... ],
  "estudios": [ ... ]
}
```

## Reglas comunes

- **Fechas:** siempre `"AAAA-MM"`, p. ej. `"2023-03"`. El JS genera los textos «2023 – 2025» y «marzo, 2023 – junio, 2025».
- **Trabajo o estudio en curso:** `"fechaFin": null`. Se mostrará como «actualidad». No uses `"actual"` ni dejes la clave vacía `""`.
- **Textos de descripción** (`introduccion` y `descripcion`): string para un párrafo, o array de strings para varios párrafos (`["Párrafo 1", "Párrafo 2"]`). Texto plano, sin HTML.
- **Orden:** el JS ordena cada sección por fecha descendente (lo más reciente arriba), así que el orden dentro del archivo no importa. Experiencia y Estudios ordenan por `fechaInicio`, y a igualdad, primero el que tenga `fechaFin: null`; Proyectos y Méritos ordenan por `fecha`.
- **Campos opcionales:** si no se usan, se omite la clave entera (no hace falta poner `null` ni `[]`).
- **Enlaces:** solo se aceptan URLs que empiecen por `http:`, `https:`, `mailto:` o `#`. Con cualquier otra (p. ej. `javascript:` o una ruta relativa), el texto se muestra pero sin enlace.

## Experiencia

| Campo | Obligatorio | Descripción |
| --- | --- | --- |
| `puesto` | Sí | Título de la entrada. |
| `empresa` | Sí | Subtítulo. |
| `fechaInicio` | Sí | `"AAAA-MM"`. |
| `fechaFin` | Sí | `"AAAA-MM"` o `null` si sigue en curso. |
| `descripcion` | Sí | String o array de strings. |
| `aptitudes` | Sí | Array de strings. |
| `referencias` | No | Array de ids del catálogo `referencias` (ver más abajo), p. ej. `["proyecto-mi-juego"]`. |

## Estudios

Igual que Experiencia, cambiando `puesto` por `titulo` y `empresa` por `institucion`.

## Proyectos

| Campo | Obligatorio | Descripción |
| --- | --- | --- |
| `id` | Sí | Identificador único en minúsculas y con guiones (`mi-juego-2025`). No lo cambies después: lo usan los enlaces internos (`#<id>`) de Referencias y Destacado. |
| `titulo` | Sí | Nombre del proyecto. |
| `categoria` | Sí | Tecnología (p. ej. `"Unity"`, `"Unreal Engine"`, `"Roblox"`). Genera automáticamente los filtros de Proyectos (un botón por categoría distinta). Escríbela siempre igual, con las mismas mayúsculas y espacios: `"Unity"` y `"unity"` serían dos filtros distintos. |
| `fecha` | Sí | `"AAAA-MM"`. |
| `descripcion` | Sí | String o array de strings. |
| `aptitudes` | Sí | Array de strings. |
| `enlace` | No | `{ "texto": "...", "url": "..." }`. |
| `imagenes` | Sí | Array (puede estar vacío `[]`). Ver abajo. |

Cada imagen:

| Campo | Obligatorio | Descripción |
| --- | --- | --- |
| `alt` | Sí | Descripción de la imagen (accesibilidad). |
| `low` | No | Ruta a la versión pequeña, p. ej. `"recursos/proyectos/mi-juego-1.jpg"`. Si falta, la miniatura usa `high`; si tampoco hay `high`, se muestra el cuadrado provisional. Recomendable ponerla para que la página cargue más ligera. |
| `high` | No | Ruta a la versión grande para el visor. Si falta, el visor usa `low`. Si solo hay `high`, se usa tanto en la miniatura como en el visor. |
| `encuadre` | No | `"arriba"`, `"abajo"`, `"izquierda"` o `"derecha"`. Sin él (o con otro valor), centrado. |

Las rutas de `low` y `high` deben ser relativas (`recursos/...`) o empezar por `http://` o `https://`. Cualquier otra (`javascript:`, `data:`, `//...`) se ignora: sin `low` ni `high` válidas se ve el cuadrado provisional.

### Ejemplo mínimo para añadir un proyecto

Copia este bloque dentro del array `"proyectos"`, separado del anterior por una coma:

```json
{
  "id": "mi-juego",
  "titulo": "Mi juego",
  "categoria": "Unity",
  "fecha": "2025-09",
  "descripcion": "Breve descripción del proyecto.",
  "aptitudes": ["C#", "Diseño de niveles"],
  "enlace": { "texto": "Jugar en itch.io", "url": "https://popletox.itch.io/" },
  "imagenes": [
    { "low": "recursos/proyectos/mi-juego-1.jpg", "high": "recursos/proyectos/mi-juego-1-grande.jpg", "alt": "Captura del menú principal" }
  ]
}
```

## Méritos y reconocimientos

| Campo | Obligatorio | Descripción |
| --- | --- | --- |
| `titulo` | Sí | Nombre del premio o reconocimiento. |
| `entidad` | Sí | Evento o institución (subtítulo). |
| `fecha` | Sí | `"AAAA-MM"`. |
| `descripcion` | Sí | String o array de strings. |
| `referencias` | No | Array de ids del catálogo `referencias`, como en Experiencia. |

**Enlazar un mérito con un proyecto:** crea en el catálogo `referencias` una entrada con `"enlace": "#<id>"` (el `id` exacto del proyecto) y pon el id de esa entrada en el campo `referencias` del mérito. La tarjeta, al pulsarla, abre la sección Proyectos, despliega la entrada, la centra y la resalta; el botón Atrás vuelve al mérito.

## Referencias (catálogo)

Las tarjetas del bloque «Referencias» que aparece en el detalle de Experiencia, Estudios y Méritos salen de un catálogo central: la clave `referencias`, un objeto cuyas claves son ids (minúsculas y guiones, p. ej. `proyecto-mi-juego`) y cuyos valores describen cada tarjeta. Una misma referencia se puede usar en varias entradas.

| Campo | Obligatorio | Descripción |
| --- | --- | --- |
| `titulo` | Sí | Texto de la tarjeta (se recorta a 2 líneas con «…»). También es el `alt` de la imagen. |
| `img` | No | Imagen de la tarjeta, relativa (`recursos/...`) o `http(s)://`. Se recorta sin deformarse para llenar el hueco. Sin ella (o con otra ruta), se ve el rectángulo provisional. |
| `enlace` | No | URL (mismas reglas que el resto de enlaces). Sin `enlace` válido, la tarjeta no es clicable. |

Enlace:

- **A un proyecto de la web:** `"#<id>"` con el `id` de un proyecto. Abre Proyectos, despliega la entrada, la centra y la resalta (Atrás vuelve al origen). Si el `id` no existe, queda como un enlace normal a `#<id>`.
- **Externo:** `"https://..."`. Se abre en una pestaña nueva.

En Experiencia, Estudios y Méritos, el campo `referencias` lista los ids en el orden en que se muestran. Los ids que no estén en el catálogo (o sin `titulo`) se ignoran, con un aviso en la consola del navegador. Si no queda ninguno, no se muestra el bloque.

Ejemplo:

```json
"referencias": {
  "proyecto-mi-juego": {
    "titulo": "Mi juego",
    "img": "recursos/referencias/mi-juego.jpg",
    "enlace": "#mi-juego"
  },
  "proyecto-cliente": { "titulo": "Experiencia para un cliente", "enlace": "https://ejemplo.com" },
  "proyecto-interno": { "titulo": "Herramienta interna" }
}
```

```json
"referencias": ["proyecto-mi-juego", "proyecto-cliente"]
```

## Destacado

Contenido del panel Destacado (lateral derecho en ordenador, panel inferior en móvil). La clave `destacados` es una lista: cada elemento es una diapositiva del panel. Con dos o más, el panel muestra puntos indicadores debajo y pasa al siguiente cada 10 segundos (en bucle, deslizándose en horizontal); la rotación se pausa con el ratón encima o el foco de teclado dentro, con el panel cerrado o con la pestaña oculta, y no existe si el sistema pide movimiento reducido. Con uno solo, no hay puntos ni rotación. Por compatibilidad, también se acepta la clave antigua `destacado` con un único objeto.

Cada diapositiva se muestra en este orden: título, imagen, descripción y enlace.

| Campo | Obligatorio | Descripción |
| --- | --- | --- |
| `titulo` | No | Título de la diapositiva. Si falta, se usa «Proyecto destacado». |
| `imagen` | No | `{ "low", "high", "alt" }`, como las imágenes de Proyectos (sin `encuadre`). Si falta la clave entera, esa diapositiva no lleva imagen. |
| `descripcion` | No | String o array de strings. Mejor breve: 1 o 2 frases. |
| `enlace` | No | `{ "texto": "...", "url": "..." }`. Se muestra con una flecha «→». |

Imagen:

- `low` es la imagen que se ve en el panel. Si falta o no es válida, el panel usa `high`; si tampoco hay `high` válida, se muestra el cuadrado naranja provisional. Recomendable poner `low` para que la página cargue más ligera.
- `high` (opcional) es la versión para el visor; si falta, el visor usa la del panel.
- `alt` (obligatorio dentro de `imagen`) describe la imagen.
- Puede tener cualquier proporción (vertical, cuadrada u horizontal): ocupa el ancho del panel sin deformarse. Si es muy alta, se recorta por arriba y por abajo (máximo 60 % del alto de la ventana en ordenador; el alto del panel en móvil).
- Al pulsarla se abre en el visor, como las miniaturas de Proyectos (también el cuadrado provisional).

Enlace:

- **A un proyecto de la web:** `"url": "#<id>"` con el `id` del proyecto (p. ej. `"#mi-juego"`). Al pulsarlo abre Proyectos, despliega la entrada, la centra y la resalta, igual que las tarjetas de Referencias con enlace interno. Si el `id` no existe, queda como un enlace normal a `#<id>`.
- **Externo:** `"url": "https://..."`. Se abre en una pestaña nueva.
- Se aplican las mismas reglas de URL que en el resto de enlaces (`http:`, `https:`, `mailto:` o `#`).

Si el JSON no tiene destacados (ni `destacados` ni `destacado`, o la lista está vacía), el panel y su botón-pestaña no se muestran y la página ocupa todo el ancho. Si falla la carga del JSON, el panel muestra el título «Proyecto destacado» y el aviso de error.

Ejemplo:

```json
"destacados": [
  {
    "titulo": "Proyecto destacado",
    "imagen": {
      "low": "recursos/destacado/mi-juego.jpg",
      "high": "recursos/destacado/mi-juego-grande.jpg",
      "alt": "Portada de Mi juego"
    },
    "descripcion": "Juego de plataformas hecho en Unity en 48 horas.",
    "enlace": { "texto": "Ver proyecto", "url": "#mi-juego" }
  },
  {
    "titulo": "Nueva publicación",
    "descripcion": "Diapositiva sin imagen: solo título, texto y enlace.",
    "enlace": { "texto": "Leer más", "url": "https://ejemplo.com" }
  }
]
```

## Errores típicos de JSON

- **Coma final:** no pongas coma después del último elemento de un array u objeto (`["A", "B",]` es inválido).
- **Falta una coma** entre dos elementos u objetos seguidos.
- **Comillas:** solo comillas dobles rectas `"`. Nada de comillas simples ni tipográficas (“ ”), que aparecen al copiar desde Word.
- **Comillas dentro de un texto:** escríbelas como `\"`.
- **Sin comentarios:** JSON no admite `//` ni `/* */`.
- `null`, `true` y `false` van sin comillas.

Para comprobar el archivo en PowerShell, desde la raíz del proyecto:

```powershell
Get-Content datos/contenido.json -Raw -Encoding UTF8 | ConvertFrom-Json
```

Si hay un error, indica la línea aproximada. Con Live Server, un JSON inválido hará que las secciones no se carguen; mira la consola del navegador (F12).
