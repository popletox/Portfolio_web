# Formato de datos (`datos/contenido.json`)

El contenido de la introducción y de las secciones Experiencia, Proyectos, Méritos y reconocimientos y Estudios está en `datos/contenido.json`. La web lo carga con `fetch` al iniciarse. Para añadir o cambiar contenido, edita solo ese archivo. La cabecera, el panel Destacado y el pie siguen en `index.html`.

Guarda el archivo en UTF-8 (se pueden usar tildes y eñes sin problema).

## Estructura general

```json
{
  "introduccion": "...",
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
| `proyectos` | No | Array de `{ "texto", "enlace" }`; `enlace` (URL) es opcional. |

## Estudios

Igual que Experiencia, cambiando `puesto` por `titulo` y `empresa` por `institucion`.

## Proyectos

| Campo | Obligatorio | Descripción |
| --- | --- | --- |
| `id` | Sí | Identificador único en minúsculas y con guiones (`mi-juego-2025`). No lo cambies después: lo usan los méritos y los enlaces internos. |
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
| `miniatura` | No | Ruta a la versión pequeña, p. ej. `"recursos/proyectos/mi-juego-1.jpg"`. Si falta, se muestra el cuadrado provisional. |
| `grande` | No | Ruta a la versión grande para el visor. Si falta, el visor usa `miniatura`. |
| `encuadre` | No | `"arriba"`, `"abajo"`, `"izquierda"` o `"derecha"`. Sin él (o con otro valor), centrado. |

Las rutas de `miniatura` y `grande` deben ser relativas (`recursos/...`) o empezar por `http://` o `https://`. Cualquier otra (`javascript:`, `data:`, `//...`) se ignora: sin `miniatura` válida se ve el cuadrado provisional.

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
    { "miniatura": "recursos/proyectos/mi-juego-1.jpg", "grande": "recursos/proyectos/mi-juego-1-grande.jpg", "alt": "Captura del menú principal" }
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
| `proyecto` | No | `id` de un proyecto. |

**Enlazar un mérito con un proyecto:** pon en `proyecto` exactamente el `id` del proyecto (p. ej. `"proyecto": "mi-juego"`). El JS genera el enlace «Ver proyecto: Mi juego» con el `titulo` de ese proyecto (el texto no se escribe en el JSON) y `href="#<id>"`; al pulsarlo abre la sección Proyectos y lleva a esa entrada. Si el `id` no existe, no se muestra el enlace.

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
