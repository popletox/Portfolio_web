# Diseño del portfolio web

Documento base · Miguel Ángel Torrijos · 11/10/2026

1. Objetivo y alcance

Portfolio personal con formato de currículum interactivo y proyecto de aprendizaje de desarrollo con IA. Una sola página con HTML, CSS y JavaScript; sin framework necesario de entrada. Desarrollo previsto en VS Code con Codex y alojamiento previsto en Firebase Hosting. No se necesita una base de datos para las funciones definidas.

2. Dirección visual

Diseño limpio, plano y con espacio libre. Evitar bordes marcados y contenedores encajados. Distinguir los encabezados de sección mediante un contraste suave de fondo. Aperturas y cierres con desplazamiento progresivo del contenido inferior y aparición/desaparición suave del contenido; animaciones breves y tranquilas. Al abrir, primero se expande el espacio y después aparece el contenido con un fundido; al cerrar, el orden inverso.

3. Encabezado permanente

En ordenador: nombre completo, subtítulo de perfil (desarrollo de videojuegos / software), enlaces de correo y LinkedIn y acceso a Opciones. Permanece visible al desplazarse. Fondo del tema activo, opaco detrás del nombre, que se desvanece mediante un degradado hacia el contenido: los textos que pasan por debajo dejan de verse sin interferir con el encabezado.

En móvil: versión compacta, inicialmente visible, con nombre abreviado (por concretar) y enlaces accesibles mediante iconos. Puede minimizarse al hacer scroll. Ajustar su altura para dejar espacio útil al contenido.

4. Secciones y estado inicial

Cuatro secciones, en este orden: Experiencia, Proyectos, Méritos y reconocimientos y Estudios. Todas se pueden expandir y contraer de forma independiente; no es necesario cerrar una para abrir otra. Base inicial: solo Experiencia abierta; Estudios, Proyectos y Reconocimientos cerradas. Las entradas individuales comienzan contraídas, salvo la primera de Experiencia, que se muestra desplegada.

5. Destacado

Contenido seleccionado por Miguel, independiente del resumen profesional: inicialmente un título, imagen preferiblemente vertical, descripción breve y enlaces. En ordenador: panel lateral derecho abierto al cargar, con cierre y posibilidad de reabrir. Reservar espacio para evitar tapar el contenido.

En móvil: sustituir el lateral por un panel horizontal inferior con el mismo contenido, cerrable y reabrible. Pendiente concretar si queda fijo al borde de la pantalla o al final del documento; si es fijo, debe ser compacto y reservar espacio para no ocultar el contenido ni la nota del pie.

# Secciones e interacción

Una misma lógica de navegación; proyectos con mayor presencia visual

6. Experiencia y Estudios

Línea de tiempo vertical sencilla: años o rango de años a la izquierda; punto y línea; información a la derecha. Cada entrada muestra puesto o titulación, empresa o centro y fechas. Al activarla se despliega su explicación y, cuando proceda, enlaces. Estudios reutiliza el mismo patrón con textos más breves; su subtítulo indica la institución en lugar de la empresa.

Mostrar una señal persistente de apertura (flecha u otro icono discreto). El cambio de fondo al pasar el ratón puede reforzarla. Permitir abrir y cerrar cada entrada, así como contraer la sección completa. En móvil, compactar la columna temporal conservando las fechas legibles.

Formato de fecha: contraída, «AAAA – AAAA»; expandida, «mes, AAAA – mes, AAAA» (mes en minúscula y en español, p. ej. «marzo, 2023 – junio, 2025»); el cambio entre ambos formatos se hace con un fundido suave. Detalle de cada entrada: descripción, aptitudes clave y, de forma opcional, proyectos.

7. Proyectos: lista y filtros

Una única lista cronológica con filtros por tecnología: Todos, Unity, Unreal, Roblox y las que correspondan al contenido real. El filtro modifica la misma lista y conserva el orden temporal. Evitar subcategorías desplegables. No añadir categorías vacías de herramientas; cuando existan, diferenciar tipo de proyecto y tecnología.

En ordenador: línea temporal a la izquierda, con el ancho justo para las miniaturas, dejando más espacio al texto. A su izquierda se muestran como máximo dos miniaturas en una fila; a la derecha, nombre, tecnología, resumen breve e icono de desplegar. La fecha es única (año; "mes, año" al expandir, igual que en Méritos) y va en la columna izquierda, sobre las miniaturas. A la derecha van el nombre y la tecnología como subtítulo.

Al expandir: aparece el detalle a la derecha (descripción, aptitudes clave y, de forma opcional, un enlace a donde esté publicado el proyecto) y las miniaturas crecen y se muestran todas, sin límite, en 2 columnas dentro de la misma columna izquierda, sin que la línea se mueva. Limitar el tamaño de las imágenes: no estirarlas ni hacer que dependan de la longitud de la descripción. Admitir menos miniaturas si cuatro resultan demasiado pequeñas.
Al pasar el ratón por una miniatura: ampliación superpuesta, sin desplazar la página. En móvil: imágenes debajo del título y ampliación al tocar, con cierre claro. Mantener las proporciones y evitar que la vista ampliada salga de la pantalla.

8. Méritos y reconocimientos

Línea de tiempo ligera, similar a Experiencia: contraída, muestra el año, el título del premio y, como subtítulo, el evento o la institución que lo concede; expandida, muestra «mes, AAAA» (sin rango), la descripción y un único enlace al proyecto asociado. Asociar cada reconocimiento a un proyecto cuando corresponda mediante un enlace interno visible.

Al activar Ver proyecto: abrir Proyectos si está cerrado, ajustar el filtro si oculta el destino, desplegar la entrada y desplazarse suavemente hasta su inicio. Resaltar brevemente el destino. Dejarlo visible por debajo del encabezado permanente.

9. Pie: Sobre esta web

Nota breve y visible explicando el proyecto de aprendizaje: Miguel dirige el diseño y las funciones; el código se genera con IA bajo su revisión; los textos son escritos por Miguel, con posible ayuda de IA para revisarlos. La redacción final se añadirá más adelante.

# Temas y desarrollo incremental

Requisitos de base y decisiones pendientes

10. Arquitectura de temas

La tematización forma parte de la arquitectura desde el inicio. El tema principal también tiene su propio archivo. HTML para contenido, estructura y clases semánticas, sin estilos visuales incrustados. CSS común para distribución, tamaños, adaptación a pantallas y transiciones estructurales. Un CSS por tema para colores, tipografía, fondos y ajustes particulares.

Todos los temas comparten variables de estilo con significado estable: fondo, texto, acento, superficies, tipografía, etc. El degradado del encabezado y todos los colores usan el tema activo. JavaScript activa el tema y guarda la elección en el navegador. Una lista de temas disponibles genera el selector; añadir un tema no exige rehacer el contenido.

Opciones abre un menú pequeño con Claro, Oscuro y Código, mostrando el activo. Código es un tema de apariencia oscura, fuente monoespaciada y colores coherentes para títulos, fechas, tecnologías y enlaces. Conservar la legibilidad de los párrafos. Tema inicial normal; concretar si será claro o seguirá el sistema. No cambiar el orden ni el contenido al cambiar de tema.

11. Efectos divertidos

Interruptor independiente del tema, dentro de Opciones. Controla los adornos de los títulos; no las transiciones de los desplegables. Reconocimientos: explosión puntual de confeti con caída. Estudios: libros apilándose sobre la E, tambaleo y caída, repitiendo mientras permanezca el cursor. Experiencia: engranajes que aparecen, encajan y giran. Proyectos: pequeño mando sobre la P, con inclinación e iluminación secuencial de botones.

Efectos superpuestos que no mueven la página ni bloquean clics. Al salir, detener nuevas emisiones y terminar brevemente; al apagar, limpiar inmediatamente. Organizar cada efecto por separado. No se requiere física real para el apilado. Pendiente decidir estado inicial y activación en dispositivos táctiles; no depender del hover para funciones esenciales.

12. Orden sugerido de tareas

1) Estructura, estilos comunes y temas Claro/Oscuro. 2) Encabezado adaptable y Opciones. 3) Desplegables y líneas de tiempo de Experiencia/Estudios. 4) Proyectos, filtros y ampliación de imágenes. 5) Reconocimientos y enlaces internos. 6) Destacado y nota del pie. 7) Tema Código y efectos decorativos. 8) Contenido real, comprobaciones y publicación.

Trabajar por tareas pequeñas referidas a este documento. Usar contenido provisional claramente identificado, sin inventar experiencia ni premios. Actualizar la referencia al tomar nuevas decisiones. Verificar ordenador y móvil, todos los temas, teclado, cierre de paneles, filtros y enlaces internos; respetar la preferencia de movimiento reducido.

13. Uso como referencia

Guardar la versión Markdown en el repositorio (por ejemplo, docs/diseno-portfolio.md) y pedir al agente que la lea al iniciar una tarea. Ejemplo: «Lee docs/diseno-portfolio.md e implementa solo el encabezado descrito en el apartado 3. Comprueba ordenador y móvil y resume los cambios». El PDF sirve como copia de consulta; los textos, recursos, fechas exactas y detalles visuales se concretarán durante la implementación.
