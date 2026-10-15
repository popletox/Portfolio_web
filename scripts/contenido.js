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
  // Sin enlace es un <div> no interactivo
  function crearTarjetaReferencia(referencia) {
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

  // Bloque "Referencias": h4 y cuadrícula de tarjetas (null si no hay ninguna válida).
  // sinTitulo (opcional): true para omitir el h4 (se usa en Estudios)
  function crearReferencias(ids, contexto, sinTitulo) {
    var referencias = resolverReferencias(ids, contexto);
    if (!referencias.length) return null;
    var bloque = crear('div', 'linea-tiempo-proyectos linea-tiempo-referencias');
    if (!sinTitulo) {
      bloque.appendChild(crear('h4', 'linea-tiempo-proyectos-titulo', 'Referencias'));
    }
    var lista = crear('ul', 'referencias-lista');
    referencias.forEach(function (referencia) {
      lista.appendChild(crearTarjetaReferencia(referencia));
    });
    bloque.appendChild(lista);
    return bloque;
  }

  // Fecha simple: corta "AAAA" y larga "mes, AAAA"
  function crearFechaSimple(fecha) {
    var contenedor = crear('p', 'linea-tiempo-fecha linea-tiempo-fecha--simple');
    var corta = crear('span', 'linea-tiempo-fecha-corta');
    corta.appendChild(crearTime(formatearAnio(fecha), formatearAnio(fecha)));
    var larga = crear('span', 'linea-tiempo-fecha-larga');
    larga.appendChild(crearTime(fecha, formatearMesAnio(fecha)));
    contenedor.appendChild(corta);
    contenedor.appendChild(larga);
    return contenedor;
  }

  // Entrada de línea de tiempo con fechas de rango (Experiencia, Estudios)
  // datos: { idDetalle, titulo, subtitulo, fechaInicio, fechaFin, descripcion, tecnologia, aptitudes, referencias }
  function crearEntradaRango(datos) {
    var entrada = crear('li', 'linea-tiempo-entrada');
    entrada.appendChild(crearFechaRango(datos.fechaInicio, datos.fechaFin));
    entrada.appendChild(crearCuerpo(datos));
    return entrada;
  }

  // Cuerpo común: h3 con botón, subtítulo y detalle desplegable.
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
    if (Array.isArray(datos.tecnologia) && datos.tecnologia.length) {
      interior.appendChild(crearAptitudes(datos.tecnologia, 'Tecnología:'));
    }
    if (Array.isArray(datos.aptitudes) && datos.aptitudes.length) {
      interior.appendChild(crearAptitudes(datos.aptitudes));
    }
    if (datos.referencias) interior.appendChild(datos.referencias);
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
    var li = crear('li');
    li.appendChild(tarjeta);
    return li;
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

  // Tipos de "enlaces" de un proyecto y su nombre visible, en el orden en que
  // se muestran. Para añadir un tipo nuevo, añade aquí una línea:
  //   tipo: 'Nombre visible',
  var TIPOS_ENLACE_PROYECTO = {
    web: 'Web',
    juego: 'Juego'
  };

  // URL sin "http(s)://" ni barra final, como texto del enlace
  function limpiarUrl(url) {
    return url.replace(/^https?:\/\//i, '').replace(/\/+$/, '') || url;
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

  // "Web: dominio/ruta", uno por línea: primero los tipos conocidos (en el
  // orden del mapa) y después los desconocidos. URLs no válidas: se ignoran
  function crearEnlacesProyecto(enlaces, idProyecto) {
    if (!enlaces || typeof enlaces !== 'object' || Array.isArray(enlaces)) return null;
    var conocidos = Object.keys(TIPOS_ENLACE_PROYECTO).filter(function (tipo) {
      return Object.prototype.hasOwnProperty.call(enlaces, tipo);
    });
    var desconocidos = Object.keys(enlaces).filter(function (tipo) {
      return !Object.prototype.hasOwnProperty.call(TIPOS_ENLACE_PROYECTO, tipo);
    });
    var bloque = crear('div', 'detalle-proyecto-enlaces');
    conocidos.concat(desconocidos).forEach(function (tipo) {
      var url = typeof enlaces[tipo] === 'string' ? enlaces[tipo].trim() : '';
      if (!esUrlSegura(url)) return;
      var nombre = TIPOS_ENLACE_PROYECTO[tipo];
      if (!Object.prototype.hasOwnProperty.call(TIPOS_ENLACE_PROYECTO, tipo)) {
        nombre = tipo.charAt(0).toUpperCase() + tipo.slice(1);
        console.warn('Proyecto "' + idProyecto + '": tipo de enlace desconocido "' + tipo +
          '". Añádelo a TIPOS_ENLACE_PROYECTO en scripts/contenido.js.');
      }
      var enlace = crearEnlace(limpiarUrl(url), url, 'detalle-proyecto-enlace');
      if (/^https?:/i.test(url)) {
        enlace.target = '_blank';
        enlace.rel = 'noopener noreferrer';
      }
      var accion = crear('p', 'detalle-proyecto-accion');
      accion.appendChild(crear('span', 'linea-tiempo-etiqueta', nombre + ':'));
      accion.appendChild(document.createTextNode(' '));
      accion.appendChild(enlace);
      bloque.appendChild(accion);
    });
    return bloque.childNodes.length ? bloque : null;
  }

  // Contenido de la ventana: texto (título, categoría, fecha, descripción,
  // retos, tecnología, experiencia personal, comentarios, aptitudes y
  // enlaces; los opcionales solo si tienen contenido) y, si hay imágenes,
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
    var enlaces = crearEnlacesProyecto(proyecto.enlaces, proyecto.id);
    if (enlaces) texto.appendChild(enlaces);
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

  function crearEntradaMerito(merito, indice, contexto) {
    var entrada = crear('li', 'linea-tiempo-entrada');
    entrada.appendChild(crearFechaSimple(merito.fecha));
    entrada.appendChild(crearCuerpo({
      idDetalle: 'detalle-meritos-' + (indice + 1),
      titulo: merito.titulo,
      subtitulo: merito.entidad,
      descripcion: merito.descripcion,
      referencias: crearReferencias(merito.referencias, contexto)
    }));
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
        referencias: crearReferencias(item.referencias, contexto)
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
        referencias: crearReferencias(item.referencias, contexto, true)
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
  // de los datos cargados, o null (los usa la Línea de tiempo, scripts/
  // linea-tiempo.js). main.js añade abrirDetalle y urlDetalle
  window.Proyectos = {
    montar: montarBandasProyectos,
    crearTarjeta: crearTarjetaProyecto,
    idProyectoDeReferencia: function (id) {
      var proyecto = proyectoDeReferencia(id, contextoReferencias);
      return proyecto ? proyecto.id : null;
    },
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
    var entradas = ordenarPorFecha(meritos || [], 'fecha').map(function (item, indice) {
      return crearEntradaMerito(item, indice, contexto);
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

  // Diapositiva: título, imagen y texto (descripción y enlace), en ese orden.
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

    var texto = crear('div', 'destacado-texto');
    crearParrafos(destacado.descripcion, 'destacado-descripcion').forEach(function (p) {
      texto.appendChild(p);
    });
    if (destacado.enlace && destacado.enlace.texto) {
      var parrafo = crear('p', 'destacado-accion');
      parrafo.appendChild(crearEnlaceDestacado(destacado.enlace, proyectosPorId));
      texto.appendChild(parrafo);
    }
    if (texto.childNodes.length) diapositiva.appendChild(texto);
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
