// Contenido: carga datos/contenido.json y monta la introducción, Experiencia,
// Proyectos, Méritos, Estudios y el panel Destacado.
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
    bloque.appendChild(document.createTextNode(' '));
    var lista = crear('ul', 'lista-en-linea');
    aptitudes.forEach(function (aptitud) {
      lista.appendChild(crear('li', null, aptitud));
    });
    bloque.appendChild(lista);
    return bloque;
  }

  // ---- Referencias (catálogo "referencias" del JSON) ----

  // Array de ids -> entradas válidas del catálogo; los ids desconocidos se ignoran
  function resolverReferencias(ids, contexto) {
    if (!Array.isArray(ids)) return [];
    var catalogo = (contexto && contexto.referencias) || {};
    return ids.reduce(function (lista, id) {
      var entrada = typeof id === 'string' && Object.prototype.hasOwnProperty.call(catalogo, id)
        ? catalogo[id]
        : null;
      if (entrada && typeof entrada.titulo === 'string' && entrada.titulo !== '') {
        lista.push(entrada);
      } else {
        console.warn('Referencia desconocida o sin título:', id);
      }
      return lista;
    }, []);
  }

  // Tarjeta: título arriba e imagen (o rectángulo provisional) debajo.
  // Con enlace válido es un <a>: "#<id>" de un proyecto existente usa el
  // enlace interno de main.js (navegarAProyecto); http(s), pestaña nueva.
  // Sin enlace es un <div> no interactivo
  function crearTarjetaReferencia(referencia, proyectosPorId) {
    var url = typeof referencia.enlace === 'string' ? referencia.enlace.trim() : '';
    var tarjeta;
    if (esUrlSegura(url)) {
      tarjeta = crearEnlace(null, url, 'referencia-tarjeta');
      // Nombre accesible solo con el título (el alt de la imagen lo repetiría)
      tarjeta.setAttribute('aria-label', referencia.titulo);
      var id = url.charAt(0) === '#' ? url.slice(1) : '';
      if (id && proyectosPorId[id]) {
        tarjeta.classList.add('enlace-proyecto');
        tarjeta.setAttribute('data-proyecto', id);
      } else if (/^https?:/i.test(url)) {
        tarjeta.target = '_blank';
        tarjeta.rel = 'noopener noreferrer';
      }
    } else {
      tarjeta = crear('div', 'referencia-tarjeta referencia-tarjeta--sin-enlace');
    }
    tarjeta.appendChild(crear('span', 'referencia-titulo', referencia.titulo));

    var imagen = crear('span', 'referencia-imagen');
    if (esRutaImagenSegura(referencia.img)) {
      var img = document.createElement('img');
      img.src = referencia.img.trim();
      img.alt = referencia.titulo;
      img.loading = 'lazy';
      img.decoding = 'async';
      imagen.appendChild(img);
    } else {
      imagen.classList.add('referencia-imagen--provisional');
    }
    tarjeta.appendChild(imagen);

    var li = crear('li');
    li.appendChild(tarjeta);
    return li;
  }

  // Bloque "Referencias": h4 y cuadrícula de tarjetas (null si no hay ninguna válida)
  function crearReferencias(ids, contexto) {
    var referencias = resolverReferencias(ids, contexto);
    if (!referencias.length) return null;
    var proyectosPorId = (contexto && contexto.proyectosPorId) || {};
    var bloque = crear('div', 'linea-tiempo-proyectos linea-tiempo-referencias');
    bloque.appendChild(crear('h4', 'linea-tiempo-proyectos-titulo', 'Referencias'));
    var lista = crear('ul', 'referencias-lista');
    referencias.forEach(function (referencia) {
      lista.appendChild(crearTarjetaReferencia(referencia, proyectosPorId));
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

  // Bloque con h4 y un único enlace (Enlace de proyecto)
  function crearBloqueEnlace(titulo, enlace) {
    var bloque = crear('div', 'linea-tiempo-proyectos');
    bloque.appendChild(crear('h4', 'linea-tiempo-proyectos-titulo', titulo));
    var p = crear('p', 'linea-tiempo-enlace-proyecto');
    p.appendChild(enlace);
    bloque.appendChild(p);
    return bloque;
  }

  // Entrada de línea de tiempo con fechas de rango (Experiencia, Estudios)
  // datos: { idDetalle, titulo, subtitulo, fechaInicio, fechaFin, descripcion, aptitudes, referencias }
  function crearEntradaRango(datos) {
    var entrada = crear('li', 'linea-tiempo-entrada');
    entrada.appendChild(crearFechaRango(datos.fechaInicio, datos.fechaFin));
    entrada.appendChild(crearCuerpo(datos));
    return entrada;
  }

  // Cuerpo común: h3 con botón, subtítulo y detalle desplegable.
  // datos.claseSubtitulo, datos.referencias (bloque de Referencias o null) y
  // datos.extra (nodo final del detalle) son opcionales.
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
    if (datos.referencias) interior.appendChild(datos.referencias);
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
        aptitudes: item.aptitudes,
        referencias: crearReferencias(item.referencias, contexto)
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

  function montarMeritos(meritos, contexto) {
    var lista = document.querySelector('#meritos .linea-tiempo[data-seccion="meritos"]');
    if (!lista) return;
    var entradas = ordenarPorFecha(meritos || [], 'fecha').map(function (item, indice) {
      return crearEntradaMerito(item, indice, contexto);
    });
    lista.replaceChildren.apply(lista, entradas);
  }

  // ---- Panel Destacado ----

  // Ruta de la imagen: "miniatura" (como en Proyectos) o su alias "src"
  function rutaImagenDestacado(imagen) {
    if (esRutaImagenSegura(imagen.miniatura)) return imagen.miniatura.trim();
    if (esRutaImagenSegura(imagen.src)) return imagen.src.trim();
    return null;
  }

  // Botón que abre el visor (main.js escucha button.destacado-imagen).
  // Sin ruta válida queda vacío: cuadrado provisional que abre el marcador
  // provisional del visor, igual que las miniaturas de Proyectos
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
    if (esRutaImagenSegura(imagen.grande)) {
      boton.setAttribute('data-imagen-grande', imagen.grande.trim());
    }
    boton.appendChild(img);
    return boton;
  }

  // "#<id>" de un proyecto existente: enlace interno que gestiona main.js
  // (navegarAProyecto). http(s): pestaña nueva. Resto: crearEnlace lo valida
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

  // Catálogo de referencias y proyectos por id, para las tarjetas de Referencias
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

  fetch(RUTA_DATOS)
    .then(function (respuesta) {
      if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status + ' al cargar ' + RUTA_DATOS);
      return respuesta.json();
    })
    .then(function (datos) {
      montarIntroduccion(datos.introduccion);
      var contexto = crearContextoReferencias(datos);
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
