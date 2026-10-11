// Contenido: carga datos/contenido.json y monta la introducción y Experiencia.
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

  // Entrada de línea de tiempo con fechas de rango (Experiencia, Estudios...)
  // datos: { idDetalle, titulo, subtitulo, fechaInicio, fechaFin, descripcion, aptitudes, proyectos }
  function crearEntradaRango(datos) {
    var entrada = crear('li', 'linea-tiempo-entrada');
    entrada.appendChild(crearFechaRango(datos.fechaInicio, datos.fechaFin));

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

    cuerpo.appendChild(crear('p', 'linea-tiempo-subtitulo', datos.subtitulo));

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
    detalle.appendChild(interior);
    cuerpo.appendChild(detalle);

    entrada.appendChild(cuerpo);
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
      emitir('contenido:listo', datos);
    })
    .catch(function (error) {
      console.error('Error al cargar el contenido:', error);
      mostrarAviso(document.querySelector('section.introduccion'));
      mostrarAviso(document.querySelector('#experiencia .seccion-interior'));
      emitir('contenido:error', error);
    });
})();
