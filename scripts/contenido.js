// Contenido: carga en paralelo los JSON de datos/ (RUTAS_DATOS), los fusiona en
// un solo objeto y monta la introducción, Experiencia, Proyectos, Méritos,
// Estudios y el panel Destacado.
// Al terminar (bien o mal) emite 'contenido:listo' o 'contenido:error' en document.
(function () {
  var RUTAS_DATOS = [
    'datos/datos-genericos.json',
    'datos/datos-destacados.json',
    'datos/datos-proyectos.json',
    'datos/datos-experiencia.json',
    'datos/datos-meritos.json',
    'datos/datos-estudios.json'
  ];
  var TEXTO_ACTUALIDAD = 'actualidad';
  var TEXTO_AVISO = 'No se ha podido cargar el contenido.';
  var SVG_NS = 'http://www.w3.org/2000/svg';
  // Estrella de cinco puntas en una caja de 24 x 24 (méritos: detalle de
  // proyecto y Línea de tiempo)
  var RUTA_ESTRELLA = 'M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 ' +
    '1.12-6.55-4.76-4.64 6.58-.96z';
  var MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  // ---- Utilidades de fechas ("AAAA-MM") ----

  function formatearAnio(fecha) {
    return String(fecha).slice(0, 4);
  }

  function formatearMesAnio(fecha) {
    var partes = String(fecha).split('-');
    var mes = MESES[parseInt(partes[1], 10) - 1];
    return mes ? mes + ', ' + partes[0] : partes[0];
  }

  function formatearRangoAnios(fechaInicio, fechaFin) {
    var fin = fechaFin == null ? TEXTO_ACTUALIDAD : formatearAnio(fechaFin);
    return formatearAnio(fechaInicio) + ' – ' + fin;
  }

  // Descendente por la clave indicada; a igualdad, primero la que no ha terminado
  function ordenarPorFecha(lista, clave) {
    return lista.slice().sort(function (a, b) {
      var fa = String(a[clave] || '');
      var fb = String(b[clave] || '');
      if (fa !== fb) return fa < fb ? 1 : -1;
      var aEnCurso = a.fechaFin === null;
      var bEnCurso = b.fechaFin === null;
      if (aEnCurso !== bEnCurso) return aEnCurso ? -1 : 1;
      return 0;
    });
  }

  // ---- Utilidades de nodos (sin innerHTML) ----

  function crear(etiqueta, clase, texto) {
    var nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto != null) nodo.textContent = texto;
    return nodo;
  }

  function crearTime(fecha, texto, clase) {
    var time = crear('time', clase, texto);
    time.setAttribute('datetime', fecha);
    return time;
  }

  function esUrlSegura(url) {
    if (typeof url !== 'string') return false;
    var valor = url.trim();
    if (valor.charAt(0) === '#') return true;
    return /^(https?:|mailto:)/i.test(valor);
  }

  function crearEnlace(texto, url, clase) {
    var enlace = crear('a', clase, texto);
    if (esUrlSegura(url)) enlace.setAttribute('href', url.trim());
    return enlace;
  }

  // String o array de strings -> lista de <p>
  function crearParrafos(descripcion, clase) {
    var textos = Array.isArray(descripcion) ? descripcion : [descripcion];
    return textos
      .filter(function (texto) { return typeof texto === 'string' && texto !== ''; })
      .map(function (texto) { return crear('p', clase, texto); });
  }

  // Fecha de rango: corta "AAAA – AAAA" y larga "mes, AAAA" / "mes, AAAA" en dos líneas
  function crearFechaRango(fechaInicio, fechaFin) {
    var contenedor = crear('p', 'linea-tiempo-fecha');

    var corta = crear('span', 'linea-tiempo-fecha-corta');
    corta.appendChild(crearTime(formatearAnio(fechaInicio), formatearAnio(fechaInicio)));
    corta.appendChild(document.createTextNode(' – '));
    if (fechaFin == null) {
      corta.appendChild(document.createTextNode(TEXTO_ACTUALIDAD));
    } else {
      corta.appendChild(crearTime(formatearAnio(fechaFin), formatearAnio(fechaFin)));
    }

    var larga = crear('span', 'linea-tiempo-fecha-larga');
    larga.appendChild(crearTime(fechaInicio, formatearMesAnio(fechaInicio), 'linea-tiempo-inicio'));
    larga.appendChild(crear('span', 'linea-tiempo-guion', ' – '));
    if (fechaFin == null) {
      larga.appendChild(crear('span', 'linea-tiempo-fin', TEXTO_ACTUALIDAD));
    } else {
      larga.appendChild(crearTime(fechaFin, formatearMesAnio(fechaFin), 'linea-tiempo-fin'));
    }

    contenedor.appendChild(corta);
    contenedor.appendChild(larga);
    return contenedor;
  }

  // Lista en línea con etiqueta ("Habilidades personales: a · b"); la
  // etiqueta es opcional y por defecto "Habilidades personales:"
  function crearAptitudes(aptitudes, etiqueta) {
    var bloque = crear('div', 'linea-tiempo-aptitudes');
    bloque.appendChild(crear('span', 'linea-tiempo-etiqueta', etiqueta || 'Habilidades personales:'));
    bloque.appendChild(document.createTextNode(' '));
    var lista = crear('ul', 'lista-en-linea');
    aptitudes.forEach(function (aptitud) {
      lista.appendChild(crear('li', null, aptitud));
    });
    bloque.appendChild(lista);
    return bloque;
  }

  // ---- Referencias (catálogo "referencias" del JSON) ----

  // Referencia generada desde un proyecto: título, primera imagen (siempre la
  // primera; sin ruta válida, rectángulo provisional) y enlace interno
  function referenciaDesdeProyecto(proyecto) {
    var primera = Array.isArray(proyecto.imagenes) ? proyecto.imagenes[0] : null;
    var ruta = primera && typeof primera === 'object' ? rutaImagenPequena(primera) : null;
    return {
      titulo: proyecto.titulo,
      img: ruta,
      alt: ruta && typeof primera.alt === 'string' && primera.alt !== '' ? primera.alt : proyecto.titulo,
      enlace: '#' + proyecto.id,
      idProyecto: proyecto.id
    };
  }

  // Proyecto al que lleva un id de referencia (null si ninguno): el propio
  // id si es de un proyecto de la sección Proyectos (manda sobre el
  // catálogo) o una entrada del catálogo con enlace "#<id-proyecto>"
  function proyectoDeReferencia(id, contexto) {
    if (typeof id !== 'string') return null;
    var catalogo = (contexto && contexto.referencias) || {};
    var proyectosPorId = (contexto && contexto.proyectosPorId) || {};
    if (Object.prototype.hasOwnProperty.call(proyectosPorId, id)) return proyectosPorId[id];
    var entrada = Object.prototype.hasOwnProperty.call(catalogo, id) ? catalogo[id] : null;
    if (entrada && typeof entrada.enlace === 'string') {
      var enlace = entrada.enlace.trim();
      var idEnlace = enlace.charAt(0) === '#' ? enlace.slice(1) : '';
      if (idEnlace && Object.prototype.hasOwnProperty.call(proyectosPorId, idEnlace)) {
        return proyectosPorId[idEnlace];
      }
    }
    return null;
  }

  // Array de ids -> referencias listas para pintar (proyectoDeReferencia:
  // las que llevan a un proyecto toman sus datos). Los ids desconocidos se
  // ignoran
  function resolverReferencias(ids, contexto) {
    if (!Array.isArray(ids)) return [];
    var catalogo = (contexto && contexto.referencias) || {};
    var proyectosPorId = (contexto && contexto.proyectosPorId) || {};
    return ids.reduce(function (lista, id) {
      var valido = typeof id === 'string';
      var entrada = valido && Object.prototype.hasOwnProperty.call(catalogo, id) ? catalogo[id] : null;
      if (entrada && valido && Object.prototype.hasOwnProperty.call(proyectosPorId, id)) {
        console.warn('Entrada del catálogo de referencias innecesaria (ya es un proyecto):', id);
      }
      var proyecto = proyectoDeReferencia(id, contexto);
      if (proyecto && typeof proyecto.titulo === 'string' && proyecto.titulo !== '') {
        lista.push(referenciaDesdeProyecto(proyecto));
      } else if (!proyecto && entrada && typeof entrada.titulo === 'string' && entrada.titulo !== '') {
        lista.push({
          titulo: entrada.titulo,
          img: esRutaImagenSegura(entrada.img) ? entrada.img.trim() : null,
          alt: entrada.titulo,
          enlace: entrada.enlace
        });
      } else {
        console.warn('Referencia desconocida o sin título:', id);
      }
      return lista;
    }, []);
  }

  // Tarjeta: título arriba e imagen (o rectángulo provisional) debajo.
  // Con enlace válido es un <a>: si apunta a un proyecto, main.js abre su
  // ventana de detalle; http(s), pestaña nueva.
  // Sin enlace es un <div> no interactivo.
  // Si lleva a un proyecto con méritos, lleva la estrella (marcarTarjetaMerito)
  // salvo con opciones.sinEstrella (la tarjeta dentro de un mérito, donde
  // sería redundante)
  function crearTarjetaReferencia(referencia, opciones) {
    var sinEstrella = !!(opciones && opciones.sinEstrella);
    var url = typeof referencia.enlace === 'string' ? referencia.enlace.trim() : '';
    var tarjeta;
    if (esUrlSegura(url)) {
      tarjeta = crearEnlace(null, url, 'referencia-tarjeta');
      // Nombre accesible solo con el título (el alt de la imagen lo repetiría)
      tarjeta.setAttribute('aria-label', referencia.titulo);
      if (referencia.idProyecto) {
        tarjeta.classList.add('enlace-proyecto');
        tarjeta.setAttribute('data-proyecto', referencia.idProyecto);
      } else if (/^https?:/i.test(url)) {
        tarjeta.target = '_blank';
        tarjeta.rel = 'noopener noreferrer';
      }
    } else {
      tarjeta = crear('div', 'referencia-tarjeta referencia-tarjeta--sin-enlace');
    }
    tarjeta.appendChild(crear('span', 'referencia-titulo', referencia.titulo));
    tarjeta.appendChild(crearImagenTarjeta(referencia.img, referencia.alt));
    if (!sinEstrella && marcarTarjetaMerito(tarjeta, referencia.idProyecto) &&
        tarjeta.hasAttribute('aria-label')) {
      tarjeta.setAttribute('aria-label', referencia.titulo + etiquetaMeritos(referencia.idProyecto));
    }

    var li = crear('li');
    li.appendChild(tarjeta);
    return li;
  }

  // Imagen cuadrada de una tarjeta (Referencias y Proyectos); sin ruta,
  // rectángulo provisional
  function crearImagenTarjeta(ruta, alt) {
    var imagen = crear('span', 'referencia-imagen');
    if (ruta) {
      var img = document.createElement('img');
      img.src = ruta;
      img.alt = alt;
      img.loading = 'lazy';
      img.decoding = 'async';
      imagen.appendChild(img);
    } else {
      imagen.classList.add('referencia-imagen--provisional');
    }
    return imagen;
  }

  // Bloque de referencias: cuadrícula de tarjetas sin título visible (null si
  // no hay ninguna válida). La lista lleva aria-label para que los lectores
  // de pantalla la sigan identificando como "Referencias"
  function crearReferencias(ids, contexto) {
    var referencias = resolverReferencias(ids, contexto);
    if (!referencias.length) return null;
    var bloque = crear('div', 'linea-tiempo-proyectos linea-tiempo-referencias');
    var lista = crear('ul', 'referencias-lista');
    lista.setAttribute('aria-label', 'Referencias');
    referencias.forEach(function (referencia) {
      lista.appendChild(crearTarjetaReferencia(referencia));
    });
    bloque.appendChild(lista);
    return bloque;
  }

  // Fecha simple (Méritos, siempre visibles): solo "mes, AAAA"
  function crearFechaSimple(fecha) {
    var contenedor = crear('p', 'linea-tiempo-fecha linea-tiempo-fecha--simple');
    contenedor.appendChild(crearTime(fecha, formatearMesAnio(fecha)));
    return contenedor;
  }

  // Entrada de línea de tiempo con fechas de rango (Experiencia, Estudios)
  // datos: { idDetalle, titulo, subtitulo, fechaInicio, fechaFin, descripcion, tecnologia, aptitudes, referencias, logo, logoAclararEnOscuro }
  // datos.logo (ruta de imagen) es opcional: si es válida, fecha y logo van
  // juntos en un contenedor (.linea-tiempo-lateral) que ocupa la celda de la
  // fecha, con el logo en el flujo normal debajo de la fecha (ocupe esta una
  // línea o varias). datos.logoAclararEnOscuro (true) lo pasa a silueta clara
  // en los temas oscuros (logos oscuros transparentes)
  function crearEntradaRango(datos) {
    var entrada = crear('li', 'linea-tiempo-entrada');
    var fecha = crearFechaRango(datos.fechaInicio, datos.fechaFin);
    var logo = crearLogoEntrada(datos.logo, entrada, datos.logoAclararEnOscuro === true);
    if (logo) {
      var lateral = crear('div', 'linea-tiempo-lateral');
      lateral.appendChild(fecha);
      lateral.appendChild(logo);
      entrada.appendChild(lateral);
    } else {
      entrada.appendChild(fecha);
    }
    entrada.appendChild(crearCuerpo(datos));
    return entrada;
  }

  // Logo decorativo de la entrada (el nombre ya va en el subtítulo, alt
  // vacío). Marca la entrada con --con-logo (en móvil baja el título y el
  // punto); si la imagen no carga, se quita el logo y la marca para que la
  // entrada quede como sin logo. Devuelve null si la ruta no es válida.
  function crearLogoEntrada(ruta, entrada, aclararEnOscuro) {
    if (!esRutaImagenSegura(ruta)) return null;
    var img = crear('img', 'linea-tiempo-logo');
    if (aclararEnOscuro) img.classList.add('linea-tiempo-logo--aclarar-oscuro');
    img.src = ruta.trim();
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', function () {
      img.remove();
      entrada.classList.remove('linea-tiempo-entrada--con-logo');
    });
    entrada.classList.add('linea-tiempo-entrada--con-logo');
    return img;
  }

  // Separador tras la descripción (detalle de proyecto y entradas de la
  // línea de tiempo): inserta un <hr> en la posición `posicion` de
  // `contenedor`, solo si después de la descripción se ha añadido algo
  function insertarSeparadorDescripcion(contenedor, posicion) {
    if (contenedor.childNodes.length > posicion) {
      contenedor.insertBefore(crear('hr', 'separador-descripcion'), contenedor.childNodes[posicion]);
    }
  }

  // Cuerpo común: h3 con botón, subtítulo y detalle desplegable (descripción,
  // separador si sigue algo, tecnología, aptitudes, separador si hay alguno
  // de los dos anteriores y referencias).
  // datos.tecnologia (array de textos) y datos.referencias (bloque de
  // Referencias o null) son opcionales.
  function crearCuerpo(datos) {
    var cuerpo = crear('div', 'linea-tiempo-cuerpo');

    var h3 = crear('h3', 'linea-tiempo-titulo');
    var boton = crear('button', 'linea-tiempo-alternar');
    boton.type = 'button';
    boton.setAttribute('aria-expanded', 'false');
    boton.setAttribute('aria-controls', datos.idDetalle);
    boton.appendChild(crear('span', 'linea-tiempo-texto-titulo', datos.titulo));
    // Icono vacío: la forma la dibuja el CSS (clip-path)
    var flecha = crear('span', 'linea-tiempo-flecha');
    flecha.setAttribute('aria-hidden', 'true');
    boton.appendChild(flecha);
    h3.appendChild(boton);
    cuerpo.appendChild(h3);

    cuerpo.appendChild(crear('p', 'linea-tiempo-subtitulo', datos.subtitulo));

    var detalle = crear('div', 'linea-tiempo-detalle');
    detalle.id = datos.idDetalle;
    detalle.inert = true;
    detalle.setAttribute('inert', '');
    var interior = crear('div', 'linea-tiempo-detalle-interior');
    crearParrafos(datos.descripcion, 'linea-tiempo-descripcion').forEach(function (p) {
      interior.appendChild(p);
    });
    // Posición tras la descripción para el separador
    var hijosTrasDescripcion = interior.childNodes.length;
    if (Array.isArray(datos.tecnologia) && datos.tecnologia.length) {
      interior.appendChild(crearAptitudes(datos.tecnologia, 'Tecnología:'));
    }
    if (Array.isArray(datos.aptitudes) && datos.aptitudes.length) {
      interior.appendChild(crearAptitudes(datos.aptitudes));
    }
    if (datos.referencias) {
      // Separador antes de las referencias solo si entre la descripción y
      // ellas hay algún bloque (tecnología o aptitudes); si van justo tras
      // la descripción ya las separa el <hr> de la descripción
      if (interior.childNodes.length > hijosTrasDescripcion) {
        interior.appendChild(crear('hr', 'separador-descripcion'));
      }
      interior.appendChild(datos.referencias);
    }
    insertarSeparadorDescripcion(interior, hijosTrasDescripcion);
    detalle.appendChild(interior);
    cuerpo.appendChild(detalle);
    return cuerpo;
  }

  // ---- Imágenes de proyectos ----

  var ENCUADRES_VALIDOS = ['arriba', 'abajo', 'izquierda', 'derecha'];

  // Rutas relativas o http(s); se rechaza cualquier otro esquema (javascript:, data:...)
  function esRutaImagenSegura(ruta) {
    if (typeof ruta !== 'string') return false;
    var valor = ruta.trim();
    if (valor === '' || valor.indexOf('//') === 0) return false;
    if (/^https?:\/\//i.test(valor)) return true;
    return !/^[a-z][a-z0-9+.\-]*:/i.test(valor);
  }

  // Ruta para la vista pequeña: "low" o, si falta o no es válida, "high"
  function rutaImagenPequena(imagen) {
    if (esRutaImagenSegura(imagen.low)) return imagen.low.trim();
    if (esRutaImagenSegura(imagen.high)) return imagen.high.trim();
    return null;
  }

  // Miniatura ampliable con el visor (ventana de detalle de un proyecto)
  function crearMiniatura(imagen, numero, tituloProyecto) {
    var li = crear('li');
    var boton = crear('button', 'proyecto-miniatura');
    boton.type = 'button';
    boton.setAttribute('aria-label', 'Ampliar imagen ' + numero + ' de ' + tituloProyecto);
    // Miniatura: "low" o, si falta, "high". Sin ninguna válida, el botón
    // queda vacío (cuadrado provisional)
    var rutaMiniatura = imagen ? rutaImagenPequena(imagen) : null;
    if (rutaMiniatura) {
      var img = document.createElement('img');
      img.src = rutaMiniatura;
      img.alt = imagen.alt || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      if (ENCUADRES_VALIDOS.indexOf(imagen.encuadre) !== -1) {
        img.className = 'encuadre-' + imagen.encuadre;
      }
      // El visor lee data-imagen-grande del botón
      if (esRutaImagenSegura(imagen.high)) {
        boton.setAttribute('data-imagen-grande', imagen.high.trim());
      }
      boton.appendChild(img);
    }
    li.appendChild(boton);
    return li;
  }

  // ---- Proyectos: bandas por año con tarjetas ----

  var TEXTO_BANDA_ACTUAL = 'Actual';
  var TEXTO_BANDA_VACIA = ' (sin proyectos)';
  // Tarjetas creadas una sola vez (ordenadas por fecha descendente) y
  // reubicadas en las bandas cada vez que cambia el filtro
  var tarjetasProyectos = [];
  var tarjetasPorId = {};
  var proyectosPorId = {};
  var contenedorBandas = null;

  // Tarjeta de proyecto: nombre (2 líneas) y categoría (1 línea) arriba e
  // imagen cuadrada debajo, con las clases de las tarjetas de Referencias.
  // Es un botón que abre la ventana de detalle (main.js, por delegación).
  // El id va en data-proyecto, no en id: así "#<id>" en la URL no desplaza
  // la página hasta la tarjeta
  function crearTarjetaProyecto(proyecto) {
    var referencia = referenciaDesdeProyecto(proyecto);
    var tarjeta = crear('button', 'referencia-tarjeta proyecto-tarjeta');
    tarjeta.type = 'button';
    tarjeta.setAttribute('aria-haspopup', 'dialog');
    // Nombre accesible: título y categoría (el alt de la imagen sobraría)
    tarjeta.setAttribute('aria-label', proyecto.categoria
      ? proyecto.titulo + ', ' + proyecto.categoria
      : proyecto.titulo);
    if (proyecto.id) tarjeta.setAttribute('data-proyecto', proyecto.id);
    if (proyecto.categoria) tarjeta.setAttribute('data-categoria', proyecto.categoria);
    tarjeta.appendChild(crear('span', 'referencia-titulo proyecto-tarjeta-titulo', proyecto.titulo));
    if (proyecto.categoria) {
      tarjeta.appendChild(crear('span', 'proyecto-tarjeta-categoria', proyecto.categoria));
    }
    tarjeta.appendChild(crearImagenTarjeta(referencia.img, referencia.alt));
    if (marcarTarjetaMerito(tarjeta, proyecto.id)) {
      tarjeta.setAttribute('aria-label', tarjeta.getAttribute('aria-label') + etiquetaMeritos(proyecto.id));
    }
    var li = crear('li');
    li.appendChild(tarjeta);
    return li;
  }

  // Títulos (sin repetir) de los méritos de un proyecto
  function titulosMeritos(id) {
    var titulos = [];
    meritosDeProyecto(id).forEach(function (merito) {
      if (titulos.indexOf(merito.titulo) === -1) titulos.push(merito.titulo);
    });
    return titulos;
  }

  // Lo que se añade al aria-label de una tarjeta de un proyecto con méritos
  // ('' si no tiene)
  function etiquetaMeritos(id) {
    var titulos = titulosMeritos(id);
    if (!titulos.length) return '';
    return titulos.length === 1
      ? ', con reconocimiento: ' + titulos[0]
      : ', con ' + titulos.length + ' reconocimientos: ' + titulos.join(', ');
  }

  // Si el proyecto tiene méritos, añade a la tarjeta la clase
  // --merito y la estrella decorativa de la esquina (sin acción ni
  // tooltip: los méritos van en el aria-label, etiquetaMeritos). Devuelve
  // si la ha marcado. La usan las tarjetas de Proyectos, de Referencias y
  // de la Línea de tiempo (que reutiliza crearTarjetaProyecto)
  function marcarTarjetaMerito(tarjeta, id) {
    if (!titulosMeritos(id).length) return false;
    tarjeta.classList.add('referencia-tarjeta--merito');
    tarjeta.appendChild(crearIconoEstrella('tarjeta-estrella'));
    return true;
  }

  // ---- Proyectos: ventana de detalle ----

  // Id del título del detalle: lo usa aria-labelledby del <dialog> en index.html
  var ID_TITULO_DETALLE = 'detalle-proyecto-titulo';
  var TEXTO_EN_CURSO = 'En curso';

  function esFechaValida(fecha) {
    var partes = /^(\d{4})-(\d{2})$/.exec(String(fecha));
    return !!partes && parseInt(partes[2], 10) >= 1 && parseInt(partes[2], 10) <= 12;
  }

  // "mes, AAAA"; en curso: "En curso · desde mes, AAAA" (o solo "En curso")
  function crearFechaDetalle(proyecto) {
    var parrafo = crear('p', 'detalle-proyecto-fecha');
    var fechaValida = esFechaValida(proyecto.fecha);
    if (proyecto.enCurso === true) {
      parrafo.appendChild(document.createTextNode(TEXTO_EN_CURSO));
      if (fechaValida) {
        parrafo.appendChild(document.createTextNode(' · desde '));
        parrafo.appendChild(crearTime(proyecto.fecha, formatearMesAnio(proyecto.fecha)));
      }
    } else if (fechaValida) {
      parrafo.appendChild(crearTime(proyecto.fecha, formatearMesAnio(proyecto.fecha)));
    } else {
      return null;
    }
    return parrafo;
  }

  // URL sin "http(s)://" ni barra final, como texto del enlace
  function limpiarUrl(url) {
    return url.replace(/^https?:\/\//i, '').replace(/\/+$/, '') || url;
  }

  // Estrella decorativa: <span aria-hidden> con la clase indicada y el SVG
  function crearIconoEstrella(clase) {
    var estrella = crear('span', clase);
    estrella.setAttribute('aria-hidden', 'true');
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('focusable', 'false');
    var ruta = document.createElementNS(SVG_NS, 'path');
    ruta.setAttribute('d', RUTA_ESTRELLA);
    svg.appendChild(ruta);
    estrella.appendChild(svg);
    return estrella;
  }

  // Franja de reconocimientos del detalle: un bloque por mérito con su
  // título (h3, con estrella decorativa) y descripción, como en Méritos
  // (sin entidad ni fecha). null si el proyecto no tiene méritos
  function crearPremiosDetalle(meritos) {
    if (!Array.isArray(meritos) || !meritos.length) return null;
    var region = crear('section', 'detalle-proyecto-premios');
    region.setAttribute('aria-label', meritos.length === 1 ? 'Reconocimiento' : 'Reconocimientos');
    meritos.forEach(function (merito) {
      var premio = crear('div', 'detalle-proyecto-premio');
      var titulo = crear('h3', 'detalle-proyecto-premio-titulo');
      titulo.appendChild(crearIconoEstrella('detalle-proyecto-premio-estrella'));
      titulo.appendChild(document.createTextNode(merito.titulo));
      premio.appendChild(titulo);
      crearParrafos(merito.descripcion, 'detalle-proyecto-premio-descripcion').forEach(function (p) {
        premio.appendChild(p);
      });
      region.appendChild(premio);
    });
    return region;
  }

  // Apartado opcional con título (h3) y párrafos; null si no hay texto
  function crearApartadoDetalle(titulo, contenido) {
    var parrafos = crearParrafos(contenido, 'detalle-proyecto-parrafo');
    if (!parrafos.length) return null;
    var apartado = crear('div', 'detalle-proyecto-apartado');
    apartado.appendChild(crear('h3', 'detalle-proyecto-apartado-titulo', titulo));
    parrafos.forEach(function (p) { apartado.appendChild(p); });
    return apartado;
  }

  // Botones de icono de "enlaces", en el orden en que se muestran (después
  // van los de "web-generico"). nombre: aria-label y title; el icono (SVG
  // monocromo) lo pinta una máscara CSS en .detalle-proyecto-boton-icono--<clase>;
  // descarga: añade el atributo download. Para añadir un tipo nuevo, añade
  // aquí una entrada y su máscara en estilos/comun.css
  var TIPOS_ENLACE_PROYECTO = [
    { tipo: 'github', nombre: 'GitHub', clase: 'github' },
    { tipo: 'itch.io', nombre: 'itch.io', clase: 'itch-io' },
    { tipo: 'steam', nombre: 'Steam', clase: 'steam' },
    { tipo: 'linkedin', nombre: 'LinkedIn', clase: 'linkedin' },
    { tipo: 'instagram', nombre: 'Instagram', clase: 'instagram' },
    { tipo: 'youtube', nombre: 'YouTube', clase: 'youtube' },
    { tipo: 'pdf-download', nombre: 'Descargar PDF', clase: 'pdf', descarga: true }
  ];
  var TIPO_ENLACE_GENERICO = 'web-generico';

  // Como esUrlSegura, pero admite también rutas relativas ("./…" o "../…"),
  // p. ej. un PDF del propio repositorio
  function esUrlEnlaceSegura(url) {
    if (typeof url !== 'string') return false;
    return esUrlSegura(url) || /^\.{1,2}\//.test(url.trim());
  }

  // URL de una entrada { url: "…" }; '' si no es válida (con aviso).
  // origen: quién tiene el enlace en los avisos, p. ej. 'Proyecto "<id>"'
  function urlEntradaEnlace(entrada, tipo, origen) {
    var url = entrada && typeof entrada === 'object' && typeof entrada.url === 'string'
      ? entrada.url.trim() : '';
    if (!esUrlEnlaceSegura(url)) {
      console.warn(origen + ': enlace "' + tipo + '" sin url válida; se ignora.');
      return '';
    }
    return url;
  }

  // Enlace a otra página: en pestaña nueva
  function abrirEnPestanaNueva(enlace, url) {
    if (/^https?:/i.test(url)) {
      enlace.target = '_blank';
      enlace.rel = 'noopener noreferrer';
    }
  }

  // Región de enlaces del detalle: fila de botones redondos de icono (en el
  // orden de TIPOS_ENLACE_PROYECTO) y después los botones de texto de
  // "web-generico" (objeto o array de { texto, url }). Claves desconocidas y
  // entradas sin url válida: se ignoran con aviso. null si no queda ninguno.
  // Se usa en el detalle de proyecto y en los destacados; origen: quién tiene
  // los enlaces en los avisos de consola (p. ej. 'Proyecto "<id>"')
  function crearEnlacesProyecto(enlaces, origen) {
    if (!enlaces || typeof enlaces !== 'object' || Array.isArray(enlaces)) return null;
    var tiposConocidos = TIPOS_ENLACE_PROYECTO.map(function (t) { return t.tipo; });
    Object.keys(enlaces).forEach(function (tipo) {
      if (tipo !== TIPO_ENLACE_GENERICO && tiposConocidos.indexOf(tipo) === -1) {
        console.warn(origen + ': tipo de enlace desconocido "' + tipo +
          '". Añádelo a TIPOS_ENLACE_PROYECTO en scripts/contenido.js.');
      }
    });

    var fila = crear('div', 'detalle-proyecto-enlaces-fila');
    TIPOS_ENLACE_PROYECTO.forEach(function (t) {
      if (!Object.prototype.hasOwnProperty.call(enlaces, t.tipo)) return;
      var url = urlEntradaEnlace(enlaces[t.tipo], t.tipo, origen);
      if (!url) return;
      var boton = crear('a', 'detalle-proyecto-boton-icono detalle-proyecto-boton-icono--' + t.clase);
      boton.setAttribute('href', url);
      boton.setAttribute('aria-label', t.nombre);
      boton.title = t.nombre;
      if (t.descarga) boton.setAttribute('download', '');
      abrirEnPestanaNueva(boton, url);
      var mascara = crear('span', 'detalle-proyecto-icono icono-mascara');
      mascara.setAttribute('aria-hidden', 'true');
      boton.appendChild(mascara);
      fila.appendChild(boton);
    });

    var genericos = enlaces[TIPO_ENLACE_GENERICO];
    if (genericos != null) {
      (Array.isArray(genericos) ? genericos : [genericos]).forEach(function (entrada) {
        var url = urlEntradaEnlace(entrada, TIPO_ENLACE_GENERICO, origen);
        if (!url) return;
        var texto = typeof entrada.texto === 'string' && entrada.texto.trim()
          ? entrada.texto.trim() : limpiarUrl(url);
        var boton = crear('a', 'detalle-proyecto-boton-texto', texto);
        boton.setAttribute('href', url);
        abrirEnPestanaNueva(boton, url);
        fila.appendChild(boton);
      });
    }

    if (!fila.childNodes.length) return null;
    var region = crear('div', 'detalle-proyecto-enlaces');
    region.appendChild(fila);
    return region;
  }

  // Contenido de la ventana: texto (título, categoría, fecha, descripción,
  // separador (solo si sigue algo), retos, tecnología, experiencia personal, comentarios, aptitudes,
  // reconocimientos (méritos del proyecto) y enlaces; los opcionales solo si
  // tienen contenido) y, si hay imágenes,
  // su cuadrícula de miniaturas
  function crearDetalleProyecto(proyecto) {
    var imagenes = Array.isArray(proyecto.imagenes) ? proyecto.imagenes : [];
    var cuerpo = crear('div', 'detalle-proyecto-cuerpo' + (imagenes.length ? '' : ' detalle-proyecto-cuerpo--sin-imagenes'));

    var texto = crear('div', 'detalle-proyecto-texto');
    var titulo = crear('h2', 'detalle-proyecto-titulo', proyecto.titulo);
    titulo.id = ID_TITULO_DETALLE;
    texto.appendChild(titulo);
    if (proyecto.categoria) texto.appendChild(crear('p', 'detalle-proyecto-categoria', proyecto.categoria));
    var fecha = crearFechaDetalle(proyecto);
    if (fecha) texto.appendChild(fecha);
    crearParrafos(proyecto.descripcion, 'detalle-proyecto-descripcion').forEach(function (p) {
      texto.appendChild(p);
    });
    // Posición tras la descripción: el separador se inserta aquí al final,
    // solo si después se ha añadido alguna sección o los enlaces
    var hijosTrasDescripcion = texto.childNodes.length;
    var retos = crearApartadoDetalle('Retos', proyecto.retos);
    if (retos) texto.appendChild(retos);
    if (Array.isArray(proyecto.tecnologia) && proyecto.tecnologia.length) {
      texto.appendChild(crearAptitudes(proyecto.tecnologia, 'Tecnología:'));
    }
    var experiencia = crearApartadoDetalle('Experiencia personal', proyecto.experienciaPersonal);
    if (experiencia) texto.appendChild(experiencia);
    var comentarios = crearApartadoDetalle('Comentarios adicionales', proyecto.comentarios);
    if (comentarios) texto.appendChild(comentarios);
    if (Array.isArray(proyecto.aptitudes) && proyecto.aptitudes.length) {
      texto.appendChild(crearAptitudes(proyecto.aptitudes));
    }
    var premios = crearPremiosDetalle(meritosDeProyecto(proyecto.id));
    if (premios) texto.appendChild(premios);
    var enlaces = crearEnlacesProyecto(proyecto.enlaces, 'Proyecto "' + proyecto.id + '"');
    if (enlaces) texto.appendChild(enlaces);
    insertarSeparadorDescripcion(texto, hijosTrasDescripcion);
    cuerpo.appendChild(texto);

    if (imagenes.length) {
      var lista = crear('ul', 'detalle-proyecto-imagenes');
      lista.setAttribute('aria-label', 'Imágenes del proyecto');
      imagenes.forEach(function (imagen, i) {
        lista.appendChild(crearMiniatura(imagen && typeof imagen === 'object' ? imagen : null, i + 1, proyecto.titulo));
      });
      cuerpo.appendChild(lista);
    }
    return cuerpo;
  }

  // Banda: etiqueta (h3) y lista de tarjetas. En el DOM la etiqueta va
  // primero (el lector de pantalla la anuncia antes que sus proyectos) y
  // se ve encima de ellos, como encabezado de la banda
  function crearBandaProyectos(clave, texto, items) {
    var banda = crear('div', 'proyectos-banda' + (items.length ? '' : ' proyectos-banda--vacia'));
    var idEtiqueta = 'banda-proyectos-' + clave;
    banda.setAttribute('role', 'group');
    banda.setAttribute('aria-labelledby', idEtiqueta);

    var etiqueta = crear('h3', 'proyectos-banda-etiqueta');
    etiqueta.id = idEtiqueta;
    etiqueta.appendChild(clave === 'actual' ? crear('span', null, texto) : crearTime(texto, texto));
    if (!items.length) etiqueta.appendChild(crear('span', 'solo-lector', TEXTO_BANDA_VACIA));
    banda.appendChild(etiqueta);

    if (items.length) {
      var lista = crear('ul', 'referencias-lista proyectos-lista');
      items.forEach(function (item) { lista.appendChild(item.nodo); });
      banda.appendChild(lista);
    }
    return banda;
  }

  // (Re)monta las bandas con los proyectos visibles según el filtro
  // ('todos' o una categoría): "Actual" con los en curso (si hay alguno) y
  // un año por banda, del más reciente al más antiguo con proyectos; los
  // años intermedios sin proyectos quedan como banda vacía (solo la línea)
  function montarBandasProyectos(filtro) {
    if (!contenedorBandas) return;
    var visibles = tarjetasProyectos.filter(function (item) {
      return !filtro || filtro === 'todos' || item.categoria === filtro;
    });
    var enCurso = visibles.filter(function (item) { return item.enCurso; });
    var porAnio = {};
    var anios = [];
    visibles.forEach(function (item) {
      if (item.enCurso) return;
      if (!porAnio[item.anio]) {
        porAnio[item.anio] = [];
        anios.push(item.anio);
      }
      porAnio[item.anio].push(item);
    });

    var bandas = [];
    if (enCurso.length) bandas.push(crearBandaProyectos('actual', TEXTO_BANDA_ACTUAL, enCurso));
    if (anios.length) {
      var masReciente = Math.max.apply(null, anios);
      var masAntiguo = Math.min.apply(null, anios);
      for (var anio = masReciente; anio >= masAntiguo; anio--) {
        bandas.push(crearBandaProyectos(String(anio), String(anio), porAnio[anio] || []));
      }
    }
    contenedorBandas.replaceChildren.apply(contenedorBandas, bandas);
  }

  // ---- Méritos ----

  // Referencia del proyecto de un mérito (id del proyecto o clave del
  // catálogo): campo "proyecto" o, en datos antiguos, el primer elemento
  // de "referencias". null si no tiene
  function referenciaDeMerito(merito) {
    if (!merito || typeof merito !== 'object') return null;
    if (typeof merito.proyecto === 'string' && merito.proyecto !== '') return merito.proyecto;
    if (Array.isArray(merito.referencias) && typeof merito.referencias[0] === 'string') {
      return merito.referencias[0];
    }
    return null;
  }

  // Méritos por proyecto: { idProyecto: [méritos] }, en el orden de la
  // sección Méritos (fecha descendente). Un mérito cuenta para el proyecto
  // al que lleva su referencia (proyectoDeReferencia); los que no llevan a
  // ningún proyecto o no tienen título no cuentan. Se calcula una vez al
  // cargar los datos (meritosPorIdProyecto)
  var meritosPorIdProyecto = {};
  function crearMeritosPorProyecto(meritos, contexto) {
    var mapa = {};
    ordenarPorFecha(Array.isArray(meritos) ? meritos : [], 'fecha').forEach(function (merito) {
      if (!merito || typeof merito !== 'object') return;
      if (typeof merito.titulo !== 'string' || merito.titulo === '') return;
      var proyecto = proyectoDeReferencia(referenciaDeMerito(merito), contexto);
      if (!proyecto) return;
      if (!Object.prototype.hasOwnProperty.call(mapa, proyecto.id)) mapa[proyecto.id] = [];
      mapa[proyecto.id].push(merito);
    });
    return mapa;
  }

  // Méritos de un proyecto (copia; vacía si no tiene)
  function meritosDeProyecto(id) {
    return typeof id === 'string' && Object.prototype.hasOwnProperty.call(meritosPorIdProyecto, id)
      ? meritosPorIdProyecto[id].slice()
      : [];
  }

  // Entrada fija (sin desplegable): fecha y tarjeta con título, entidad
  // (opcional) y descripción a la izquierda y, si lo hay, la tarjeta del
  // proyecto (crearTarjetaReferencia) a la derecha
  function crearEntradaMerito(merito, contexto) {
    var entrada = crear('li', 'linea-tiempo-entrada linea-tiempo-entrada--merito');
    entrada.appendChild(crearFechaSimple(merito.fecha));

    var cuerpo = crear('div', 'linea-tiempo-cuerpo merito-tarjeta');
    var texto = crear('div', 'merito-texto');
    texto.appendChild(crear('h3', 'linea-tiempo-titulo', merito.titulo));
    if (typeof merito.entidad === 'string' && merito.entidad !== '') {
      texto.appendChild(crear('p', 'linea-tiempo-subtitulo', merito.entidad));
    }
    crearParrafos(merito.descripcion, 'linea-tiempo-descripcion').forEach(function (p) {
      texto.appendChild(p);
    });
    cuerpo.appendChild(texto);

    var referencia = referenciaDeMerito(merito);
    var referencias = referencia ? resolverReferencias([referencia], contexto) : [];
    if (referencias.length) {
      var proyecto = crear('div', 'merito-proyecto');
      // Sin estrella: la tarjeta ya está dentro de su mérito
      proyecto.appendChild(crearTarjetaReferencia(referencias[0], { sinEstrella: true }).firstChild);
      cuerpo.appendChild(proyecto);
    }
    entrada.appendChild(cuerpo);
    return entrada;
  }

  // ---- Montaje de secciones ----

  function montarIntroduccion(introduccion) {
    var seccion = document.querySelector('section.introduccion');
    if (!seccion) return;
    seccion.replaceChildren.apply(seccion, crearParrafos(introduccion));
  }

  function montarExperiencia(experiencia, contexto) {
    var lista = document.querySelector('#experiencia .linea-tiempo[data-seccion="experiencia"]');
    if (!lista) return;
    var entradas = ordenarPorFecha(experiencia || [], 'fechaInicio').map(function (item, indice) {
      return crearEntradaRango({
        idDetalle: 'detalle-experiencia-' + (indice + 1),
        titulo: item.puesto,
        subtitulo: item.empresa,
        fechaInicio: item.fechaInicio,
        fechaFin: item.fechaFin,
        descripcion: item.descripcion,
        aptitudes: item.aptitudes,
        referencias: crearReferencias(item.referencias, contexto),
        logo: item.logo,
        logoAclararEnOscuro: item.logoAclararEnOscuro
      });
    });
    lista.replaceChildren.apply(lista, entradas);
  }

  function montarEstudios(estudios, contexto) {
    var lista = document.querySelector('#estudios .linea-tiempo[data-seccion="estudios"]');
    if (!lista) return;
    var entradas = ordenarPorFecha(estudios || [], 'fechaInicio').map(function (item, indice) {
      return crearEntradaRango({
        idDetalle: 'detalle-estudios-' + (indice + 1),
        titulo: item.titulo,
        subtitulo: item.institucion,
        fechaInicio: item.fechaInicio,
        fechaFin: item.fechaFin,
        descripcion: item.descripcion,
        tecnologia: item.tecnologia,
        aptitudes: item.aptitudes,
        referencias: crearReferencias(item.referencias, contexto)
      });
    });
    lista.replaceChildren.apply(lista, entradas);
  }

  function montarProyectos(proyectos) {
    var contenedor = document.querySelector('#proyectos .proyectos-bandas[data-seccion="proyectos"]');
    if (!contenedor) return;
    contenedorBandas = contenedor;
    tarjetasPorId = {};
    proyectosPorId = {};
    tarjetasProyectos = ordenarPorFecha(proyectos || [], 'fecha').reduce(function (lista, proyecto) {
      if (!proyecto || typeof proyecto !== 'object') return lista;
      var anio = parseInt(formatearAnio(proyecto.fecha), 10);
      var enCurso = proyecto.enCurso === true;
      if (!enCurso && isNaN(anio)) {
        console.warn('Proyecto sin fecha válida ("AAAA-MM"), no se muestra:', proyecto.id || proyecto.titulo);
        return lista;
      }
      var nodo = crearTarjetaProyecto(proyecto);
      if (proyecto.id) {
        tarjetasPorId[proyecto.id] = nodo.firstChild;
        proyectosPorId[proyecto.id] = proyecto;
      }
      lista.push({ nodo: nodo, categoria: proyecto.categoria, enCurso: enCurso, anio: anio });
      return lista;
    }, []);
    montarBandasProyectos('todos');
    montarFiltrosProyectos(proyectos, contenedor);
  }

  // Para main.js (filtros, enlaces internos y ventana de detalle): volver a
  // montar las bandas con un filtro, obtener la tarjeta de un proyecto por id
  // (aunque el filtro la tenga fuera del DOM; sirve para saber si existe) y
  // crear el contenido de su ventana de detalle (null si el id no existe).
  // crearTarjeta: <li> con una tarjeta nueva de un proyecto e
  // idProyectoDeReferencia: id del proyecto al que lleva un id de referencia
  // de los datos cargados, o null, e idProyectoDeMerito: lo mismo con el
  // proyecto de un mérito, meritosDeProyecto: méritos de un proyecto por id
  // (lista vacía si no tiene), etiquetaMeritos: texto para el aria-label
  // de una tarjeta con méritos ('' si no tiene) y crearIconoEstrella:
  // estrella decorativa con una clase (los usa la Línea de tiempo,
  // scripts/linea-tiempo.js).
  // main.js añade abrirDetalle y urlDetalle
  window.Proyectos = {
    montar: montarBandasProyectos,
    crearTarjeta: crearTarjetaProyecto,
    idProyectoDeReferencia: function (id) {
      var proyecto = proyectoDeReferencia(id, contextoReferencias);
      return proyecto ? proyecto.id : null;
    },
    idProyectoDeMerito: function (merito) {
      var proyecto = proyectoDeReferencia(referenciaDeMerito(merito), contextoReferencias);
      return proyecto ? proyecto.id : null;
    },
    meritosDeProyecto: meritosDeProyecto,
    etiquetaMeritos: etiquetaMeritos,
    crearIconoEstrella: crearIconoEstrella,
    tarjeta: function (id) {
      return typeof id === 'string' && Object.prototype.hasOwnProperty.call(tarjetasPorId, id)
        ? tarjetasPorId[id]
        : null;
    },
    detalle: function (id) {
      return typeof id === 'string' && Object.prototype.hasOwnProperty.call(proyectosPorId, id)
        ? crearDetalleProyecto(proyectosPorId[id])
        : null;
    }
  };

  function crearBotonFiltro(filtro, texto, activo) {
    var boton = crear('button', 'filtro-proyecto', texto);
    boton.type = 'button';
    boton.setAttribute('data-filtro', filtro);
    boton.setAttribute('aria-pressed', String(activo));
    return boton;
  }

  // Botones de filtro: "Todos" más una categoría única por botón, en orden alfabético
  function montarFiltrosProyectos(proyectos, lista) {
    var previos = lista.parentNode.querySelector('.filtros-proyectos');
    if (previos) previos.remove();
    var categorias = [];
    (proyectos || []).forEach(function (proyecto) {
      var categoria = proyecto && proyecto.categoria;
      if (typeof categoria === 'string' && categoria !== '' && categorias.indexOf(categoria) === -1) {
        categorias.push(categoria);
      }
    });
    if (categorias.length < 2) return;
    categorias.sort(function (a, b) { return a.localeCompare(b, 'es'); });

    var grupo = crear('div', 'filtros-proyectos');
    grupo.setAttribute('role', 'group');
    grupo.setAttribute('aria-label', 'Filtrar proyectos por tecnología');
    grupo.appendChild(crearBotonFiltro('todos', 'Todos', true));
    categorias.forEach(function (categoria) {
      grupo.appendChild(crearBotonFiltro(categoria, categoria, false));
    });
    lista.parentNode.insertBefore(grupo, lista);
  }

  function montarMeritos(meritos, contexto) {
    var lista = document.querySelector('#meritos .linea-tiempo[data-seccion="meritos"]');
    if (!lista) return;
    var entradas = ordenarPorFecha(meritos || [], 'fecha').map(function (item) {
      return crearEntradaMerito(item, contexto);
    });
    lista.replaceChildren.apply(lista, entradas);
  }

  // ---- Panel Destacado ----

  // Ruta de la imagen del panel: "low" o, si falta, "high" (como en Proyectos)
  function rutaImagenDestacado(imagen) {
    return rutaImagenPequena(imagen);
  }

  // Botón que abre el visor (main.js escucha button.destacado-imagen).
  // Sin ruta válida queda vacío: cuadrado provisional que abre el marcador
  // provisional del visor
  function crearImagenDestacado(imagen, titulo) {
    var boton = crear('button', 'destacado-imagen');
    boton.type = 'button';
    var alt = typeof imagen.alt === 'string' ? imagen.alt : '';
    boton.setAttribute('aria-label', alt ? 'Ampliar imagen: ' + alt : 'Ampliar imagen de ' + titulo);
    var ruta = rutaImagenDestacado(imagen);
    if (!ruta) {
      boton.classList.add('destacado-imagen--provisional');
      return boton;
    }
    var img = document.createElement('img');
    img.src = ruta;
    img.alt = alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    if (esRutaImagenSegura(imagen.high)) {
      boton.setAttribute('data-imagen-grande', imagen.high.trim());
    }
    boton.appendChild(img);
    return boton;
  }

  // "#<id>" de un proyecto existente: enlace interno; main.js abre la ventana
  // de detalle del proyecto. http(s): pestaña nueva. Resto: crearEnlace lo valida
  function crearEnlaceDestacado(enlace, proyectosPorId) {
    var url = typeof enlace.url === 'string' ? enlace.url.trim() : '';
    var a = crearEnlace(enlace.texto, url, 'destacado-enlace');
    var flecha = crear('span', 'destacado-enlace-flecha', '→');
    flecha.setAttribute('aria-hidden', 'true');
    a.appendChild(flecha);
    var id = url.charAt(0) === '#' ? url.slice(1) : '';
    if (id && proyectosPorId[id]) {
      a.classList.add('enlace-proyecto');
      a.setAttribute('data-proyecto', id);
    } else if (/^https?:/i.test(url)) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    return a;
  }

  var TITULO_DESTACADO = 'Proyecto destacado';

  // "destacados" (lista) o, por compatibilidad, el antiguo "destacado" (objeto)
  function listaDestacados(datos) {
    var lista = datos.destacados != null ? datos.destacados : datos.destacado;
    if (lista && typeof lista === 'object' && !Array.isArray(lista)) lista = [lista];
    if (!Array.isArray(lista)) return [];
    return lista.filter(function (item) { return item && typeof item === 'object'; });
  }

  // Diapositiva: título, imagen y texto (descripción, enlace y región de
  // botones de "enlaces", con el formato de los proyectos), en ese orden.
  // Solo la primera empieza visible; main.js actualiza inert y aria-hidden
  function crearDiapositivaDestacado(destacado, indice, total, proyectosPorId) {
    var hayImagen = !!(destacado.imagen && typeof destacado.imagen === 'object');
    var diapositiva = crear('div', 'destacado-diapositiva' + (hayImagen ? '' : ' destacado-diapositiva--sin-imagen'));
    if (total > 1) {
      diapositiva.setAttribute('role', 'group');
      diapositiva.setAttribute('aria-roledescription', 'diapositiva');
      diapositiva.setAttribute('aria-label', (indice + 1) + ' de ' + total);
      if (indice > 0) {
        diapositiva.inert = true;
        diapositiva.setAttribute('aria-hidden', 'true');
      }
    }

    var textoTitulo = typeof destacado.titulo === 'string' && destacado.titulo !== ''
      ? destacado.titulo
      : TITULO_DESTACADO;
    diapositiva.appendChild(crear('h2', 'destacado-titulo', textoTitulo));
    if (hayImagen) diapositiva.appendChild(crearImagenDestacado(destacado.imagen, textoTitulo));

    // Las descripciones van en un bloque con scroll vertical propio si no
    // caben (título, imagen y enlaces quedan fijos). main.js lo hace
    // enfocable con teclado solo cuando desborda
    var texto = crear('div', 'destacado-texto');
    var parrafos = crearParrafos(destacado.descripcion, 'destacado-descripcion');
    if (parrafos.length) {
      var descripciones = crear('div', 'destacado-descripciones');
      descripciones.setAttribute('role', 'region');
      descripciones.setAttribute('aria-label', 'Texto de "' + textoTitulo + '"');
      parrafos.forEach(function (p) {
        descripciones.appendChild(p);
      });
      texto.appendChild(descripciones);
    }
    if (destacado.enlace && destacado.enlace.texto) {
      var parrafo = crear('p', 'destacado-accion');
      parrafo.appendChild(crearEnlaceDestacado(destacado.enlace, proyectosPorId));
      texto.appendChild(parrafo);
    }
    if (texto.childNodes.length) diapositiva.appendChild(texto);
    // La caja de enlaces va detrás del texto, como hija de la diapositiva:
    // en ordenador queda igual, al final del texto; en móvil el CSS la
    // coloca bajo la imagen o, sin imagen, a la derecha del texto
    var enlaces = crearEnlacesProyecto(destacado.enlaces, 'Destacado "' + textoTitulo + '"');
    if (enlaces) {
      diapositiva.appendChild(enlaces);
      diapositiva.classList.add('destacado-diapositiva--con-enlaces');
    }
    return diapositiva;
  }

  // Puntos indicadores: un botón por destacado (main.js gestiona los clics)
  function crearPuntosDestacado(total) {
    var grupo = crear('div', 'destacado-puntos');
    grupo.setAttribute('role', 'group');
    grupo.setAttribute('aria-label', 'Elegir destacado');
    for (var i = 0; i < total; i++) {
      var punto = crear('button', 'destacado-punto');
      punto.type = 'button';
      punto.setAttribute('data-indice', String(i));
      punto.setAttribute('aria-label', 'Ir al destacado ' + (i + 1));
      if (i === 0) punto.setAttribute('aria-current', 'true');
      grupo.appendChild(punto);
    }
    return grupo;
  }

  // Carrusel: ventana (recorta) > pista (se desplaza) > diapositivas; debajo,
  // los puntos si hay más de uno. Sin destacados se oculta el panel
  // (main.js oculta también su botón). La rotación la gestiona main.js
  function montarDestacado(destacados, proyectos) {
    var panel = document.getElementById('panel-destacado');
    if (!panel) return;
    panel.replaceChildren();

    var total = destacados.length;
    if (!total) {
      panel.hidden = true;
      return;
    }

    var proyectosPorId = {};
    (proyectos || []).forEach(function (proyecto) {
      if (proyecto && proyecto.id) proyectosPorId[proyecto.id] = proyecto;
    });

    var ventana = crear('div', 'destacado-ventana');
    var pista = crear('div', 'destacado-pista');
    destacados.forEach(function (destacado, indice) {
      pista.appendChild(crearDiapositivaDestacado(destacado, indice, total, proyectosPorId));
    });
    ventana.appendChild(pista);
    panel.appendChild(ventana);

    var esCarrusel = total > 1;
    panel.classList.toggle('panel-destacado--carrusel', esCarrusel);
    if (esCarrusel) {
      panel.setAttribute('aria-roledescription', 'carrusel');
      panel.appendChild(crearPuntosDestacado(total));
    } else {
      panel.removeAttribute('aria-roledescription');
    }
  }

  // Catálogo de referencias y proyectos por id, para las tarjetas de
  // Referencias (el de los datos cargados queda en contextoReferencias)
  var contextoReferencias = null;
  function crearContextoReferencias(datos) {
    var referencias = datos.referencias;
    if (!referencias || typeof referencias !== 'object' || Array.isArray(referencias)) referencias = {};
    var proyectosPorId = {};
    (datos.proyectos || []).forEach(function (proyecto) {
      if (proyecto && proyecto.id) proyectosPorId[proyecto.id] = proyecto;
    });
    return { referencias: referencias, proyectosPorId: proyectosPorId };
  }

  function mostrarAviso(contenedor) {
    if (!contenedor || contenedor.querySelector('.aviso-carga')) return;
    contenedor.appendChild(crear('p', 'aviso-carga', TEXTO_AVISO));
  }

  function emitir(nombre, detalle) {
    document.dispatchEvent(new CustomEvent(nombre, { detail: detalle }));
  }

  function cargarJson(ruta) {
    return fetch(ruta).then(function (respuesta) {
      if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status + ' al cargar ' + ruta);
      return respuesta.json();
    });
  }

  // Fusiona los objetos de cada archivo en uno; avisa si una clave se repite
  function fusionarDatos(partes) {
    var datos = {};
    var origen = {};
    partes.forEach(function (parte, i) {
      Object.keys(parte || {}).forEach(function (clave) {
        if (Object.prototype.hasOwnProperty.call(origen, clave)) {
          console.warn('Clave "' + clave + '" repetida en ' + origen[clave] + ' y ' +
            RUTAS_DATOS[i] + '; se usa la de ' + RUTAS_DATOS[i] + '.');
        }
        origen[clave] = RUTAS_DATOS[i];
      });
      Object.assign(datos, parte);
    });
    return datos;
  }

  Promise.all(RUTAS_DATOS.map(cargarJson))
    .then(fusionarDatos)
    .then(function (datos) {
      montarIntroduccion(datos.introduccion);
      var contexto = crearContextoReferencias(datos);
      contextoReferencias = contexto;
      meritosPorIdProyecto = crearMeritosPorProyecto(datos.meritos, contexto);
      montarExperiencia(datos.experiencia, contexto);
      montarProyectos(datos.proyectos);
      montarMeritos(datos.meritos, contexto);
      montarEstudios(datos.estudios, contexto);
      montarDestacado(listaDestacados(datos), datos.proyectos);
      emitir('contenido:listo', datos);
    })
    .catch(function (error) {
      console.error('Error al cargar el contenido:', error);
      mostrarAviso(document.querySelector('section.introduccion'));
      ['experiencia', 'proyectos', 'meritos', 'estudios'].forEach(function (id) {
        mostrarAviso(document.querySelector('#' + id + ' .seccion-interior'));
      });
      var panel = document.getElementById('panel-destacado');
      if (panel && !panel.querySelector('.destacado-titulo')) {
        panel.replaceChildren(crear('h2', 'destacado-titulo', TITULO_DESTACADO));
      }
      mostrarAviso(panel);
      emitir('contenido:error', error);
    });
})();
