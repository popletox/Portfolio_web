// Línea de tiempo horizontal (bloque #linea-tiempo): estudios, experiencias
// y proyectos sobre un eje de meses que se desplaza en horizontal. Se monta
// con los datos de 'contenido:listo' (sin campos nuevos en el JSON).
//
// Capas del lienzo (index.html), de arriba abajo:
//   .cronologia-periodos  barras de estudios y experiencias con su nombre a
//                         45° (decorativo, aria-hidden)
//   .cronologia-eje       marcas de mes y de año (decorativo, aria-hidden)
//   .cronologia-proyectos tarjetas de proyectos (pendiente, paso 3)
//
// Escala: cada mes es un PUNTO, su marca del eje, y entre dos marcas
// seguidas hay --ancho-mes-cronologia (estilos/comun.css). La posición 0 es
// el borde izquierdo del lienzo, un mes de margen antes de la primera marca;
// mesDeFecha() da la posición (entera) de la marca del mes de una fecha y
// xDeFecha() la convierte a píxeles desde el borde izquierdo del lienzo. En
// CSS, la misma X es calc(var(--ancho-mes-cronologia) * var(--mes)).
//
// Contenedor desplazable: el bloque es hijo de .pagina y ocupa todo su
// ancho (del borde izquierdo de la ventana al panel Destacado abierto, o al
// borde derecho), sin cálculos en JS. Empieza en el extremo derecho y, si
// está en él, sigue en él al cambiar de ancho (abrir o cerrar el panel,
// redimensionar); si no, conserva la posición.
(function () {
  var MARGEN_MESES = 1; // espacio, en meses, antes de la primera marca y después de la última
  var LARGO_MIN_MESES = 0.5; // por defecto de --largo-min-periodo-cronologia
  var TEXTO_AVISO = 'No se ha podido cargar el contenido.';
  var TEXTO_ACTUALIDAD = 'actualidad';
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

  // { inicio: mes absoluto de la posición 0 (borde izquierdo, sin marca),
  //   meses: ancho del lienzo en meses; las marcas van de 1 a meses - 1 }
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

  // Del primer mes de cualquier fecha (inicio y fin de Experiencia y
  // Estudios, fecha de Proyectos) al mes actual (o a la última fecha, si es
  // posterior), con MARGEN_MESES de espacio a cada lado
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
    var inicio = minimo - MARGEN_MESES;
    return { inicio: inicio, meses: maximo + MARGEN_MESES - inicio };
  }

  // Posición (entera) de la marca del mes de la fecha, en meses desde el
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
  // periodo de un solo mes ocupa el largo mínimo, centrado en su marca)
  function leerPeriodos(datos) {
    var medioMinimo = largoMinimo() / 2;
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
          nombre: nombre,
          // Solo experiencias: la empresa va debajo del puesto
          empresa: t.tipo === 'experiencia' && item.empresa ? String(item.empresa) : '',
          detalle: detalle.join(' · '),
          inicio: inicio,
          fin: fin,
          centro: centro,
          desde: Math.min(inicio, centro - medioMinimo),
          hasta: Math.max(fin, centro + medioMinimo)
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
  // debajo). Posiciones en meses y filas
  // (variables CSS); las medidas en estilos/comun.css
  function montarPeriodos(datos) {
    var periodos = leerPeriodos(datos);
    var filas = asignarFilas(periodos);
    var centroMax = 0;
    var fragmento = document.createDocumentFragment();
    periodos.forEach(function (periodo) {
      var centro = periodo.centro;
      if (centro > centroMax) centroMax = centro;
      var grupo = crear('div', 'cronologia-periodo cronologia-periodo--' + periodo.tipo);
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

  // ---- Montaje ----

  function crear(etiqueta, clase, texto) {
    var nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto != null) nodo.textContent = texto;
    return nodo;
  }

  // Una marca por mes (el mes es el punto de la marca), sin marcas en los
  // bordes (posiciones 0 y rango.meses); enero, más marcada y con el año
  // centrado bajo ella
  function montarEje() {
    var fragmento = document.createDocumentFragment();
    for (var i = 1; i < rango.meses; i++) {
      var absoluto = rango.inicio + i;
      var marca = crear('span', 'cronologia-marca');
      marca.style.setProperty('--mes', String(i));
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
    montarEje();
    montarPeriodos(datos || {});
    // Paso siguiente: capas.proyectos
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
  // al abrir o cerrar el panel Destacado
  if ('ResizeObserver' in window) {
    new ResizeObserver(ajustar).observe(cronologia);
  } else {
    window.addEventListener('resize', ajustar);
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
    ajustar: ajustar
  };
})();
