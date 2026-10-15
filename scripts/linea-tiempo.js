// Línea de tiempo horizontal (bloque #linea-tiempo): estudios, experiencias
// y proyectos sobre un eje de meses que se desplaza en horizontal. Se monta
// con los datos de 'contenido:listo' (sin campos nuevos en el JSON).
//
// Capas del lienzo (index.html), de arriba abajo:
//   .cronologia-periodos  barras de estudios y experiencias con su nombre a
//                         45° (decorativo, aria-hidden)
//   .cronologia-eje       marcas de mes y de año (decorativo, aria-hidden)
//   .cronologia-proyectos tarjetas de proyectos en filas automáticas, con un
//                         conector hasta la marca de su mes; abren la
//                         ventana de detalle (interactivas, no aria-hidden)
//
// Escala: cada mes es un PUNTO, su marca del eje, y entre dos marcas
// seguidas hay --ancho-mes-cronologia (estilos/comun.css). La posición 0 es
// el borde izquierdo del lienzo. Los dos extremos son simétricos: la
// primera marca es la de enero del año de la fecha más antigua (con su
// etiqueta de año) y la última, la del mes actual (o la de la última fecha,
// si es posterior). Entre ambas el eje es sólido; antes de la primera
// aparece con un degradado y tras la última se desvanece, los dos a lo largo
// de --largo-degradado-cronologia meses, y fuera de cada degradado quedan
// MARGEN_EXTREMO_MESES (medio mes) hasta el borde del lienzo. Los periodos
// en curso se prolongan con un degradado del mismo largo desde la marca del
// mes actual. mesDeFecha() da la posición de la marca del mes de una fecha
// (las marcas están a un mes entre sí, pero la primera puede no caer en un
// entero: depende del largo del degradado y del margen) y xDeFecha() la
// convierte a píxeles desde el borde izquierdo del lienzo. En CSS, la misma
// X es calc(var(--ancho-mes-cronologia) * var(--mes)).
//
// Contenedor desplazable: el bloque es hijo de .pagina y ocupa todo su
// ancho (del borde izquierdo de la ventana al panel Destacado abierto, o al
// borde derecho), sin cálculos en JS. Empieza en el extremo derecho y, si
// está en él, sigue en él al cambiar de ancho (abrir o cerrar el panel,
// redimensionar); si no, conserva la posición.
(function () {
  // Espacio, en meses, entre cada extremo del degradado del eje y el borde
  // del lienzo (antes del degradado inicial y tras el final)
  var MARGEN_EXTREMO_MESES = 0.5;
  var LARGO_MIN_MESES = 0.5; // por defecto de --largo-min-periodo-cronologia
  var LARGO_DEGRADADO_MESES = 2; // por defecto de --largo-degradado-cronologia
  // Filas que puede bajar una tarjeta de proyecto, por debajo de la primera
  // en la que cabe, para que su conector no quede oculto tras otra tarjeta
  var FILAS_EXTRA_CONECTOR = 2;
  var TEXTO_AVISO = 'No se ha podido cargar el contenido.';
  var TEXTO_ACTUALIDAD = 'actualidad';
  var TEXTO_RECONOCIMIENTO = 'Reconocimiento: ';
  var SVG_NS = 'http://www.w3.org/2000/svg';
  // Estrella de cinco puntas en una caja de 24 x 24
  var RUTA_ESTRELLA = 'M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 ' +
    '1.12-6.55-4.76-4.64 6.58-.96z';
  var MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  var bloque = document.getElementById('linea-tiempo');
  var cronologia = bloque && bloque.querySelector('.cronologia');
  var lienzo = cronologia && cronologia.querySelector('.cronologia-lienzo');
  if (!lienzo) return;
  var capas = {
    periodos: lienzo.querySelector('.cronologia-periodos'),
    eje: lienzo.querySelector('.cronologia-eje'),
    proyectos: lienzo.querySelector('.cronologia-proyectos')
  };

  // { inicio: mes absoluto de la posición 0 (borde izquierdo, sin marca;
  //     puede no ser entero),
  //   primero: posición de la primera marca, enero del primer año
  //     (comienzo del tramo sólido del eje: margen + degradado),
  //   ultimo: posición de la última marca (fin del tramo sólido del eje),
  //   meses: ancho del lienzo en meses (ultimo + degradado + margen);
  //   las marcas van de primero a ultimo, de mes en mes }
  var rango = null;

  // ---- Fechas y escala ----

  // "AAAA-MM" o "AAAA-MM-DD" -> mes absoluto (año * 12 + mes - 1), entero:
  // el día no cuenta; null si no es válida
  function mesAbsoluto(fecha) {
    var partes = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(String(fecha));
    if (!partes) return null;
    var anio = parseInt(partes[1], 10);
    var mes = parseInt(partes[2], 10);
    var dia = partes[3] ? parseInt(partes[3], 10) : 1;
    if (mes < 1 || mes > 12) return null;
    var diasMes = new Date(anio, mes, 0).getDate();
    if (dia < 1 || dia > diasMes) return null;
    return anio * 12 + (mes - 1);
  }

  // Mes absoluto actual (fechas en curso: fechaFin null, enCurso)
  function mesActual() {
    var hoy = new Date();
    return hoy.getFullYear() * 12 + hoy.getMonth();
  }

  // De enero del año de la fecha más antigua (inicio y fin de Experiencia y
  // Estudios, fecha de Proyectos) al mes actual (o a la última fecha, si es
  // posterior), con el degradado del eje (largoDegradado()) más
  // MARGEN_EXTREMO_MESES de espacio a cada lado
  function calcularRango(datos) {
    var fechas = [];
    ['experiencia', 'estudios'].forEach(function (clave) {
      (Array.isArray(datos[clave]) ? datos[clave] : []).forEach(function (item) {
        if (!item || typeof item !== 'object') return;
        fechas.push(item.fechaInicio, item.fechaFin);
      });
    });
    (Array.isArray(datos.proyectos) ? datos.proyectos : []).forEach(function (proyecto) {
      if (proyecto && typeof proyecto === 'object') fechas.push(proyecto.fecha);
    });
    var actual = mesActual();
    var minimo = actual;
    var maximo = actual;
    fechas.forEach(function (fecha) {
      if (fecha == null) return; // en curso: cuenta hasta el mes actual
      var mes = mesAbsoluto(fecha);
      if (mes === null) return;
      if (mes < minimo) minimo = mes;
      if (mes > maximo) maximo = mes;
    });
    var extremo = largoDegradado() + MARGEN_EXTREMO_MESES;
    var enero = minimo - (minimo % 12); // enero del primer año con datos
    var inicio = enero - extremo;
    var ultimo = maximo - inicio;
    return {
      inicio: inicio,
      primero: extremo,
      ultimo: ultimo,
      meses: ultimo + extremo
    };
  }

  // Posición de la marca del mes de la fecha, en meses desde el
  // borde izquierdo del lienzo. Sin fecha (null/undefined, en curso): la
  // marca del mes actual. null si no es válida
  function mesDeFecha(fecha) {
    if (!rango) return null;
    var mes = fecha == null ? mesActual() : mesAbsoluto(fecha);
    return mes === null ? null : mes - rango.inicio;
  }

  // Distancia entre dos marcas en píxeles, la de --ancho-mes-cronologia ya
  // resuelta: el lienzo mide exactamente ese ancho por rango.meses
  function anchoMes() {
    if (!rango || !rango.meses) return 0;
    return lienzo.getBoundingClientRect().width / rango.meses;
  }

  // X en píxeles desde el borde izquierdo del lienzo; null si no es válida
  function xDeFecha(fecha) {
    var mes = mesDeFecha(fecha);
    return mes === null ? null : mes * anchoMes();
  }

  // "AAAA-MM" -> "mes, AAAA" (como en las secciones)
  function formatearMesAnio(fecha) {
    var partes = String(fecha).split('-');
    var mes = MESES[parseInt(partes[1], 10) - 1];
    return mes ? mes + ', ' + partes[0] : partes[0];
  }

  // Largo, en meses, del degradado con que el eje y las barras de los
  // periodos en curso se desvanecen hacia la derecha, de
  // --largo-degradado-cronologia (estilos/comun.css)
  function largoDegradado() {
    var valor = parseFloat(getComputedStyle(lienzo).getPropertyValue('--largo-degradado-cronologia'));
    return valor >= 0 ? valor : LARGO_DEGRADADO_MESES;
  }

  // ---- Periodos (estudios y experiencias) ----

  // Largo mínimo de una barra, en meses (periodos de un solo mes:
  // inicio = fin), de --largo-min-periodo-cronologia (estilos/comun.css)
  function largoMinimo() {
    var valor = parseFloat(getComputedStyle(lienzo).getPropertyValue('--largo-min-periodo-cronologia'));
    return valor > 0 ? valor : LARGO_MIN_MESES;
  }

  // Lista de periodos válidos con su intervalo en el eje: de la marca del mes
  // de fechaInicio a la del mes de fechaFin (en curso, fechaFin null, a la
  // del mes actual). desde/hasta: lo que ocupa la barra a la vista (un
  // periodo de un solo mes ocupa el largo mínimo, centrado en su marca; uno
  // en curso, además, su degradado de largoDegradado() meses tras fin)
  function leerPeriodos(datos) {
    var medioMinimo = largoMinimo() / 2;
    var degradado = largoDegradado();
    var tipos = [
      { clave: 'experiencia', tipo: 'experiencia', nombre: 'puesto', lugar: 'empresa' },
      { clave: 'estudios', tipo: 'estudio', nombre: 'titulo', lugar: 'institucion' }
    ];
    var periodos = [];
    tipos.forEach(function (t) {
      (Array.isArray(datos[t.clave]) ? datos[t.clave] : []).forEach(function (item) {
        if (!item || typeof item !== 'object' || item.fechaInicio == null) return;
        var inicio = mesDeFecha(item.fechaInicio);
        if (inicio === null) return;
        var enCurso = item.fechaFin == null;
        var fin = mesDeFecha(item.fechaFin);
        if (fin === null) return;
        if (enCurso) fin = Math.max(fin, inicio); // empieza este mes
        if (fin < inicio) return;
        var centro = (inicio + fin) / 2;
        var nombre = String(item[t.nombre] || '');
        var detalle = [nombre];
        if (item[t.lugar]) detalle.push(String(item[t.lugar]));
        detalle.push(formatearMesAnio(item.fechaInicio) + ' – ' +
          (enCurso ? TEXTO_ACTUALIDAD : formatearMesAnio(item.fechaFin)));
        periodos.push({
          tipo: t.tipo,
          enCurso: enCurso,
          nombre: nombre,
          // Solo experiencias: la empresa va debajo del puesto
          empresa: t.tipo === 'experiencia' && item.empresa ? String(item.empresa) : '',
          detalle: detalle.join(' · '),
          inicio: inicio,
          fin: fin,
          centro: centro,
          desde: Math.min(inicio, centro - medioMinimo),
          hasta: Math.max(fin + (enCurso ? degradado : 0), centro + medioMinimo)
        });
      });
    });
    return periodos;
  }

  // Filas por solape: por inicio a la vista (a igualdad, el más largo antes),
  // cada periodo va a la fila más baja (0 = junto al eje) cuya última barra
  // ya ha terminado. Los que solo se tocan (uno acaba en el mismo mes en que
  // empieza otro: misma marca) comparten fila; el hueco visual lo pone el
  // CSS (--hueco-periodo-cronologia). Devuelve el número de filas
  function asignarFilas(periodos) {
    periodos.sort(function (a, b) {
      return a.desde - b.desde || b.hasta - a.hasta;
    });
    var finFilas = []; // fin a la vista de la última barra de cada fila
    periodos.forEach(function (periodo) {
      var fila = 0;
      while (fila < finFilas.length && finFilas[fila] > periodo.desde) fila++;
      finFilas[fila] = periodo.hasta;
      periodo.fila = fila;
    });
    return finFilas.length;
  }

  // Cada periodo: barra en su fila, conector vertical desde el centro de la
  // barra hasta la altura común de los nombres (por encima de la fila más
  // alta) y nombre a 45° desde ese punto (en experiencias, con la empresa
  // debajo). Los en curso llevan --en-curso: su barra sigue con un
  // degradado tras la marca del mes actual (centro, conector y nombre no
  // cambian). Posiciones en meses y filas (variables CSS); las medidas en
  // estilos/comun.css
  function montarPeriodos(datos) {
    var periodos = leerPeriodos(datos);
    var filas = asignarFilas(periodos);
    var centroMax = 0;
    var fragmento = document.createDocumentFragment();
    periodos.forEach(function (periodo) {
      var centro = periodo.centro;
      if (centro > centroMax) centroMax = centro;
      var grupo = crear('div', 'cronologia-periodo cronologia-periodo--' + periodo.tipo);
      if (periodo.enCurso) grupo.classList.add('cronologia-periodo--en-curso');
      grupo.title = periodo.detalle;
      grupo.style.setProperty('--inicio', String(periodo.inicio));
      grupo.style.setProperty('--fin', String(periodo.fin));
      grupo.style.setProperty('--centro', String(centro));
      grupo.style.setProperty('--fila', String(periodo.fila));
      grupo.appendChild(crear('span', 'cronologia-periodo-barra'));
      grupo.appendChild(crear('span', 'cronologia-periodo-conector'));
      var nombre = crear('span', 'cronologia-periodo-nombre');
      nombre.appendChild(crear('span', 'cronologia-periodo-titulo', periodo.nombre));
      if (periodo.empresa) {
        nombre.appendChild(crear('span', 'cronologia-periodo-empresa', periodo.empresa));
      }
      grupo.appendChild(nombre);
      fragmento.appendChild(grupo);
    });
    capas.periodos.replaceChildren(fragmento);
    capas.periodos.hidden = !periodos.length;
    capas.periodos.style.setProperty('--filas-periodos', String(filas));
    // Espacio final para el nombre más a la derecha (estilos/comun.css)
    lienzo.style.setProperty('--centro-periodo-max', String(centroMax));
  }

  // ---- Proyectos (tarjetas) ----

  // Tarjetas montadas, por fecha ascendente: { mes, nodo (<li>) }
  var proyectos = [];
  // anchoMes() con el que se repartieron las filas por última vez
  var anchoMesColocado = 0;

  // "Título, categoría, mes AAAA" (en curso: "…, en curso desde mes AAAA")
  function etiquetaProyecto(proyecto) {
    var partes = [String(proyecto.titulo || '')];
    if (proyecto.categoria) partes.push(String(proyecto.categoria));
    var fecha = formatearMesAnio(proyecto.fecha).replace(', ', ' ');
    partes.push(proyecto.enCurso === true ? 'en curso desde ' + fecha : fecha);
    return partes.join(', ');
  }

  // Méritos por proyecto: { idProyecto: [títulos] }. Un mérito cuenta para
  // cada proyecto al que lleva alguna de sus referencias (id del proyecto o
  // entrada del catálogo con enlace "#<id>": window.Proyectos.
  // idProyectoDeReferencia). Los méritos sin proyecto no cuentan
  function meritosPorProyecto(datos) {
    var mapa = {};
    var idDeReferencia = window.Proyectos && window.Proyectos.idProyectoDeReferencia;
    if (typeof idDeReferencia !== 'function') return mapa;
    (Array.isArray(datos.meritos) ? datos.meritos : []).forEach(function (merito) {
      if (!merito || typeof merito !== 'object' || !Array.isArray(merito.referencias)) return;
      var titulo = String(merito.titulo || '');
      if (!titulo) return;
      merito.referencias.forEach(function (referencia) {
        var id = idDeReferencia(referencia);
        if (!id) return;
        if (!Object.prototype.hasOwnProperty.call(mapa, id)) mapa[id] = [];
        if (mapa[id].indexOf(titulo) === -1) mapa[id].push(titulo);
      });
    });
    return mapa;
  }

  // Estrella decorativa (sin acción) en la esquina de la tarjeta, con los
  // méritos en el tooltip. Va dentro del botón: pulsarla abre la ventana
  function crearEstrella(titulos) {
    var estrella = crear('span', 'cronologia-estrella');
    estrella.title = TEXTO_RECONOCIMIENTO + titulos.join(' · ');
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

  // Lo que se añade al aria-label de una tarjeta con méritos
  function etiquetaMeritos(titulos) {
    return titulos.length === 1
      ? ', con reconocimiento: ' + titulos[0]
      : ', con ' + titulos.length + ' reconocimientos: ' + titulos.join(', ');
  }

  // Una tarjeta por proyecto (todos: los filtros de la sección Proyectos no
  // cuentan), creada con la función de la sección (window.Proyectos.
  // crearTarjeta) más la clase --cronologia, en la marca del mes de su
  // fecha (también los en curso: su mes de inicio). Orden: por fecha
  // ascendente y, en el mismo mes, el del JSON (también el del Tab). Al
  // pulsarla, main.js abre la ventana por delegación (button.proyecto-
  // tarjeta[data-proyecto]) con el foco de vuelta en esta tarjeta. Los
  // proyectos con algún mérito llevan una estrella (crearEstrella)
  function montarProyectos(datos) {
    proyectos = [];
    var meritos = meritosPorProyecto(datos);
    var crearTarjeta = window.Proyectos && window.Proyectos.crearTarjeta;
    var validos = [];
    if (typeof crearTarjeta === 'function') {
      (Array.isArray(datos.proyectos) ? datos.proyectos : []).forEach(function (proyecto, indice) {
        if (!proyecto || typeof proyecto !== 'object') return;
        var nombre = proyecto.id || proyecto.titulo;
        var mes = proyecto.fecha == null ? null : mesDeFecha(proyecto.fecha);
        if (mes === null) {
          console.warn('Proyecto sin fecha válida ("AAAA-MM"), no se muestra en la línea de tiempo:', nombre);
          return;
        }
        if (typeof proyecto.id !== 'string' || proyecto.id === '') {
          console.warn('Proyecto sin id, no se muestra en la línea de tiempo (no podría abrir su detalle):', nombre);
          return;
        }
        validos.push({ proyecto: proyecto, mes: mes, indice: indice });
      });
    }
    validos.sort(function (a, b) {
      return a.mes - b.mes || a.indice - b.indice;
    });

    var lista = crear('ul', 'cronologia-proyectos-lista');
    lista.setAttribute('aria-label', 'Proyectos');
    validos.forEach(function (item) {
      var nodo = crearTarjeta(item.proyecto);
      var tarjeta = nodo.firstChild;
      nodo.className = 'cronologia-proyecto';
      nodo.style.setProperty('--mes', String(item.mes));
      tarjeta.classList.add('proyecto-tarjeta--cronologia');
      var etiqueta = etiquetaProyecto(item.proyecto);
      var titulos = Object.prototype.hasOwnProperty.call(meritos, item.proyecto.id)
        ? meritos[item.proyecto.id]
        : null;
      if (titulos) {
        tarjeta.classList.add('proyecto-tarjeta--merito');
        tarjeta.appendChild(crearEstrella(titulos));
        etiqueta += etiquetaMeritos(titulos);
      }
      tarjeta.setAttribute('aria-label', etiqueta);
      nodo.insertBefore(crear('span', 'cronologia-proyecto-conector'), tarjeta);
      lista.appendChild(nodo);
      proyectos.push({ mes: item.mes, nodo: nodo });
    });
    capas.proyectos.replaceChildren(lista);
    capas.proyectos.hidden = !proyectos.length;

    // Espacio en los bordes del lienzo para media tarjeta (estilos/comun.css)
    if (proyectos.length) {
      lienzo.style.setProperty('--mes-proyecto-min', String(proyectos[0].mes));
      lienzo.style.setProperty('--mes-proyecto-max', String(proyectos[proyectos.length - 1].mes));
    } else {
      lienzo.style.removeProperty('--mes-proyecto-min');
      lienzo.style.removeProperty('--mes-proyecto-max');
    }

    if (observadorTarjetas) {
      observadorTarjetas.disconnect();
      proyectos.forEach(function (item) { observadorTarjetas.observe(item.nodo); });
    }
    colocarProyectos();
  }

  // Filas automáticas con las medidas ya resueltas (ancho por mes, tamaño
  // de la tarjeta, --hueco-tarjeta-cronologia). Por orden de fecha, cada
  // tarjeta va a la fila más baja (0 = junto al eje) en la que no se pisa
  // con otra: dos tarjetas de una fila quedan al menos a un hueco (el
  // intervalo de cada una se amplía medio hueco por lado). Las del mismo mes
  // quedan una debajo de otra. Conectores: el de una tarjeta en una fila > 0
  // cruza las filas de arriba por detrás de sus tarjetas; si en esa fila
  // quedaría oculto tras una tarjeta de otro mes (o ella taparía el de otra
  // de otro mes en una fila inferior), se prueba hasta FILAS_EXTRA_CONECTOR
  // filas más abajo y se usa la primera libre de ambas cosas; si no hay
  // ninguna, se queda en la primera en la que cabe
  function colocarProyectos() {
    if (!proyectos.length) return;
    var ancho = anchoMes();
    anchoMesColocado = ancho;
    var hueco = parseFloat(getComputedStyle(capas.proyectos).columnGap) || 0;
    var alto = 0;
    var colocadas = [];

    function cabe(fila, desde, hasta) {
      return colocadas.every(function (otra) {
        return otra.fila !== fila || otra.hasta <= desde || hasta <= otra.desde;
      });
    }
    // Ninguna tarjeta de otro mes tapa este conector ni esta tarjeta tapa
    // el de otra
    function conectorVisible(fila, mes, x, medio) {
      return colocadas.every(function (otra) {
        if (otra.mes === mes || otra.fila === fila) return true;
        if (otra.fila < fila) return Math.abs(otra.x - x) >= otra.medio;
        return Math.abs(x - otra.x) >= medio;
      });
    }

    proyectos.forEach(function (item) {
      var caja = item.nodo.getBoundingClientRect();
      if (caja.height > alto) alto = caja.height;
      var medio = caja.width / 2;
      var x = item.mes * ancho;
      var desde = x - medio - hueco / 2;
      var hasta = x + medio + hueco / 2;
      var base = 0;
      while (!cabe(base, desde, hasta)) base++;
      var fila = base;
      for (var f = base; f <= base + FILAS_EXTRA_CONECTOR; f++) {
        if (cabe(f, desde, hasta) && conectorVisible(f, item.mes, x, medio)) {
          fila = f;
          break;
        }
      }
      colocadas.push({ fila: fila, mes: item.mes, x: x, medio: medio, desde: desde, hasta: hasta });
      item.nodo.style.setProperty('--fila', String(fila));
    });

    var filas = 1 + Math.max.apply(null, colocadas.map(function (otra) { return otra.fila; }));
    capas.proyectos.style.setProperty('--filas-proyectos', String(filas));
    capas.proyectos.style.setProperty('--alto-tarjeta-cronologia', alto + 'px');
  }

  // Al cambiar el tamaño de una tarjeta (móvil <-> ordenador, tema con otra
  // fuente) o el ancho por mes: se vuelve a repartir en el frame siguiente
  // (fuera del callback de ResizeObserver, que no debe cambiar tamaños)
  var colocacionPendiente = false;
  function programarColocacion() {
    if (colocacionPendiente) return;
    colocacionPendiente = true;
    requestAnimationFrame(function () {
      colocacionPendiente = false;
      colocarProyectos();
    });
  }

  var observadorTarjetas = 'ResizeObserver' in window ? new ResizeObserver(programarColocacion) : null;

  // ---- Montaje ----

  function crear(etiqueta, clase, texto) {
    var nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto != null) nodo.textContent = texto;
    return nodo;
  }

  // Una marca por mes (el mes es el punto de la marca), de rango.primero
  // (enero del primer año) a rango.ultimo: ninguna sobre los degradados ni
  // en los márgenes; enero, más marcada y con el año centrado bajo ella
  function montarEje() {
    var fragmento = document.createDocumentFragment();
    // Meses absolutos (enteros) de la primera y la última marca
    var desde = Math.round(rango.inicio + rango.primero);
    var hasta = Math.round(rango.inicio + rango.ultimo);
    for (var absoluto = desde; absoluto <= hasta; absoluto++) {
      var marca = crear('span', 'cronologia-marca');
      marca.style.setProperty('--mes', String(absoluto - rango.inicio));
      if (absoluto % 12 === 0) {
        marca.classList.add('cronologia-marca--anio');
        marca.appendChild(crear('span', 'cronologia-anio', String(absoluto / 12)));
      }
      fragmento.appendChild(marca);
    }
    capas.eje.replaceChildren(fragmento);
  }

  function montar(datos) {
    rango = calcularRango(datos || {});
    lienzo.style.setProperty('--meses-cronologia', String(rango.meses));
    // Comienzo y fin del tramo sólido del eje, entre sus degradados (comun.css)
    lienzo.style.setProperty('--mes-inicial-eje', String(rango.primero));
    lienzo.style.setProperty('--mes-final-eje', String(rango.ultimo));
    montarEje();
    montarPeriodos(datos || {});
    montarProyectos(datos || {});
    ajustar();
    irAlFinal();
  }

  function mostrarAviso() {
    if (bloque.querySelector('.aviso-carga')) return;
    cronologia.hidden = true;
    bloque.insertBefore(crear('p', 'aviso-carga', TEXTO_AVISO), bloque.firstChild);
  }

  // ---- Posición del scroll al cambiar de ancho ----

  // Si estaba en el extremo derecho antes del último cambio de ancho. Se
  // anota en cada scroll (y al ir al final): cuando llega el aviso del
  // cambio de ancho, el scroll ya puede haber dejado de estar al final
  var alFinal = true;
  // scrollLeft que dejó irAlFinal(): su evento scroll llega en un frame
  // posterior, quizá con el ancho ya cambiado, y no debe contar como
  // desplazamiento del usuario
  var posicionProgramada = null;

  function estaAlFinal() {
    return cronologia.scrollLeft >= cronologia.scrollWidth - cronologia.clientWidth - 1;
  }

  function irAlFinal() {
    cronologia.scrollLeft = cronologia.scrollWidth;
    posicionProgramada = cronologia.scrollLeft;
    alFinal = true;
  }

  // Tras un cambio de ancho: vuelve al extremo derecho si estaba en él; si
  // no, el navegador conserva scrollLeft (la posición)
  function ajustar() {
    if (alFinal) irAlFinal();
  }

  cronologia.addEventListener('scroll', function () {
    if (cronologia.scrollLeft === posicionProgramada) return;
    posicionProgramada = null;
    alFinal = estaAlFinal();
  }, { passive: true });

  // El ancho cambia en cada frame mientras .pagina anima su padding-right
  // al abrir o cerrar el panel Destacado. Si además cambia el ancho por mes
  // (móvil <-> ordenador), se reparten de nuevo las filas de proyectos
  function alCambiarAncho() {
    ajustar();
    if (proyectos.length && anchoMes() !== anchoMesColocado) programarColocacion();
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(alCambiarAncho).observe(cronologia);
  } else {
    window.addEventListener('resize', alCambiarAncho);
  }
  document.addEventListener('contenido:listo', function (evento) {
    montar(evento.detail);
  });
  document.addEventListener('contenido:error', mostrarAviso);

  // Para los pasos siguientes y para depurar desde la consola
  window.LineaTiempo = {
    capas: capas,
    mesDeFecha: mesDeFecha,
    xDeFecha: xDeFecha,
    anchoMes: anchoMes,
    ajustar: ajustar,
    colocarProyectos: colocarProyectos
  };
})();
