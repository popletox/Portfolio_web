// Línea de tiempo horizontal (bloque #linea-tiempo): estudios, experiencias
// y proyectos sobre un eje de meses que se desplaza en horizontal. Se monta
// con los datos de 'contenido:listo' (sin campos nuevos en el JSON).
//
// Capas del lienzo (index.html), de arriba abajo:
//   .cronologia-periodos  barras de estudios y experiencias (pendiente, paso 2)
//   .cronologia-eje       marcas de mes y de año (decorativo, aria-hidden)
//   .cronologia-proyectos tarjetas de proyectos (pendiente, paso 3)
//
// Escala: un mes mide --ancho-mes-cronologia (estilos/comun.css). El mes 0 es
// el primero del rango; mesDeFecha() da la posición en meses (con fracción si
// la fecha lleva día) y xDeFecha() la convierte a píxeles desde el borde
// izquierdo del lienzo. En CSS, la misma X es
// calc(var(--ancho-mes-cronologia) * var(--mes)).
//
// Contenedor desplazable: el bloque es hijo de .pagina y ocupa todo su
// ancho (del borde izquierdo de la ventana al panel Destacado abierto, o al
// borde derecho), sin cálculos en JS. Empieza en el extremo derecho y, si
// está en él, sigue en él al cambiar de ancho (abrir o cerrar el panel,
// redimensionar); si no, conserva la posición.
(function () {
  var MARGEN_MESES = 1; // meses vacíos antes de la primera fecha y después de hoy
  var TEXTO_AVISO = 'No se ha podido cargar el contenido.';

  var bloque = document.getElementById('linea-tiempo');
  var cronologia = bloque && bloque.querySelector('.cronologia');
  var lienzo = cronologia && cronologia.querySelector('.cronologia-lienzo');
  if (!lienzo) return;
  var capas = {
    periodos: lienzo.querySelector('.cronologia-periodos'),
    eje: lienzo.querySelector('.cronologia-eje'),
    proyectos: lienzo.querySelector('.cronologia-proyectos')
  };

  var rango = null; // { inicio: mes absoluto del mes 0, meses: total de meses }

  // ---- Fechas y escala ----

  // "AAAA-MM" o "AAAA-MM-DD" -> meses absolutos (año * 12 + mes - 1), con la
  // fracción del día; null si no es válida
  function mesAbsoluto(fecha) {
    var partes = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(String(fecha));
    if (!partes) return null;
    var anio = parseInt(partes[1], 10);
    var mes = parseInt(partes[2], 10);
    var dia = partes[3] ? parseInt(partes[3], 10) : 1;
    if (mes < 1 || mes > 12) return null;
    var diasMes = new Date(anio, mes, 0).getDate();
    if (dia < 1 || dia > diasMes) return null;
    return anio * 12 + (mes - 1) + (dia - 1) / diasMes;
  }

  function dosCifras(numero) {
    return (numero < 10 ? '0' : '') + numero;
  }

  // Hoy como "AAAA-MM-DD" (fechas en curso: fechaFin null, enCurso)
  function fechaHoy() {
    var hoy = new Date();
    return hoy.getFullYear() + '-' + dosCifras(hoy.getMonth() + 1) + '-' + dosCifras(hoy.getDate());
  }

  // Del primer mes de cualquier fecha (inicio y fin de Experiencia y
  // Estudios, fecha de Proyectos) al mes actual (o a la última fecha, si es
  // posterior), con MARGEN_MESES a cada lado
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
    var actual = Math.floor(mesAbsoluto(fechaHoy()));
    var minimo = actual;
    var maximo = actual;
    fechas.forEach(function (fecha) {
      if (fecha == null) return; // en curso: cuenta hasta hoy
      var mes = mesAbsoluto(fecha);
      if (mes === null) return;
      mes = Math.floor(mes);
      if (mes < minimo) minimo = mes;
      if (mes > maximo) maximo = mes;
    });
    var inicio = minimo - MARGEN_MESES;
    return { inicio: inicio, meses: maximo + MARGEN_MESES - inicio + 1 };
  }

  // Posición en meses desde el inicio del eje (0 = borde izquierdo del
  // lienzo). Sin fecha (null/undefined, en curso): hoy. null si no es válida
  function mesDeFecha(fecha) {
    if (!rango) return null;
    var mes = mesAbsoluto(fecha == null ? fechaHoy() : fecha);
    return mes === null ? null : mes - rango.inicio;
  }

  // Ancho de un mes en píxeles, el de --ancho-mes-cronologia ya resuelto:
  // el lienzo mide exactamente ese ancho por el número de meses
  function anchoMes() {
    if (!rango || !rango.meses) return 0;
    return lienzo.getBoundingClientRect().width / rango.meses;
  }

  // X en píxeles desde el borde izquierdo del lienzo; null si no es válida
  function xDeFecha(fecha) {
    var mes = mesDeFecha(fecha);
    return mes === null ? null : mes * anchoMes();
  }

  // ---- Montaje ----

  function crear(etiqueta, clase, texto) {
    var nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto != null) nodo.textContent = texto;
    return nodo;
  }

  // Una marca por mes (al inicio del mes); enero, más marcada y con el año
  function montarEje() {
    var fragmento = document.createDocumentFragment();
    for (var i = 0; i < rango.meses; i++) {
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
    // Pasos siguientes: capas.periodos y capas.proyectos
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
