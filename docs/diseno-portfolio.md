# Diseño del portfolio web

Documento base · Miguel Ángel Torrijos · 11/10/2026

1. Objetivo y alcance

Portfolio personal con formato de currículum interactivo y proyecto de aprendizaje de desarrollo con IA. Una sola página con HTML, CSS y JavaScript; sin framework necesario de entrada. Desarrollo previsto en VS Code con Codex y alojamiento previsto en GitHub Pages. No se necesita una base de datos para las funciones definidas.

2. Dirección visual

Diseño limpio, plano y con espacio libre. Evitar bordes marcados y contenedores encajados. Distinguir los encabezados de sección mediante un contraste suave de fondo. Aperturas y cierres con desplazamiento progresivo del contenido inferior y aparición/desaparición suave del contenido; animaciones breves y tranquilas. Al abrir, primero se expande el espacio y después aparece el contenido con un fundido; al cerrar, el orden inverso.

3. Encabezado permanente

En ordenador: nombre completo, subtítulo de perfil (desarrollo de videojuegos / software), enlaces de LinkedIn, itch.io y correo como iconos (en todas las pantallas) y acceso a Opciones. Permanece visible al desplazarse. Fondo del tema activo, opaco detrás del nombre, que se desvanece mediante un degradado hacia el contenido: los textos que pasan por debajo dejan de verse sin interferir con el encabezado.

En móvil: arriba del todo se ve completa; al bajar se compacta a una línea con el nombre abreviado "Miguel A. Torrijos" y los iconos, y recupera el tamaño al volver arriba. Ajustar su altura para dejar espacio útil al contenido.

4. Secciones y estado inicial

Cuatro secciones, en este orden: Experiencia, Proyectos, Méritos y reconocimientos y Estudios. Todas se pueden expandir y contraer de forma independiente; no es necesario cerrar una para abrir otra. Base inicial: solo Experiencia abierta; Estudios, Proyectos y Reconocimientos cerradas. Las entradas individuales comienzan contraídas, salvo la primera de Experiencia, que se muestra desplegada. Después de Estudios, y antes del pie, va la Línea de tiempo (apartado 8 bis): un bloque sin título, siempre visible y no plegable.

5. Destacado

Contenido seleccionado por Miguel, independiente del resumen profesional: uno o varios destacados, cada uno con un título, una imagen, una descripción breve y un enlace, en ese orden, definidos en `datos/contenido.json` (clave `destacados`, ver docs/formato-datos.md). Con varios, el panel es un carrusel con puntos indicadores y rotación automática cada 10 segundos (pausada con el ratón encima, el foco dentro, el panel cerrado o la pestaña oculta; sin rotación ni animación con movimiento reducido). La imagen admite cualquier proporción: ancho fijo (todo el panel en ordenador, una columna a la izquierda en móvil), alto automático con un tope y recorte sin deformar. El enlace puede ser interno a un proyecto (abre la ventana de detalle del proyecto, como las Referencias) o externo. En ordenador: panel lateral derecho abierto al cargar, con cierre y posibilidad de reabrir. Reservar espacio para evitar tapar el contenido.

En móvil: sustituir el lateral por un panel horizontal inferior con el mismo contenido, cerrable y reabrible. Pendiente concretar si queda fijo al borde de la pantalla o al final del documento; si es fijo, debe ser compacto y reservar espacio para no ocultar el contenido ni la nota del pie.

# Secciones e interacción

Una misma lógica de navegación; proyectos con mayor presencia visual

6. Experiencia y Estudios

Línea de tiempo vertical sencilla: años o rango de años a la izquierda; punto y línea; información a la derecha. Cada entrada muestra puesto o titulación, empresa o centro y fechas. Al activarla se despliega su explicación y, cuando proceda, enlaces. Estudios reutiliza el mismo patrón con textos más breves; su subtítulo indica la institución en lugar de la empresa.

Mostrar una señal persistente de apertura (flecha u otro icono discreto). El cambio de fondo al pasar el ratón puede reforzarla. Permitir abrir y cerrar cada entrada, así como contraer la sección completa. En móvil, compactar la columna temporal conservando las fechas legibles.

Formato de fecha: contraída, «AAAA – AAAA»; expandida, «mes, AAAA – mes, AAAA» (mes en minúscula y en español, p. ej. «marzo, 2023 – junio, 2025»); el cambio entre ambos formatos se hace con un fundido suave. Detalle de cada entrada: descripción, aptitudes clave y, de forma opcional, Referencias: cuadrícula de tarjetas con título de hasta dos líneas arriba (siempre ocupa el alto de dos, para que las tarjetas de una fila midan igual) e imagen cuadrada debajo (recortada, o cuadrado provisional), sin bordes marcados. Una referencia a un proyecto de la sección Proyectos toma sola su título y su primera imagen y enlaza internamente a él; las demás (externas o a cosas fuera de Proyectos) salen de un catálogo común del JSON con título, imagen y enlace manuales. Con enlace, toda la tarjeta es clicable (interno a un proyecto o externo en pestaña nueva); sin enlace, no lo parece.

7. Proyectos: bandas por año y filtros

Todos los proyectos a la vista en bandas horizontales por año. Cada banda empieza con una línea horizontal discreta que cruza todo el ancho de la sección, con su etiqueta (año o «Actual») en el extremo izquierdo: la línea encabeza su grupo y sus tarjetas van justo debajo; entre el final de un grupo y la línea siguiente queda más espacio. Primero, la línea «Actual» con los proyectos en curso (campo `enCurso` del JSON) debajo, que solo aparece si hay alguno visible; después, un año por banda, del más reciente al más antiguo con proyectos. Los años intermedios sin proyectos se muestran solo como línea con su año, seguida con poca separación de la línea siguiente; no se muestran años vacíos en los extremos. Dentro de cada banda, tarjetas por fecha descendente en una cuadrícula alineada a la izquierda (más columnas en ordenador, dos en un móvil normal). Todo se alinea en dos columnas: las etiquetas en una columna izquierda de ancho fijo, y a su derecha las líneas (todas empiezan en el mismo punto y llegan al borde derecho) y las tarjetas, que empiezan donde la línea; bajo cada etiqueta la columna queda vacía.

Tarjeta: como las de Referencias (sin bordes marcados): nombre (hasta dos líneas con «…») y tecnología como subtítulo (una línea) arriba, e imagen cuadrada debajo (primera imagen del proyecto recortada sin deformar, o rectángulo provisional); todas las de una fila miden igual. Toda la tarjeta es un botón (hover y foco como las tarjetas de Referencias con enlace) que abre la ventana de detalle del proyecto.

Ventana de detalle: ventana modal centrada (ancho máximo ~60rem, alto máximo ~90 % de la pantalla, con scroll interno; el fondo de la página queda oscurecido y no se desplaza). Muestra el título, la categoría como subtítulo, la fecha («mes, AAAA»; en curso, «En curso · desde mes, AAAA»), la descripción y, en este orden y solo si tienen contenido, los apartados Retos, Tecnología («Tecnología: Unity · C#», en línea como las aptitudes), Experiencia personal y Comentarios adicionales (cada uno con su título), las aptitudes clave, los enlaces opcionales (uno por línea, «Web: dominio/ruta», «Juego: …», con la URL sin protocolo como texto; externos en pestaña nueva) y todas las imágenes del proyecto como miniaturas cuadradas (versión `low`, recortadas según `encuadre`). En ordenador, dos columnas: el texto a la izquierda y las imágenes a la derecha en una cuadrícula de dos columnas de ancho limitado; sin imágenes, el texto ocupa todo el ancho. En móvil, casi a pantalla completa y en una columna, con las imágenes debajo del texto (dos o tres por fila). Al pulsar una miniatura se abre el visor con la versión `high` por encima de la ventana; cerrar el visor (✕ o Esc) deja la ventana abierta. La ventana se cierra con el botón ✕, Esc, un clic fuera o el botón Atrás del navegador, con un fundido breve (sin él con movimiento reducido), y el foco vuelve a la tarjeta o al enlace que la abrió, sin que la página se haya movido. Con la ventana abierta la URL es `#<id>` del proyecto: abrirla añade una entrada al historial con ese hash; cerrarla de cualquier forma la quita y vuelve a la URL anterior, así que Atrás no necesita pulsarse dos veces (Adelante la vuelve a abrir). Cambiar de proyecto desde la propia ventana sustituye la entrada en lugar de añadir otra. Enlace directo: cargar la web con `#<id>` de un proyecto (o escribirlo en la barra) abre su ventana; al cerrarla se quita el hash y se sigue en la web. Un `#<id>` que no es de ningún proyecto se ignora.

Botón de compartir: a la izquierda del ✕, con el mismo tamaño y estilo, comparte el enlace directo (`…/#<id>`) del proyecto abierto en ese momento. En móvil o pantalla táctil (puntero `coarse`) con menú de compartir del sistema (`navigator.share`), lo abre con el título y el enlace del proyecto; cancelarlo no hace nada. En ordenador (o si no hay menú del sistema o falla), copia el enlace al portapapeles y muestra encima del botón un bocadillo «Enlace copiado» (mismo estilo que el de Opciones, con el pico hacia el botón; debajo si no cabe arriba en la pantalla) durante ~2 s, que se va con un fundido (sin él con movimiento reducido); volver a pulsar reinicia el tiempo. Si no se puede copiar, el bocadillo dice «No se pudo copiar el enlace». El bocadillo lo anuncian los lectores de pantalla, no toma el foco ni bloquea clics, y desaparece al instante al cerrar la ventana o cambiar de proyecto.

Filtros por tecnología: Todos y las categorías del JSON. Los botones se generan automáticamente (orden alfabético, más "Todos" al principio; no se muestran si hay una sola categoría); la selección es única y empieza en "Todos" sin persistir entre recargas. Al filtrar, las bandas se recalculan con los proyectos visibles con las mismas reglas, con una transición suave (fundido, ajuste de altura y fundido de entrada; sin ella con movimiento reducido). Evitar subcategorías desplegables. No añadir categorías vacías de herramientas; cuando existan, diferenciar tipo de proyecto y tecnología.

8. Méritos y reconocimientos

Línea de tiempo ligera, similar a Experiencia: contraída, muestra el año, el título del premio y, como subtítulo, el evento o la institución que lo concede; expandida, muestra «mes, AAAA» (sin rango), la descripción y, de forma opcional, Referencias en tarjetas, como en Experiencia. Asociar cada reconocimiento a un proyecto cuando corresponda mediante una tarjeta con enlace interno.

Al activar una tarjeta con enlace interno (o el enlace interno del Destacado) se abre la ventana de detalle del proyecto, sin abrir la sección Proyectos ni mover la página. Al cerrarla (✕, Esc, clic fuera o el botón Atrás del navegador) todo sigue como estaba y el foco vuelve a la tarjeta.

8 bis. Línea de tiempo

Línea de tiempo HORIZONTAL que une estudios, experiencias y proyectos, generada a partir de los datos existentes del JSON. Bloque independiente después de Estudios y antes del pie, sin título (solo nombre accesible) y siempre visible (no se pliega). Fondo `--color-fondo-suave` que entra arriba y sale abajo con un degradado vertical ligero desde y hacia `--color-fondo` (alto `--alto-degradado-cronologia`); el contenido va en la zona gris.

Decisiones:

- Ancho: el bloque va desde el borde izquierdo de la ventana hasta el borde izquierdo del panel Destacado si está abierto en el lateral (no pasa por debajo), o hasta el borde derecho de la ventana si está cerrado o en disposición vertical (móvil), aunque el resto del contenido tenga ancho máximo y sin provocar scroll horizontal de la página. Sigue la transición del panel al abrirlo o cerrarlo. Al abrir/cerrar el panel o redimensionar se conserva la posición del scroll (si estaba en el extremo derecho, sigue en él).
- Desplazamiento: scroll horizontal nativo con barra visible (colores del tema donde se pueda). La rueda vertical no se captura (la página sigue bajando); Mayús+rueda, trackpad y flechas (contenedor enfocable) funcionan de forma nativa. Al cargar empieza en el extremo derecho (lo más reciente).
- Eje: del primer mes de cualquier fecha (inicio y fin de Experiencia y Estudios, fecha de Proyectos) al mes actual (lo que está en curso llega hasta él), con un mes de espacio a cada lado para que la primera y la última marca no toquen los bordes. Cada marca es un mes como PUNTO (no el espacio entre marcas): una fecha «AAAA-MM» es exactamente la posición de la marca de ese mes, sea inicio o fin. Línea horizontal con una marca fina por mes y una más gruesa y alta en cada enero con el año centrado bajo ella. Escala lineal: entre dos marcas hay `--ancho-mes-cronologia` (menor en móvil).
- Estudios (azul, `--color-periodo-estudio`) y experiencias (rojo, `--color-periodo-experiencia`): barras sobre el eje (`--grosor-periodo-cronologia`, esquinas algo redondeadas), de la marca del mes de `fechaInicio` a la marca del mes de `fechaFin` (en curso, hasta la marca del mes actual). Un periodo que acaba en un mes y otro que empieza en ese mismo mes se tocan en esa marca, no se solapan. Un periodo de un solo mes (inicio = fin) se dibuja con un largo mínimo (`--largo-min-periodo-cronologia`, en meses) centrado en su marca, y ese largo cuenta al repartir filas. Si se solapan (el inicio de uno es anterior al fin del otro) van en filas distintas: juntos y por fecha de inicio, cada periodo ocupa la fila más baja libre (la 0, junto al eje; separación `--paso-fila-periodo-cronologia`); los que solo se tocan comparten fila con un hueco mínimo (`--hueco-periodo-cronologia`). Del centro de cada barra sube una línea fina de su color hasta un poco por encima de la fila más alta (`--conector-periodo-cronologia`; también en la fila superior, para que todos los nombres arranquen a la misma altura y sean paralelos), con un punto de color, y desde ahí el nombre (puesto o titulación) sube a 45° hacia la derecha: texto algo menor, en `--color-texto` (el rojo no llega a contraste AA sobre el gris claro), ancho máximo `--ancho-nombre-periodo-cronologia` y 3 líneas como máximo con «…». El nombre va en seminegrita (600) para leerse mejor girado; en las experiencias, debajo del puesto (más cerca del punto) va una línea con la empresa en peso normal, algo menor y en `--color-texto-suave`, con «…» si no cabe (los estudios solo muestran la titulación). Al pasar el ratón se ve el nombre completo con la empresa o institución y las fechas. El alto de la capa se calcula con el número de filas y la proyección vertical de un nombre de tamaño máximo, y al final del lienzo se deja el espacio que necesita el nombre más a la derecha. Son decorativos (`aria-hidden`), sin acción al pulsar.
- Proyectos: una tarjeta por proyecto (todos; los filtros de la sección Proyectos no afectan), la misma de la sección Proyectos (título hasta 2 líneas, siempre con el alto de dos; categoría; imagen cuadrada o provisional) pero más pequeña: ancho `--ancho-tarjeta-cronologia` (7rem; 5.5rem en móvil). Va bajo el eje, centrada en la marca del mes de `fecha` (los en curso, en su mes de inicio), unida a ella por una línea vertical fina en `--color-texto-suave` (conector) desde la línea del eje hasta su borde superior; los años del eje quedan por encima del conector. Los proyectos sin `fecha` válida o sin `id` se omiten con un aviso en consola. Filas automáticas: por fecha ascendente (en el mismo mes, el orden del JSON, que es también el orden con Tab), cada tarjeta va a la fila más baja (la 0, junto al eje) en la que no se pisa con otra, con al menos `--hueco-tarjeta-cronologia` entre dos de una fila; las del mismo mes quedan una debajo de otra. Los conectores van por detrás de todas las tarjetas; si en esa fila el conector quedaría oculto tras una tarjeta de otro mes (o la tarjeta taparía el de otra de otro mes más abajo), se prueba hasta 2 filas más abajo y se usa la primera libre de ambas cosas; si no hay ninguna, se queda en la primera en la que cabe. Separaciones `--separacion-eje-proyectos-cronologia` (eje a fila 0) y `--separacion-filas-proyectos-cronologia`. Posición en meses y filas por CSS; las filas y el alto de la capa (según el número de filas y el alto medido de la tarjeta) los calcula el JS con las medidas resueltas y se recalculan si cambia el ancho por mes o el tamaño de las tarjetas. Bordes: al principio y al final del lienzo se deja al menos media tarjeta desde la marca del primer y del último proyecto (al final, el mayor entre eso y lo que pide el nombre inclinado más a la derecha). Cada tarjeta es un botón (Tab dentro de la región, foco visible como en la sección, `aria-label` «Título, categoría, mes AAAA», `aria-haspopup="dialog"`) que abre la ventana de detalle del proyecto (URL `#id`, Atrás la cierra) y, al cerrarla, el foco vuelve a esa tarjeta de la línea de tiempo. La capa de proyectos no es `aria-hidden`.
- Méritos: los proyectos con mérito llevan una estrella identificativa (sin acción). Los méritos sin proyecto no aparecen.
- Móvil: igual, ocupando todo el ancho, con tarjetas más pequeñas.
- Accesibilidad: el contenedor es una región con nombre («Línea de tiempo visual») y una descripción oculta que explica que es una vista visual de los estudios, experiencias y proyectos, de más antiguo a más reciente, que cada proyecto es un botón que abre su ventana de detalle y que todo está detallado en las secciones anteriores. Las marcas del eje y las barras son decorativas.

Plan por pasos:

1. Hecho: bloque sin título con degradados, contenedor a todo el ancho (hasta el panel Destacado abierto) con scroll horizontal (scroll inicial a la derecha) y eje de meses y años. DOM por capas (periodos, eje, proyectos) y escala fecha → X reutilizable (`scripts/linea-tiempo.js`).
2. Hecho: barras de estudios y experiencias en filas por solape, con conector vertical y su nombre a 45°.
3. Hecho: tarjetas de proyecto con colocación automática en filas y línea hasta su mes; abren la ventana de detalle.
4. Pendiente: estrella en proyectos con mérito, ajustes de móvil y pulido.

9. Pie: Sobre esta web

Nota breve y visible explicando el proyecto de aprendizaje: Miguel dirige el diseño y las funciones; el código se genera con IA bajo su revisión; los textos son escritos por Miguel, con posible ayuda de IA para revisarlos. Hay un texto provisional en el pie de la página, editable en index.html.

# Temas y desarrollo incremental

Requisitos de base y decisiones pendientes

10. Arquitectura de temas

La tematización forma parte de la arquitectura desde el inicio. El tema principal también tiene su propio archivo. HTML para contenido, estructura y clases semánticas, sin estilos visuales incrustados. CSS común para distribución, tamaños, adaptación a pantallas y transiciones estructurales. Un CSS por tema para colores, tipografía, fondos y ajustes particulares.

Todos los temas comparten variables de estilo con significado estable: fondo, texto, acento, superficies, tipografía, etc. El degradado del encabezado y todos los colores usan el tema activo. JavaScript activa el tema y guarda la elección en el navegador. Una lista de temas disponibles genera el selector; añadir un tema no exige rehacer el contenido.

Opciones es un botón con un engranaje en el encabezado, junto a los iconos de contacto, que abre un pequeño bocadillo con Claro, Oscuro, Código y Cómic (icono y texto), mostrando el activo. Código es un tema de apariencia oscura, fuente monoespaciada y colores coherentes para títulos, fechas, tecnologías y enlaces. Conservar la legibilidad de los párrafos. Tema inicial normal; concretar si será claro o seguirá el sistema. No cambiar el orden ni el contenido al cambiar de tema.

11. Efectos divertidos

Interruptor independiente del tema, dentro de Opciones. Controla los adornos de los títulos; no las transiciones de los desplegables. Reconocimientos: explosión puntual de confeti con caída. Estudios: libros apilándose sobre la E, tambaleo y caída, repitiendo mientras permanezca el cursor. Experiencia: engranajes que aparecen, encajan y giran. Proyectos: pequeño mando sobre la P, con inclinación e iluminación secuencial de botones.

Efectos superpuestos que no mueven la página ni bloquean clics. Al salir, detener nuevas emisiones y terminar brevemente; al apagar, limpiar inmediatamente. Organizar cada efecto por separado. No se requiere física real para el apilado. Pendiente decidir estado inicial y activación en dispositivos táctiles; no depender del hover para funciones esenciales.

12. Orden sugerido de tareas

1) Estructura, estilos comunes y temas Claro/Oscuro. 2) Encabezado adaptable y Opciones. 3) Desplegables y líneas de tiempo de Experiencia/Estudios. 4) Proyectos, filtros y ampliación de imágenes. 5) Reconocimientos y enlaces internos. 6) Destacado y nota del pie. 7) Tema Código y efectos decorativos. 8) Contenido real, comprobaciones y publicación.

Trabajar por tareas pequeñas referidas a este documento. Usar contenido provisional claramente identificado, sin inventar experiencia ni premios. Actualizar la referencia al tomar nuevas decisiones. Verificar ordenador y móvil, todos los temas, teclado, cierre de paneles, filtros y enlaces internos; respetar la preferencia de movimiento reducido.

13. Uso como referencia

Guardar la versión Markdown en el repositorio (por ejemplo, docs/diseno-portfolio.md) y pedir al agente que la lea al iniciar una tarea. Ejemplo: «Lee docs/diseno-portfolio.md e implementa solo el encabezado descrito en el apartado 3. Comprueba ordenador y móvil y resume los cambios». El PDF sirve como copia de consulta; los textos, recursos, fechas exactas y detalles visuales se concretarán durante la implementación.
