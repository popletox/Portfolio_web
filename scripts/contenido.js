// Contenido: carga datos/contenido.json y monta la introducción, Experiencia,
// Proyectos, Méritos y Estudios.
// Al terminar (bien o mal) emite 'contenido:listo' o 'contenido:error' en document.
(function () {
  var RUTA_DATOS = 'datos/contenido.json';
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

  function crearAptitudes(aptitudes) {
    var bloque = crear('div', 'linea-tiempo-aptitudes');
    bloque.appendChild(crear('span', 'linea-tiempo-etiqueta', 'Aptitudes clave:'));
    var lista = crear('ul', 'lista-en-linea');
    aptitudes.forEach(function (aptitud) {
      lista.appendChild(crear('li', null, aptitud));
    });
    bloque.appendChild(lista);
    return bloque;
  }

  // Lista de { texto, enlace? }; enlace opcional
  function crearListaProyectos(proyectos) {
    var bloque = crear('div', 'linea-tiempo-proyectos');
    bloque.appendChild(crear('h4', 'linea-tiempo-proyectos-titulo', 'Proyectos'));
    var lista = crear('ul', 'linea-tiempo-proyectos-lista');
    proyectos.forEach(function (proyecto) {
      var li = crear('li');
      if (proyecto.enlace != null) {
        li.appendChild(crearEnlace(proyecto.texto, proyecto.enlace));
      } else {
        li.textContent = proyecto.texto;
      }
      lista.appendChild(li);
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

  // Bloque con h4 y un único enlace (Enlace de proyecto, Proyecto de mérito)
  function crearBloqueEnlace(titulo, enlace) {
    var bloque = crear('div', 'linea-tiempo-proyectos');
    bloque.appendChild(crear('h4', 'linea-tiempo-proyectos-titulo', titulo));
    var p = crear('p', 'linea-tiempo-enlace-proyecto');
    p.appendChild(enlace);
    bloque.appendChild(p);
    return bloque;
  }

  // Entrada de línea de tiempo con fechas de rango (Experiencia, Estudios)
  // datos: { idDetalle, titulo, subtitulo, fechaInicio, fechaFin, descripcion, aptitudes, proyectos }
  function crearEntradaRango(datos) {
    var entrada = crear('li', 'linea-tiempo-entrada');
    entrada.appendChild(crearFechaRango(datos.fechaInicio, datos.fechaFin));
    entrada.appendChild(crearCuerpo(datos));
    return entrada;
  }

  // Cuerpo común: h3 con botón, subtítulo y detalle desplegable.
  // datos.claseSubtitulo y datos.extra (nodo final del detalle) son opcionales.
  function crearCuerpo(datos) {
    var cuerpo = crear('div', 'linea-tiempo-cuerpo');

    var h3 = crear('h3', 'linea-tiempo-titulo');
    var boton = crear('button', 'linea-tiempo-alternar');
    boton.type = 'button';
    boton.setAttribute('aria-expanded', 'false');
    boton.setAttribute('aria-controls', datos.idDetalle);
    boton.appendChild(crear('span', 'linea-tiempo-texto-titulo', datos.titulo));
    var flecha = crear('span', 'linea-tiempo-flecha', '›');
    flecha.setAttribute('aria-hidden', 'true');
    boton.appendChild(flecha);
    h3.appendChild(boton);
    cuerpo.appendChild(h3);

    var claseSubtitulo = 'linea-tiempo-subtitulo' + (datos.claseSubtitulo ? ' ' + datos.claseSubtitulo : '');
    cuerpo.appendChild(crear('p', claseSubtitulo, datos.subtitulo));

    var detalle = crear('div', 'linea-tiempo-detalle');
    detalle.id = datos.idDetalle;
    detalle.inert = true;
    detalle.setAttribute('inert', '');
    var interior = crear('div', 'linea-tiempo-detalle-interior');
    crearParrafos(datos.descripcion, 'linea-tiempo-descripcion').forEach(function (p) {
      interior.appendChild(p);
    });
    if (Array.isArray(datos.aptitudes) && datos.aptitudes.length) {
      interior.appendChild(crearAptitudes(datos.aptitudes));
    }
    if (Array.isArray(datos.proyectos) && datos.proyectos.length) {
      interior.appendChild(crearListaProyectos(datos.proyectos));
    }
    if (datos.extra) interior.appendChild(datos.extra);
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

  function crearMiniatura(imagen, numero, tituloProyecto) {
    var li = crear('li');
    var boton = crear('button', 'proyecto-miniatura');
    boton.type = 'button';
    boton.setAttribute('aria-label', 'Ampliar imagen ' + numero + ' de ' + tituloProyecto);
    // Sin miniatura válida, el botón queda vacío (cuadrado provisional)
    if (imagen && esRutaImagenSegura(imagen.miniatura)) {
      var img = document.createElement('img');
      img.src = imagen.miniatura.trim();
      img.alt = imagen.alt || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      if (ENCUADRES_VALIDOS.indexOf(imagen.encuadre) !== -1) {
        img.className = 'encuadre-' + imagen.encuadre;
      }
      // El visor lee data-imagen-grande del botón
      if (esRutaImagenSegura(imagen.grande)) {
        boton.setAttribute('data-imagen-grande', imagen.grande.trim());
      }
      boton.appendChild(img);
    }
    li.appendChild(boton);
    return li;
  }

  function crearEntradaProyecto(proyecto, indice) {
    var entrada = crear('li', 'linea-tiempo-entrada');
    if (proyecto.id) entrada.id = proyecto.id;
    if (proyecto.categoria) entrada.setAttribute('data-categoria', proyecto.categoria);
    entrada.appendChild(crearFechaSimple(proyecto.fecha));

    var miniaturas = crear('ul', 'proyecto-miniaturas');
    (proyecto.imagenes || []).forEach(function (imagen, i) {
      miniaturas.appendChild(crearMiniatura(imagen, i + 1, proyecto.titulo));
    });
    entrada.appendChild(miniaturas);

    var extra = null;
    if (proyecto.enlace && proyecto.enlace.texto) {
      extra = crearBloqueEnlace('Enlace',
        crearEnlace(proyecto.enlace.texto, proyecto.enlace.url, 'enlace-proyecto'));
    }
    entrada.appendChild(crearCuerpo({
      idDetalle: 'detalle-proyecto-' + (indice + 1),
      titulo: proyecto.titulo,
      subtitulo: proyecto.categoria,
      claseSubtitulo: 'proyecto-categoria',
      descripcion: proyecto.descripcion,
      aptitudes: proyecto.aptitudes,
      extra: extra
    }));
    return entrada;
  }

  function crearEntradaMerito(merito, indice, proyectosPorId) {
    var entrada = crear('li', 'linea-tiempo-entrada');
    entrada.appendChild(crearFechaSimple(merito.fecha));

    var extra = null;
    var proyecto = merito.proyecto && proyectosPorId[merito.proyecto];
    if (proyecto) {
      var enlace = crear('a', 'enlace-proyecto', 'Ver proyecto: ' + proyecto.titulo);
      enlace.setAttribute('href', '#' + proyecto.id);
      enlace.setAttribute('data-proyecto', proyecto.id);
      extra = crearBloqueEnlace('Proyecto', enlace);
    }
    entrada.appendChild(crearCuerpo({
      idDetalle: 'detalle-meritos-' + (indice + 1),
      titulo: merito.titulo,
      subtitulo: merito.entidad,
      descripcion: merito.descripcion,
      extra: extra
    }));
    return entrada;
  }

  // ---- Montaje de secciones ----

  function montarIntroduccion(introduccion) {
    var seccion = document.querySelector('section.introduccion');
    if (!seccion) return;
    seccion.replaceChildren.apply(seccion, crearParrafos(introduccion));
  }

  function montarExperiencia(experiencia) {
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
        proyectos: item.proyectos
      });
    });
    lista.replaceChildren.apply(lista, entradas);
  }

  function montarEstudios(estudios) {
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
        aptitudes: item.aptitudes,
        proyectos: item.proyectos
      });
    });
    lista.replaceChildren.apply(lista, entradas);
  }

  function montarProyectos(proyectos) {
    var lista = document.querySelector('#proyectos .linea-tiempo[data-seccion="proyectos"]');
    if (!lista) return;
    var entradas = ordenarPorFecha(proyectos || [], 'fecha').map(crearEntradaProyecto);
    lista.replaceChildren.apply(lista, entradas);
    montarFiltrosProyectos(proyectos, lista);
  }

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

  // Los títulos de proyecto se toman directamente de los datos del JSON
  function montarMeritos(meritos, proyectos) {
    var lista = document.querySelector('#meritos .linea-tiempo[data-seccion="meritos"]');
    if (!lista) return;
    var proyectosPorId = {};
    (proyectos || []).forEach(function (proyecto) {
      if (proyecto && proyecto.id) proyectosPorId[proyecto.id] = proyecto;
    });
    var entradas = ordenarPorFecha(meritos || [], 'fecha').map(function (item, indice) {
      return crearEntradaMerito(item, indice, proyectosPorId);
    });
    lista.replaceChildren.apply(lista, entradas);
  }

  function mostrarAviso(contenedor) {
    if (!contenedor || contenedor.querySelector('.aviso-carga')) return;
    contenedor.appendChild(crear('p', 'aviso-carga', TEXTO_AVISO));
  }

  function emitir(nombre, detalle) {
    document.dispatchEvent(new CustomEvent(nombre, { detail: detalle }));
  }

  fetch(RUTA_DATOS)
    .then(function (respuesta) {
      if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status + ' al cargar ' + RUTA_DATOS);
      return respuesta.json();
    })
    .then(function (datos) {
      montarIntroduccion(datos.introduccion);
      montarExperiencia(datos.experiencia);
      montarProyectos(datos.proyectos);
      montarMeritos(datos.meritos, datos.proyectos);
      montarEstudios(datos.estudios);
      emitir('contenido:listo', datos);
    })
    .catch(function (error) {
      console.error('Error al cargar el contenido:', error);
      mostrarAviso(document.querySelector('section.introduccion'));
      ['experiencia', 'proyectos', 'meritos', 'estudios'].forEach(function (id) {
        mostrarAviso(document.querySelector('#' + id + ' .seccion-interior'));
      });
      emitir('contenido:error', error);
    });
})();
