# Formato de datos (`datos/*.json`)

El contenido de la introducción, de las secciones Experiencia, Proyectos, Méritos y reconocimientos y Estudios, y del panel Destacado está en varios archivos JSON dentro de `datos/`. La web los carga todos en paralelo con `fetch` al iniciarse y los fusiona en un solo objeto. Para añadir o cambiar contenido, edita solo el archivo de la sección correspondiente. La cabecera y el pie siguen en `index.html`.

La Línea de tiempo (bloque después de Estudios) se genera con los datos existentes (fechas de Experiencia, Estudios y Proyectos; Méritos para marcar proyectos): no tiene campos propios.

Guarda el archivo en UTF-8 (se pueden usar tildes y eñes sin problema).

## Archivos de datos

Cada archivo es un objeto JSON con las claves de primer nivel de su sección; el formato interno de cada sección se describe más abajo.

| Archivo | Claves |
| --- | --- |
| `datos-genericos.json` | `introduccion` (y, en el futuro, otras secciones simples como claves nuevas) |
| `datos-destacados.json` | `destacados` |
| `datos-proyectos.json` | `proyectos` y `referencias` (las referencias van junto a los proyectos) |
| `datos-experiencia.json` | `experiencia` |
| `datos-meritos.json` | `meritos` |
| `datos-estudios.json` | `estudios` |

- La lista de archivos es `RUTAS_DATOS`, al principio de `scripts/contenido.js`. Para añadir un archivo nuevo, hay que añadir su ruta a esa lista.
- Una misma clave no debe estar en dos archivos: si pasa, gana la del último de la lista y sale un `console.warn`.
- Comportamiento «todo o nada»: si falla cualquier archivo (no existe, error HTTP o JSON mal escrito), todas las secciones muestran el aviso de error.
- Limitación conocida: si un JSON está mal escrito, el error de consola no dice qué archivo es (solo los errores HTTP lo nombran). Ver P40 en [pendientes](pendientes.md).

## Estructura general

Una vez fusionados los archivos, el contenido equivale a este objeto:

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
- **Textos de descripción** (`introduccion`, `descripcion` y, en Proyectos, `retos`, `experienciaPersonal` y `comentarios`): string para un párrafo, o array de strings para varios párrafos (`["Párrafo 1", "Párrafo 2"]`). Texto plano, sin HTML.
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
| `referencias` | No | Array de ids de proyectos de la sección Proyectos o del catálogo `referencias` (ver más abajo), p. ej. `["mi-juego", "proyecto-cliente"]`. |

## Estudios

Igual que Experiencia, cambiando `puesto` por `titulo` y `empresa` por `institucion`, con dos diferencias:

- `tecnologia` (opcional): array de strings. Se muestra en línea antes de las habilidades personales: «Tecnología: Java · Python». La ventana de detalle de Proyectos tiene el mismo campo.
- `aptitudes` puede ser un array vacío `[]` (de momento lo está en todos los estudios; ver P46).

Las habilidades personales (campo `aptitudes`, etiqueta «Habilidades personales:») se muestran igual en Experiencia, Estudios y Proyectos. En el detalle de Estudios se omite el título «Referencias» sobre las tarjetas; Experiencia y Méritos lo conservan.

## Proyectos

| Campo | Obligatorio | Descripción |
| --- | --- | --- |
| `id` | Sí | Identificador único en minúsculas y con guiones (`mi-juego-2025`). No lo cambies después: lo usan las Referencias y los enlaces internos (`#<id>`) de Destacado. |
| `titulo` | Sí | Nombre del proyecto. |
| `categoria` | Sí | Tecnología (p. ej. `"Unity"`, `"Unreal Engine"`, `"Roblox"`). Genera automáticamente los filtros de Proyectos (un botón por categoría distinta). Escríbela siempre igual, con las mismas mayúsculas y espacios: `"Unity"` y `"unity"` serían dos filtros distintos. |
| `fecha` | Sí | `"AAAA-MM"`. |
| `enCurso` | No | `true` si el proyecto sigue en desarrollo: se muestra arriba, sobre la línea «Actual», sea cual sea su `fecha`. Sin la clave (o con `false`), va en la banda del año de `fecha`. |
| `descripcion` | Sí | String o array de strings. |
| `aptitudes` | Sí | Array de strings. |
| `retos` | No | String o array de strings. Apartado «Retos» de la ventana de detalle. |
| `tecnologia` | No | Array de strings. Se muestra en línea: «Tecnología: Unity · C# · Photon». |
| `experienciaPersonal` | No | String o array de strings. Apartado «Experiencia personal». |
| `comentarios` | No | String o array de strings. Apartado «Comentarios adicionales». |
| `enlaces` | No | Objeto `tipo → url`, p. ej. `{ "web": "https://...", "juego": "https://..." }`. Ver abajo. |
| `imagenes` | Sí | Array (puede estar vacío `[]`). Ver abajo. |

**Agrupación por año:** la sección muestra los proyectos en bandas horizontales, cada una encabezada por una línea con su etiqueta (año o «Actual») y con sus tarjetas debajo. Primero, los que tienen `"enCurso": true` (banda «Actual», solo si hay alguno); después, una banda por año (el de `fecha`), del más reciente al más antiguo con proyectos. Un año intermedio sin proyectos aparece solo como línea con su año; no se muestran años vacíos por encima del más reciente ni por debajo del más antiguo. Dentro de cada banda, los proyectos van por `fecha` descendente. Con un filtro activo, las bandas se recalculan con los proyectos visibles. Cada tarjeta muestra el título, la categoría y la primera imagen. Al pulsarla se abre la ventana de detalle del proyecto con todos sus campos: título, categoría, fecha («mes, AAAA», o «En curso · desde mes, AAAA» con `enCurso`), descripción, retos, tecnología, experiencia personal, comentarios adicionales, habilidades personales y enlaces, en ese orden (los opcionales solo si tienen contenido), y todas las imágenes, ampliables en el visor.

**Enlaces (`enlaces`):** cada clave es un tipo y su valor la URL (mismas reglas que el resto de enlaces). Tipos disponibles, en el orden en que se muestran: `web` («Web») y `juego` («Juego»). Cada uno se ve en su línea como «**Web:** popletox.itch.io/mi-juego»: el texto es la URL sin `https://`/`http://` ni barra final. Los externos se abren en una pestaña nueva; `"#<id>"` de un proyecto abre su ventana. Una URL no válida hace que se ignore ese enlace. Un tipo no previsto se muestra al final con su nombre en mayúscula inicial (p. ej. `"steam"` → «Steam») y avisa en la consola. Para añadir un tipo nuevo, añade una línea al mapa `TIPOS_ENLACE_PROYECTO` de `scripts/contenido.js` (`steam: 'Steam',`).

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
  "enlaces": { "web": "https://popletox.itch.io/" },
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
| `referencias` | No | Array de ids de proyectos o del catálogo `referencias`, como en Experiencia. |

**Enlazar un mérito con un proyecto:** pon el `id` exacto del proyecto en el campo `referencias` del mérito (p. ej. `["mi-juego"]`); no hace falta ninguna entrada en el catálogo. La tarjeta toma el título y la primera imagen del proyecto y, al pulsarla, abre la ventana de detalle del proyecto sin mover la página; al cerrarla (también con el botón Atrás) se sigue en el mérito. Además, citar un proyecto en `referencias` (por id, o con una entrada del catálogo cuyo `enlace` sea `#<id>`) hace que su tarjeta de la Línea de tiempo lleve una estrella de reconocimiento.

## Referencias

Las tarjetas del bloque «Referencias» que aparece en el detalle de Experiencia, Estudios y Méritos se indican con el campo `referencias` de cada entrada: un array de ids, en el orden en que se muestran. Cada id puede ser de dos tipos:

**a) Id de un proyecto de la sección Proyectos** (p. ej. `"mi-juego"`). La tarjeta se genera sola, sin entrada en el catálogo:

- Título: el `titulo` del proyecto.
- Imagen: siempre la **primera** de `imagenes` (`low`, o `high` si falta `low`), con su `alt` (o el título si no tiene). Si el proyecto no tiene imágenes o la primera no tiene ruta válida, se ve el rectángulo provisional.
- Enlace: abre la ventana de detalle del proyecto (Atrás la cierra y se sigue donde se estaba).

Al cambiar el título o la primera imagen del proyecto, sus tarjetas se actualizan solas. Si además hay una entrada del catálogo con el mismo id, se ignora (aviso en la consola).

**b) Id del catálogo `referencias`**, solo para referencias externas o a cosas que no están en Proyectos. El catálogo es un objeto cuyas claves son ids (minúsculas y guiones, p. ej. `proyecto-cliente`) y cuyos valores describen la tarjeta a mano. Una misma referencia se puede usar en varias entradas.

| Campo | Obligatorio | Descripción |
| --- | --- | --- |
| `titulo` | Sí | Texto de la tarjeta (se recorta a 2 líneas con «…»). También es el `alt` de la imagen. |
| `img` | No | Imagen de la tarjeta, relativa (`recursos/...`) o `http(s)://`. Se recorta sin deformarse para llenar el hueco. Sin ella (o con otra ruta), se ve el rectángulo provisional. |
| `enlace` | No | URL (mismas reglas que el resto de enlaces). `"https://..."` se abre en una pestaña nueva. Sin `enlace` válido, la tarjeta no es clicable. |

Si el `enlace` de una entrada del catálogo es `"#<id>"` de un proyecto existente, la tarjeta se trata como el tipo a): usa el título y la primera imagen de ese proyecto en lugar de `titulo` e `img`. Mejor usar directamente el id del proyecto.

Los ids que no sean de un proyecto ni estén en el catálogo (o sin `titulo`) se ignoran, con un aviso en la consola del navegador. Si no queda ninguno, no se muestra el bloque.

Ejemplo:

```json
"referencias": {
  "proyecto-cliente": {
    "titulo": "Experiencia para un cliente",
    "img": "recursos/referencias/cliente.jpg",
    "enlace": "https://ejemplo.com"
  },
  "proyecto-interno": { "titulo": "Herramienta interna" }
}
```

```json
"referencias": ["mi-juego", "proyecto-cliente"]
```

Aquí `mi-juego` es el `id` de un proyecto (tipo a) y `proyecto-cliente` una entrada del catálogo (tipo b).

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
- Al pulsarla se abre en el visor de imágenes (también el cuadrado provisional).

Enlace:

- **A un proyecto de la web:** `"url": "#<id>"` con el `id` del proyecto (p. ej. `"#mi-juego"`). Al pulsarlo abre la ventana de detalle del proyecto, igual que las tarjetas de Referencias con enlace interno. Si el `id` no existe, queda como un enlace normal a `#<id>`.
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

Para comprobar los archivos en PowerShell, desde la raíz del proyecto (indica cuál falla):

```powershell
Get-ChildItem datos/*.json | ForEach-Object { Write-Host $_.Name; Get-Content $_.FullName -Raw -Encoding UTF8 | ConvertFrom-Json | Out-Null }
```

Si hay un error, indica la línea aproximada. Con Live Server, un JSON inválido en cualquiera de los archivos hará que las secciones no se carguen; mira la consola del navegador (F12).
