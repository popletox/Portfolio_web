// Debe coincidir con la media query del panel inferior en estilos/comun.css
var DISPOSICION_VERTICAL = '(max-width: 768px), (max-aspect-ratio: 3/4)';

// Cabecera compacta en móvil. Histéresis: se compacta al pasar de
// UMBRAL_COMPACTAR y vuelve al normal solo por debajo de UMBRAL_NORMAL, para
// que el cambio de altura de la cabecera no provoque un bucle de saltos
var CABECERA_ESTRECHA = '(max-width: 768px)'; // igual que la media query de la cabecera
var UMBRAL_COMPACTAR = 48;
var UMBRAL_NORMAL = 8;

// Ajusta la cabecera al estado que tendrá con el scroll indicado, sin animar.
// Devuelve true si ha cambiado (para volver a medir). La usa navegarAProyecto.
var ajustarCabeceraParaScroll = function () { return false; };

(function () {
  var cabecera = document.querySelector('.cabecera');
  if (!cabecera) return;
  var consultaEstrecha = window.matchMedia(CABECERA_ESTRECHA);
  var movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  var pendiente = false;
  var MARGEN_TRANSICION = 50; // ms extra para cubrir el final de la transición

  // Altura constante en el flujo: al compactarse, la cabecera recupera con
  // margin-bottom (--compensacion-cabecera) lo que pierde de alto. Así el
  // contenido no se mueve, el navegador no reajusta el scroll y no hay bucle.
  // Durante la transición se recalcula en cada frame con el alto real.
  var altoNormal = 0;
  var finCambio = 0; // hasta cuándo no se admite otro cambio de estado
  var bucle = 0;
  var remedirPendiente = false;
  var anchoMedido = window.innerWidth;

  function duracionTransicion() {
    var valor = getComputedStyle(document.documentElement).getPropertyValue('--duracion-transicion').trim();
    var numero = parseFloat(valor) || 0;
    return /ms$/.test(valor) ? numero : numero * 1000;
  }

  function sinAnimaciones() {
    return movimientoReducido.matches || document.body.classList.contains('sin-transiciones');
  }

  function enTransicion() {
    return Date.now() < finCambio;
  }

  function compensar() {
    var valor = consultaEstrecha.matches
      ? Math.max(0, altoNormal - cabecera.getBoundingClientRect().height)
      : 0;
    cabecera.style.setProperty('--compensacion-cabecera', valor + 'px');
  }

  // Alto de la cabecera normal; si está compacta se mide sin animar y se
  // restaura en el mismo frame (no llega a pintarse)
  function medirAltoNormal() {
    remedirPendiente = false;
    anchoMedido = window.innerWidth;
    if (consultaEstrecha.matches) {
      var compacta = cabecera.classList.contains('cabecera--compacta');
      cabecera.classList.add('cabecera--instantanea');
      if (compacta) cabecera.classList.remove('cabecera--compacta');
      altoNormal = cabecera.getBoundingClientRect().height;
      if (compacta) cabecera.classList.add('cabecera--compacta');
      void cabecera.offsetHeight;
      cabecera.classList.remove('cabecera--instantanea');
    } else {
      altoNormal = 0;
    }
    compensar();
  }

  // Los botones cambian de fila de golpe (grid-template-areas no se anima):
  // se ocultan en el frame del salto y aparecen con un fundido en el siguiente
  var fundido = 0;
  function fundirAcciones() {
    cancelAnimationFrame(fundido);
    cabecera.classList.add('cabecera--recolocando');
    fundido = requestAnimationFrame(function () {
      fundido = 0;
      cabecera.classList.remove('cabecera--recolocando');
    });
  }

  // Ajusta la compensación en cada frame hasta que acaba la transición
  function seguirTransicion() {
    cancelAnimationFrame(bucle);
    function paso() {
      compensar();
      if (enTransicion()) {
        bucle = requestAnimationFrame(paso);
        return;
      }
      bucle = 0;
      if (remedirPendiente) medirAltoNormal();
      actualizar(); // el scroll pudo cambiar durante el bloqueo
    }
    bucle = requestAnimationFrame(paso);
  }

  function recalcular() {
    if (enTransicion()) {
      remedirPendiente = true;
      compensar();
      return;
    }
    medirAltoNormal();
    actualizar();
  }

  function estadoPara(scroll, actual) {
    if (!consultaEstrecha.matches) return false;
    if (scroll > UMBRAL_COMPACTAR) return true;
    if (scroll < UMBRAL_NORMAL) return false;
    return actual;
  }

  // Durante un desplazamiento programado se usa el scroll de destino, para que
  // la cabecera no se expanda al salir de cerca del inicio
  var objetivo = null;
  var finObjetivo = 0;

  function actualizar() {
    pendiente = false;
    if (enTransicion()) return; // se reevalúa al terminar la transición
    var actual = cabecera.classList.contains('cabecera--compacta');
    var scroll = window.scrollY;
    if (objetivo !== null) {
      if (Math.abs(scroll - objetivo) <= 1 || Date.now() > finObjetivo) objetivo = null;
      else scroll = objetivo;
    }
    var nuevo = estadoPara(scroll, actual);
    if (nuevo === actual) return;
    cabecera.classList.toggle('cabecera--compacta', nuevo);
    if (consultaEstrecha.matches && !sinAnimaciones()) {
      finCambio = Date.now() + duracionTransicion() + MARGEN_TRANSICION;
      fundirAcciones();
      seguirTransicion();
    }
    compensar();
  }

  window.addEventListener('scroll', function () {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(actualizar);
  }, { passive: true });

  if (consultaEstrecha.addEventListener) {
    consultaEstrecha.addEventListener('change', recalcular);
  } else if (consultaEstrecha.addListener) {
    consultaEstrecha.addListener(recalcular);
  }

  // Solo si cambia el ancho: en móvil la barra del navegador cambia el alto al hacer scroll
  var resizePendiente = false;
  window.addEventListener('resize', function () {
    if (resizePendiente) return;
    resizePendiente = true;
    requestAnimationFrame(function () {
      resizePendiente = false;
      if (window.innerWidth !== anchoMedido) recalcular();
    });
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(recalcular);
  }

  medirAltoNormal();
  actualizar();

  ajustarCabeceraParaScroll = function (scroll) {
    var actual = cabecera.classList.contains('cabecera--compacta');
    objetivo = scroll;
    finObjetivo = Date.now() + 1500;
    var nuevo = estadoPara(scroll, actual);
    var enCurso = enTransicion();
    if (nuevo === actual && !enCurso) return false;
    // Forzado: salta el bloqueo y termina cualquier transición en curso
    cancelAnimationFrame(bucle);
    bucle = 0;
    finCambio = 0;
    cancelAnimationFrame(fundido);
    fundido = 0;
    cabecera.classList.remove('cabecera--recolocando');
    cabecera.classList.add('cabecera--instantanea');
    cabecera.classList.toggle('cabecera--compacta', nuevo);
    void cabecera.offsetHeight; // aplica el tamaño final antes de medir
    cabecera.classList.remove('cabecera--instantanea');
    if (remedirPendiente) medirAltoNormal();
    else compensar();
    return true;
  };
})();

// Panel destacado: estado inicial y botón de apertura/cierre
(function () {
  var cuerpo = document.body;
  var boton = document.getElementById('boton-destacado');
  if (!boton) return;

  var consultaVertical = window.matchMedia(DISPOSICION_VERTICAL);

  function aplicarEstado(abierto) {
    cuerpo.classList.toggle('panel-abierto', abierto);
    boton.setAttribute('aria-expanded', String(abierto));
    boton.setAttribute('aria-label', abierto ? 'Cerrar panel destacado' : 'Abrir panel destacado');
    // El carrusel de destacados pausa o reanuda su rotación
    document.dispatchEvent(new CustomEvent('destacado:estado', { detail: { abierto: abierto } }));
  }

  // Activar transiciones solo después del siguiente pintado
  function reactivarTransiciones() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        cuerpo.classList.remove('sin-transiciones');
      });
    });
  }

  aplicarEstado(!consultaVertical.matches);

  boton.addEventListener('click', function () {
    aplicarEstado(!cuerpo.classList.contains('panel-abierto'));
  });

  // Sin "destacado" en el JSON, contenido.js oculta el panel: se oculta
  // también el botón y se libera el espacio reservado
  var panel = document.getElementById('panel-destacado');
  document.addEventListener('contenido:listo', function () {
    if (!panel || !panel.hidden) return;
    aplicarEstado(false);
    boton.hidden = true;
  });

  // Al cambiar de disposición se conserva el estado, sin animar el cambio
  function alCambiarDisposicion() {
    cuerpo.classList.add('sin-transiciones');
    reactivarTransiciones();
  }

  if (consultaVertical.addEventListener) {
    consultaVertical.addEventListener('change', alCambiarDisposicion);
  } else if (consultaVertical.addListener) {
    consultaVertical.addListener(alCambiarDisposicion);
  }

  // La activación inicial de transiciones la hace el bloque de entradas,
  // cuando el contenido cargado desde JSON ya está montado.
})();

// Muestra la diapositiva del panel Destacado que contiene el nodo indicado
// (sin efecto si no hay carrusel). La usa volverAOrigen
var mostrarDiapositivaDestacado = function () {};

// Carrusel del panel Destacado: rotación automática y puntos indicadores.
// Se pausa con el ratón encima o el foco de teclado dentro, con el panel
// cerrado, con la pestaña oculta y con el visor de imágenes abierto. Al
// reanudar se espera un intervalo completo. Con movimiento reducido no rota
(function () {
  var INTERVALO = 10000; // ms entre diapositivas
  var panel = document.getElementById('panel-destacado');
  if (!panel) return;
  var movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  var visor = document.getElementById('visor-imagen');

  var ventana = null;
  var pista = null;
  var diapositivas = [];
  var puntos = [];
  var actual = 0;
  var temporizador = 0;
  var ratonDentro = false;
  var focoDentro = false;

  // Foco de teclado (no el que deja un clic de ratón en un punto o enlace)
  function esFocoTeclado(nodo) {
    try {
      return !!nodo && nodo.matches(':focus-visible');
    } catch (error) {
      return true; // navegador sin :focus-visible: cualquier foco pausa
    }
  }

  function irA(indice) {
    var total = diapositivas.length;
    if (!total) return;
    actual = (indice % total + total) % total;
    pista.style.setProperty('--indice-destacado', String(actual));
    diapositivas.forEach(function (diapositiva, i) {
      var visible = i === actual;
      diapositiva.inert = !visible;
      if (visible) diapositiva.removeAttribute('aria-hidden');
      else diapositiva.setAttribute('aria-hidden', 'true');
    });
    puntos.forEach(function (punto, i) {
      if (i === actual) punto.setAttribute('aria-current', 'true');
      else punto.removeAttribute('aria-current');
    });
  }

  function puedeRotar() {
    return diapositivas.length > 1 &&
      !panel.hidden &&
      !movimientoReducido.matches &&
      !ratonDentro &&
      !focoDentro &&
      !document.hidden &&
      document.body.classList.contains('panel-abierto') &&
      !(visor && visor.open);
  }

  // (Re)inicia la cuenta completa si se puede rotar; si no, la detiene
  function programar() {
    clearTimeout(temporizador);
    temporizador = 0;
    var rotando = puedeRotar();
    // Mientras rota no se anuncian los cambios; parado, sí (p. ej. al usar los puntos)
    if (ventana) ventana.setAttribute('aria-live', rotando ? 'off' : 'polite');
    if (!rotando) return;
    temporizador = setTimeout(function () {
      temporizador = 0;
      if (!puedeRotar()) return;
      irA(actual + 1);
      programar();
    }, INTERVALO);
  }

  function iniciar() {
    ventana = panel.querySelector('.destacado-ventana');
    pista = panel.querySelector('.destacado-pista');
    diapositivas = pista ? Array.prototype.slice.call(pista.querySelectorAll('.destacado-diapositiva')) : [];
    puntos = Array.prototype.slice.call(panel.querySelectorAll('.destacado-punto'));
    if (diapositivas.length < 2) {
      diapositivas = [];
      return;
    }
    irA(0);
    programar();
  }

  mostrarDiapositivaDestacado = function (nodo) {
    var diapositiva = nodo && nodo.closest && nodo.closest('.destacado-diapositiva');
    var indice = diapositivas.indexOf(diapositiva);
    if (indice === -1 || indice === actual) return;
    irA(indice);
    programar();
  };

  panel.addEventListener('click', function (evento) {
    var punto = evento.target.closest('.destacado-punto');
    if (!punto || !diapositivas.length) return;
    irA(parseInt(punto.getAttribute('data-indice'), 10) || 0);
    programar();
  });

  // Solo ratón: en pantallas táctiles no hay "salir" y quedaría pausado
  panel.addEventListener('pointerenter', function (evento) {
    if (evento.pointerType !== 'mouse') return;
    ratonDentro = true;
    programar();
  });
  panel.addEventListener('pointerleave', function (evento) {
    if (evento.pointerType !== 'mouse' || !ratonDentro) return;
    ratonDentro = false;
    programar();
  });

  panel.addEventListener('focusin', function (evento) {
    var antes = focoDentro;
    focoDentro = esFocoTeclado(evento.target);
    if (focoDentro !== antes) programar();
  });
  panel.addEventListener('focusout', function (evento) {
    var destino = evento.relatedTarget;
    if (destino && panel.contains(destino)) return; // lo resuelve focusin
    if (!focoDentro) return;
    focoDentro = false;
    programar();
  });

  document.addEventListener('destacado:estado', programar);
  document.addEventListener('visibilitychange', programar);
  if (visor) visor.addEventListener('close', programar);

  if (movimientoReducido.addEventListener) {
    movimientoReducido.addEventListener('change', programar);
  } else if (movimientoReducido.addListener) {
    movimientoReducido.addListener(programar);
  }

  document.addEventListener('contenido:listo', iniciar);
})();

// Panel Destacado sin scroll interno: si una descripción no cabe en el alto
// que le deja la diapositiva (CSS la encoge), se recorta a las líneas enteras
// que caben, con puntos suspensivos. Se recalcula cuando cambia el tamaño del
// bloque de texto (ventana, imagen cargada, tema) o terminan de cargar fuentes
(function () {
  var panel = document.getElementById('panel-destacado');
  if (!panel) return;
  var RECORTADA = 'destacado-descripcion--recortada';
  var OCULTA = 'destacado-descripcion--oculta';
  var pendiente = 0;
  var observador = null;

  function altoLinea(parrafo) {
    var estilo = getComputedStyle(parrafo);
    var alto = parseFloat(estilo.lineHeight);
    return alto > 0 ? alto : parseFloat(estilo.fontSize) * 1.2;
  }

  function ajustar() {
    pendiente = 0;
    var parrafos = Array.prototype.slice.call(panel.querySelectorAll('.destacado-descripcion'));
    // Primero se quitan los recortes y se mide; después se aplica (sin alternar
    // lecturas y escrituras)
    parrafos.forEach(function (parrafo) {
      parrafo.classList.remove(RECORTADA, OCULTA);
      parrafo.style.removeProperty('--lineas-descripcion');
    });
    var medidas = parrafos.map(function (parrafo) {
      return {
        visible: parrafo.clientHeight,
        total: parrafo.scrollHeight,
        linea: altoLinea(parrafo)
      };
    });
    parrafos.forEach(function (parrafo, i) {
      var medida = medidas[i];
      if (medida.total <= medida.visible + 1) return;
      var lineas = Math.floor((medida.visible + 1) / medida.linea);
      if (lineas < 1) {
        parrafo.classList.add(OCULTA);
      } else {
        parrafo.style.setProperty('--lineas-descripcion', String(lineas));
        parrafo.classList.add(RECORTADA);
      }
    });
  }

  function programar() {
    if (pendiente) return;
    pendiente = requestAnimationFrame(ajustar);
  }

  function iniciar() {
    if (observador) observador.disconnect();
    if ('ResizeObserver' in window) {
      observador = new ResizeObserver(programar);
      panel.querySelectorAll('.destacado-texto').forEach(function (texto) {
        observador.observe(texto);
      });
    }
    programar();
  }

  if (!('ResizeObserver' in window)) window.addEventListener('resize', programar);
  if (document.fonts && document.fonts.addEventListener) {
    document.fonts.addEventListener('loadingdone', programar);
  }
  // Cambio de tema (temas.js cambia data-tema en <html>): puede cambiar la
  // fuente sin cambiar el tamaño del bloque de texto
  if ('MutationObserver' in window) {
    new MutationObserver(programar).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-tema']
    });
  }
  document.addEventListener('contenido:listo', iniciar);
})();

// Secciones plegables: abre o cierra una sección (clase, aria-expanded e inert)
function aplicarEstadoSeccion(seccion, abierta) {
  var boton = seccion.querySelector('.seccion-alternar');
  if (!boton) return;
  var contenido = document.getElementById(boton.getAttribute('aria-controls'));
  if (!contenido) return;
  seccion.classList.toggle('seccion--abierta', abierta);
  boton.setAttribute('aria-expanded', String(abierta));
  contenido.inert = !abierta;
}

// Secciones plegables: cada encabezado abre o cierra su contenido
(function () {
  var botones = document.querySelectorAll('.seccion-alternar');

  Array.prototype.forEach.call(botones, function (boton) {
    var seccion = boton.closest('.seccion');
    var contenido = document.getElementById(boton.getAttribute('aria-controls'));
    if (!seccion || !contenido) return;

    boton.addEventListener('click', function () {
      aplicarEstadoSeccion(seccion, !seccion.classList.contains('seccion--abierta'));
    });
  });
})();

// Entradas de línea de tiempo: abre o cierra el detalle de una entrada
function aplicarEstadoEntrada(entrada, abierta) {
  var boton = entrada.querySelector('.linea-tiempo-alternar');
  if (!boton) return;
  var detalle = document.getElementById(boton.getAttribute('aria-controls'));
  if (!detalle) return;
  entrada.classList.toggle('linea-tiempo-entrada--abierta', abierta);
  boton.setAttribute('aria-expanded', String(abierta));
  detalle.inert = !abierta;
}

// Entradas de línea de tiempo: cada título abre o cierra su detalle
(function () {

  // Delegación: sirve también para entradas creadas después de cargar
  document.addEventListener('click', function (evento) {
    var boton = evento.target.closest('.linea-tiempo-alternar');
    if (!boton) return;
    var entrada = boton.closest('.linea-tiempo-entrada');
    if (!entrada) return;
    aplicarEstadoEntrada(entrada, !entrada.classList.contains('linea-tiempo-entrada--abierta'));
  });

  // Activar transiciones solo después del siguiente pintado
  var transicionesActivadas = false;
  function activarTransiciones() {
    if (transicionesActivadas) return;
    transicionesActivadas = true;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.remove('sin-transiciones');
      });
    });
  }

  // La primera entrada de Experiencia empieza desplegada, sin animación:
  // .sin-transiciones sigue puesto hasta que el contenido está montado.
  document.addEventListener('contenido:listo', function () {
    var primera = document.querySelector('#experiencia .linea-tiempo-entrada');
    if (primera) aplicarEstadoEntrada(primera, true);
    activarTransiciones();
  });
  document.addEventListener('contenido:error', activarTransiciones);

  // Red de seguridad: si no llega ningún evento, no dejar la página sin transiciones
  setTimeout(activarTransiciones, 5000);
})();

// Filtros de Proyectos: muestra solo la categoría indicada ('todos' muestra todo).
// Las bandas por año se vuelven a montar con los proyectos visibles
// (window.Proyectos.montar, en contenido.js). Con transición: fundido de
// salida, cambio del contenido, ajuste de la altura y fundido de entrada.
// opciones.instantaneo: sin transición (layout definitivo al volver).
var aplicarFiltroProyectos = (function () {
  var movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  var generacion = 0; // invalida las fases pendientes de un filtro anterior
  var animaciones = [];

  function duracion(variable) {
    var valor = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    var numero = parseFloat(valor) || 0;
    return /ms$/.test(valor) ? numero : numero * 1000;
  }

  function cancelarAnimaciones() {
    animaciones.forEach(function (animacion) { animacion.cancel(); });
    animaciones = [];
  }

  // fill 'forwards': entre una fase y la siguiente no se ve el estado sin animar
  function animar(nodo, fotogramas, ms) {
    var animacion = nodo.animate(fotogramas, { duration: ms, easing: 'ease', fill: 'forwards' });
    animaciones.push(animacion);
    return animacion.finished;
  }

  function aplicar(filtro, opciones) {
    var seccion = document.getElementById('proyectos');
    if (!seccion || !window.Proyectos) return;
    filtro = filtro || 'todos';
    generacion++;
    var gen = generacion;

    Array.prototype.forEach.call(seccion.querySelectorAll('.filtro-proyecto'), function (boton) {
      boton.setAttribute('aria-pressed', String(boton.getAttribute('data-filtro') === filtro));
    });

    var contenedor = seccion.querySelector('.proyectos-bandas');
    var instantaneo = (opciones && opciones.instantaneo) || movimientoReducido.matches ||
      document.body.classList.contains('sin-transiciones') || typeof Element.prototype.animate !== 'function';

    // Se cancela cualquier fase pendiente de un filtro anterior
    cancelarAnimaciones();
    if (instantaneo || !contenedor) {
      window.Proyectos.montar(filtro);
      return;
    }

    animar(contenedor, [{ opacity: 1 }, { opacity: 0 }], duracion('--duracion-fundido'))
      .then(function () {
        if (gen !== generacion) return;
        var altoAntes = contenedor.offsetHeight;
        window.Proyectos.montar(filtro);
        var altoDespues = contenedor.offsetHeight;
        return animar(contenedor, [
          { opacity: 0, overflow: 'hidden', height: altoAntes + 'px' },
          { opacity: 0, overflow: 'hidden', height: altoDespues + 'px' }
        ], duracion('--duracion-expansion'));
      })
      .then(function () {
        if (gen !== generacion) return;
        return animar(contenedor, [{ opacity: 0 }, { opacity: 1 }], duracion('--duracion-fundido'));
      })
      .then(function () {
        if (gen !== generacion) return;
        cancelarAnimaciones();
      })
      .catch(function () { /* cancelada por un filtro posterior */ });
  }

  document.addEventListener('click', function (evento) {
    var boton = evento.target.closest('.filtro-proyecto');
    if (!boton || boton.getAttribute('aria-pressed') === 'true') return;
    aplicar(boton.getAttribute('data-filtro'));
  });

  return aplicar;
})();

// Filtro activo: el valor del botón con aria-pressed="true" ('todos' si no hay filtros)
function filtroProyectosActivo() {
  var activo = document.querySelector('#proyectos .filtro-proyecto[aria-pressed="true"]');
  return activo ? activo.getAttribute('data-filtro') : 'todos';
}

// Historial de la ventana de detalle de un proyecto: la asigna el bloque de
// la ventana (al final). Recibe el estado de un popstate y devuelve true si
// lo ha gestionado ella (abrir o cerrar la ventana), para que el popstate de
// los enlaces internos no haga nada más
var gestionarHistorialDetalle = function () { return false; };

// Enlaces internos a proyectos (tarjetas de Referencias y Destacado): abrir Proyectos, centrar la tarjeta del proyecto y resaltarla
(function () {
  var movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  var consultaVertical = window.matchMedia(DISPOSICION_VERTICAL);
  var MARGEN_ESPERA = 80; // ms extra tras la expansión
  var MARGEN_SUPERIOR = 16; // px bajo la cabecera si el proyecto no cabe
  var ESPERA_SCROLL_MAX = 1000; // ms si no hay evento scrollend

  // Duración de --duracion-expansion en ms (acepta "250ms" o "0.25s")
  function duracionExpansion() {
    var valor = getComputedStyle(document.documentElement).getPropertyValue('--duracion-expansion').trim();
    var numero = parseFloat(valor) || 0;
    return /ms$/.test(valor) ? numero : numero * 1000;
  }

  function sinAnimaciones() {
    return movimientoReducido.matches || document.body.classList.contains('sin-transiciones');
  }

  // Zona visible útil: bajo la cabecera y sobre el panel inferior si está abierto
  function zonaVisible() {
    var cabecera = document.querySelector('.cabecera');
    var arriba = cabecera ? Math.max(0, cabecera.getBoundingClientRect().bottom) : 0;
    var abajo = window.innerHeight;
    var panel = document.querySelector('.panel-destacado');
    if (panel && consultaVertical.matches && document.body.classList.contains('panel-abierto')) {
      // Alto del panel, no su rect: puede estar aún deslizándose
      abajo -= panel.offsetHeight;
    }
    return { arriba: arriba, alto: Math.max(0, abajo - arriba) };
  }

  // Si el destino cambia el estado de la cabecera (móvil), se aplica ya sin
  // animar y se recalcula con su altura final
  function calcularDestino(entrada) {
    var destino = medirDestino(entrada);
    if (ajustarCabeceraParaScroll(destino)) destino = medirDestino(entrada);
    return destino;
  }

  function medirDestino(entrada) {
    var rect = entrada.getBoundingClientRect();
    var zona = zonaVisible();
    var desplazamiento = rect.height > zona.alto
      ? zona.arriba + MARGEN_SUPERIOR
      : zona.arriba + (zona.alto - rect.height) / 2;
    var maximo = document.documentElement.scrollHeight - window.innerHeight;
    var destino = window.scrollY + rect.top - desplazamiento;
    return Math.round(Math.min(Math.max(destino, 0), Math.max(maximo, 0)));
  }

  function resaltar(entrada) {
    entrada.classList.remove('entrada-resaltada');
    void entrada.offsetWidth; // reinicia la animación si se repite
    entrada.classList.add('entrada-resaltada');
  }

  function alTerminarResaltado(evento) {
    if (evento.animationName !== 'parpadeo-resaltado' && evento.animationName !== 'fundido-resaltado') return;
    evento.currentTarget.classList.remove('entrada-resaltada');
  }

  // Resaltar cuando el desplazamiento suave termina (scrollend o tiempo máximo)
  function resaltarTrasDesplazamiento(entrada, hayDesplazamiento) {
    if (!hayDesplazamiento) {
      resaltar(entrada);
      return;
    }
    var hecho = false;
    function lanzar() {
      if (hecho) return;
      hecho = true;
      window.removeEventListener('scrollend', lanzar);
      resaltar(entrada);
    }
    if ('onscrollend' in window) window.addEventListener('scrollend', lanzar);
    setTimeout(lanzar, ESPERA_SCROLL_MAX);
  }

  function irAProyecto(tarjeta) {
    var espera = false;
    var seccion = tarjeta.closest('.seccion');
    if (seccion && !seccion.classList.contains('seccion--abierta')) {
      aplicarEstadoSeccion(seccion, true);
      espera = true;
    }

    // La tarjeta es un botón: recibe el foco sin abrir su ventana
    tarjeta.focus({ preventScroll: true });

    // Se espera a que la sección termine de abrirse antes de medir
    var retardo = espera && !sinAnimaciones() ? duracionExpansion() + MARGEN_ESPERA : 0;
    setTimeout(function () {
      var destino = calcularDestino(tarjeta);
      var hayDesplazamiento = Math.abs(destino - window.scrollY) > 1;
      var suave = !movimientoReducido.matches;
      window.scrollTo({ top: destino, behavior: suave ? 'smooth' : 'auto' });
      resaltarTrasDesplazamiento(tarjeta, hayDesplazamiento && suave);
    }, retardo);
  }

  // Tarjeta del proyecto con ese id (registrada por contenido.js aunque el
  // filtro activo la tenga fuera del DOM)
  function tarjetaProyecto(id) {
    return id && window.Proyectos ? window.Proyectos.tarjeta(id) : null;
  }

  // Abre Proyectos, centra y resalta la tarjeta; opcionalmente añade una entrada al historial
  function navegarAProyecto(id, opciones) {
    var tarjeta = tarjetaProyecto(id);
    if (!tarjeta) return false;
    // Si el filtro activo oculta el destino, volver a "Todos" sin transición:
    // el layout queda definitivo antes de calcular el centrado
    var filtro = filtroProyectosActivo();
    if (!tarjeta.isConnected || (filtro !== 'todos' && tarjeta.getAttribute('data-categoria') !== filtro)) {
      aplicarFiltroProyectos('todos', { instantaneo: true });
    }
    if (opciones && opciones.registrarHistorial && history.pushState) {
      history.pushState({ tipo: 'proyecto', id: id }, '', '#' + id);
    }
    if (!tarjeta.dataset.resaltadoListo) {
      tarjeta.addEventListener('animationend', alTerminarResaltado);
      tarjeta.dataset.resaltadoListo = '1';
    }
    irAProyecto(tarjeta);
    return true;
  }

  var historialDisponible = !!(history.pushState && history.replaceState);
  // Evita que el navegador restaure el scroll y choque con el nuestro
  if (historialDisponible && 'scrollRestoration' in history) history.scrollRestoration = 'manual';

  // Identifica un enlace por su data-proyecto y su posición entre los del mismo destino
  function localizarEnlace(proyecto, indice) {
    var enlaces = document.querySelectorAll('a.enlace-proyecto[data-proyecto]');
    var iguales = Array.prototype.filter.call(enlaces, function (e) {
      return e.getAttribute('data-proyecto') === proyecto;
    });
    return iguales[indice] || null;
  }

  // Volver a la entrada de origen: centra su entrada (o el enlace si no cabe);
  // si el enlace no está visible, usa la posición guardada
  function volverAOrigen(estado) {
    var enlace = localizarEnlace(estado.proyecto, estado.indice);
    var suave = !movimientoReducido.matches;
    var destino = estado.scroll;
    // El panel Destacado es fijo: se vuelve a la posición guardada y solo se
    // enfoca el enlace si el panel sigue abierto
    var enPanel = enlace && enlace.closest('.panel-destacado');
    if (enPanel) {
      // Si el enlace está en otra diapositiva, se muestra antes de enfocarlo
      mostrarDiapositivaDestacado(enlace);
      window.scrollTo({ top: destino, behavior: suave ? 'smooth' : 'auto' });
      if (document.body.classList.contains('panel-abierto')) enlace.focus({ preventScroll: true });
      return;
    }
    if (enlace && enlace.getClientRects().length && !enlace.closest('[inert]')) {
      var entrada = enlace.closest('.linea-tiempo-entrada');
      var objetivo = entrada && entrada.getBoundingClientRect().height <= zonaVisible().alto ? entrada : enlace;
      destino = calcularDestino(objetivo);
    }
    window.scrollTo({ top: destino, behavior: suave ? 'smooth' : 'auto' });
    if (enlace && !enlace.closest('[inert]')) enlace.focus({ preventScroll: true });
  }

  document.addEventListener('click', function (evento) {
    var enlace = evento.target.closest('a.enlace-proyecto[data-proyecto]');
    if (!enlace) return;
    var proyecto = enlace.getAttribute('data-proyecto');
    if (!tarjetaProyecto(proyecto)) return;
    evento.preventDefault();
    if (historialDisponible) {
      var iguales = document.querySelectorAll('a.enlace-proyecto[data-proyecto]');
      var indice = Array.prototype.filter.call(iguales, function (e) {
        return e.getAttribute('data-proyecto') === proyecto;
      }).indexOf(enlace);
      // Guarda en la entrada actual cómo volver al mérito
      history.replaceState({ tipo: 'origen', scroll: window.scrollY, proyecto: proyecto, indice: indice }, '', location.href);
    }
    navegarAProyecto(proyecto, { registrarHistorial: historialDisponible });
  });

  window.addEventListener('popstate', function (evento) {
    var estado = evento.state;
    if (gestionarHistorialDetalle(estado)) return;
    if (estado && estado.tipo === 'origen') {
      volverAOrigen(estado);
    } else if (estado && estado.tipo === 'proyecto') {
      navegarAProyecto(estado.id);
    } else if (location.hash) {
      navegarAProyecto(decodeURIComponent(location.hash.slice(1)));
    }
  });

  // Recarga o enlace directo con #proyecto: navegar cuando el contenido existe
  document.addEventListener('contenido:listo', function () {
    if (location.hash) navegarAProyecto(decodeURIComponent(location.hash.slice(1)));
  });
})();

// Visor de imágenes: un clic en la imagen del panel Destacado o en una
// miniatura .proyecto-miniatura (ventana de detalle de un proyecto) la abre
// en grande, por encima de la ventana si está abierta
(function () {
  var visor = document.getElementById('visor-imagen');
  if (!visor || typeof visor.showModal !== 'function') return;
  var contenido = visor.querySelector('.visor-imagen-contenido');
  var botonCerrar = visor.querySelector('.visor-imagen-cerrar');
  var movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  var miniaturaOrigen = null;

  function crearImagen(miniatura) {
    var img = miniatura.querySelector('img');
    if (img) {
      var grande = document.createElement('img');
      grande.src = miniatura.getAttribute('data-imagen-grande') || img.currentSrc || img.src;
      grande.alt = img.alt || '';
      return grande;
    }
    var provisional = document.createElement('div');
    provisional.className = 'visor-imagen-provisional';
    provisional.setAttribute('role', 'img');
    provisional.setAttribute('aria-label', miniatura.getAttribute('aria-label') || 'Imagen provisional');
    return provisional;
  }

  function abrir(miniatura) {
    miniaturaOrigen = miniatura;
    contenido.replaceChildren(crearImagen(miniatura));
    visor.classList.remove('visor-imagen--cerrando');
    document.body.classList.add('visor-abierto');
    visor.showModal();
    botonCerrar.focus();
  }

  function terminarCierre() {
    visor.removeEventListener('animationend', terminarCierre);
    visor.classList.remove('visor-imagen--cerrando');
    if (visor.open) visor.close();
  }

  function cerrar() {
    if (!visor.open || visor.classList.contains('visor-imagen--cerrando')) return;
    if (movimientoReducido.matches) {
      visor.close();
      return;
    }
    visor.classList.add('visor-imagen--cerrando');
    visor.addEventListener('animationend', terminarCierre);
  }

  // Delegación: un solo listener para todas las miniaturas y la imagen del panel Destacado
  document.addEventListener('click', function (evento) {
    var miniatura = evento.target.closest('.proyecto-miniatura, button.destacado-imagen');
    if (miniatura) abrir(miniatura);
  });

  botonCerrar.addEventListener('click', cerrar);

  // Clic en el fondo: el objetivo es el propio dialog, no su contenido
  visor.addEventListener('click', function (evento) {
    if (evento.target === visor) cerrar();
  });

  // Esc: se intercepta para animar la salida
  visor.addEventListener('cancel', function (evento) {
    evento.preventDefault();
    cerrar();
  });

  visor.addEventListener('close', function () {
    visor.classList.remove('visor-imagen--cerrando');
    document.body.classList.remove('visor-abierto');
    contenido.replaceChildren();
    if (miniaturaOrigen) miniaturaOrigen.focus();
    miniaturaOrigen = null;
  });
})();

// Ventana de detalle de un proyecto (<dialog id="detalle-proyecto">): se abre
// al pulsar una tarjeta de Proyectos o con window.Proyectos.abrirDetalle(id).
// Se cierra con ✕, Esc, clic fuera o el botón Atrás; el foco vuelve a la
// tarjeta. Historial: al abrir se añade una entrada propia (misma URL, estado
// { tipo: 'detalle', id, clave }); cerrar con ✕/Esc/fuera hace history.back()
// para quitarla y es ese popstate el que cierra la ventana, así no quedan
// entradas sobrantes. Adelante vuelve a abrirla
(function () {
  var dialogo = document.getElementById('detalle-proyecto');
  if (!dialogo || typeof dialogo.showModal !== 'function' || !window.Proyectos) return;
  var caja = dialogo.querySelector('.detalle-proyecto-caja');
  var botonCerrar = dialogo.querySelector('.detalle-proyecto-cerrar');
  var movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  var historialDisponible = !!(history.pushState && history.replaceState);
  var CERRANDO = 'detalle-proyecto--cerrando';
  var ESPERA_HISTORIAL = 500; // ms máximos hasta el popstate de history.back()
  var MARGEN_CIERRE = 100; // ms extra si no llega animationend

  var origen = null; // recibe el foco al cerrar
  var clave = null; // identifica la entrada de historial de la ventana abierta
  var volviendo = false; // se ha pedido history.back() para cerrar
  var esperaVuelta = 0;
  var esperaCierre = 0;
  var pulsacionFuera = false;

  function duracionFundido() {
    var valor = getComputedStyle(document.documentElement).getPropertyValue('--duracion-fundido').trim();
    var numero = parseFloat(valor) || 0;
    return /ms$/.test(valor) ? numero : numero * 1000;
  }

  function cerrando() {
    return dialogo.classList.contains(CERRANDO);
  }

  function abierta() {
    return dialogo.open && !cerrando();
  }

  function esEntradaPropia(estado) {
    return clave !== null && !!estado && estado.tipo === 'detalle' && estado.clave === clave;
  }

  function terminarCierre(evento) {
    if (evento && evento.target !== dialogo) return;
    clearTimeout(esperaCierre);
    dialogo.removeEventListener('animationend', terminarCierre);
    dialogo.classList.remove(CERRANDO);
    if (dialogo.open) dialogo.close();
  }

  // Cierra la ventana (con fundido) sin tocar el historial
  function ocultar() {
    if (!dialogo.open || cerrando()) return;
    if (movimientoReducido.matches) {
      dialogo.close();
      return;
    }
    dialogo.classList.add(CERRANDO);
    dialogo.addEventListener('animationend', terminarCierre);
    esperaCierre = setTimeout(terminarCierre, duracionFundido() + MARGEN_CIERRE);
  }

  // Quita la entrada propia del historial; el popstate cierra la ventana.
  // Si no llegara, se cierra igualmente pasado un momento
  function volverAtras() {
    volviendo = true;
    history.back();
    clearTimeout(esperaVuelta);
    esperaVuelta = setTimeout(function () {
      if (!volviendo) return;
      volviendo = false;
      clave = null;
      ocultar();
    }, ESPERA_HISTORIAL);
  }

  // ✕, Esc y clic fuera
  function cerrar() {
    if (!abierta() || volviendo) return;
    if (historialDisponible && esEntradaPropia(history.state)) {
      volverAtras();
      return;
    }
    clave = null;
    ocultar();
  }

  // opciones.origen: elemento que recupera el foco al cerrar (por defecto,
  // el que lo tiene al abrir). opciones.clave (interno): reabrir con
  // Adelante usando la entrada de historial existente.
  // Con la ventana ya abierta, cambia su contenido sin añadir otra entrada
  function abrir(id, opciones) {
    opciones = opciones || {};
    if (volviendo) return false;
    var cuerpo = window.Proyectos.detalle(id);
    if (!cuerpo) return false;
    if (cerrando()) terminarCierre();
    var yaAbierta = dialogo.open;

    caja.replaceChildren(cuerpo);
    if (!yaAbierta) {
      origen = opciones.origen || document.activeElement;
      document.body.classList.add('detalle-abierto');
      dialogo.showModal();
      botonCerrar.focus();
    }
    caja.scrollTop = 0;

    if (opciones.clave) {
      clave = opciones.clave;
    } else if (historialDisponible) {
      if (yaAbierta && esEntradaPropia(history.state)) {
        history.replaceState({ tipo: 'detalle', id: id, clave: clave }, '', location.href);
      } else {
        clave = String(Date.now()) + '-' + Math.random().toString(36).slice(2);
        history.pushState({ tipo: 'detalle', id: id, clave: clave }, '', location.href);
      }
    } else {
      clave = null;
    }
    return true;
  }

  // Lo llama el popstate de los enlaces internos (más arriba)
  gestionarHistorialDetalle = function (estado) {
    if (volviendo) {
      volviendo = false;
      clearTimeout(esperaVuelta);
      clave = null;
      ocultar();
      return true;
    }
    if (abierta()) {
      // Atrás con la ventana abierta: solo se cierra
      if (!esEntradaPropia(estado)) {
        clave = null;
        ocultar();
      }
      return true;
    }
    if (estado && estado.tipo === 'detalle' && typeof estado.id === 'string') {
      // Adelante hasta una entrada de la ventana: se vuelve a abrir
      return abrir(estado.id, {
        clave: estado.clave || null,
        origen: window.Proyectos.tarjeta(estado.id)
      });
    }
    return false;
  };

  // Para el resto de la web: abre la ventana de un proyecto por id (true si
  // existe). opciones.origen: elemento al que vuelve el foco al cerrar
  window.Proyectos.abrirDetalle = function (id, opciones) {
    return abrir(id, { origen: opciones && opciones.origen });
  };

  // Tarjetas de Proyectos (botones): clic, Enter o Espacio
  document.addEventListener('click', function (evento) {
    var tarjeta = evento.target.closest('button.proyecto-tarjeta');
    if (!tarjeta || !tarjeta.id) return;
    abrir(tarjeta.id, { origen: tarjeta });
  });

  botonCerrar.addEventListener('click', cerrar);

  // Clic fuera: el objetivo es el propio dialog (su contenido lo llena). Solo
  // si la pulsación también empezó fuera (no al soltar una selección de texto)
  dialogo.addEventListener('pointerdown', function (evento) {
    pulsacionFuera = evento.target === dialogo;
  });
  dialogo.addEventListener('click', function (evento) {
    if (evento.target === dialogo && pulsacionFuera) cerrar();
    pulsacionFuera = false;
  });

  // Esc: se intercepta para animar la salida y quitar la entrada del historial
  dialogo.addEventListener('cancel', function (evento) {
    evento.preventDefault();
    cerrar();
  });

  // Enlaces "#..." del proyecto: no cambian la URL con la ventana abierta;
  // si apuntan a otro proyecto, la ventana muestra ese proyecto
  caja.addEventListener('click', function (evento) {
    var enlace = evento.target.closest('a[href^="#"]');
    if (!enlace) return;
    evento.preventDefault();
    var id = decodeURIComponent(enlace.getAttribute('href').slice(1));
    if (id && window.Proyectos.tarjeta(id)) abrir(id);
  });

  dialogo.addEventListener('close', function () {
    if (dialogo.open) return; // reabierta antes de llegar el evento
    dialogo.classList.remove(CERRANDO);
    document.body.classList.remove('detalle-abierto');
    caja.replaceChildren();
    // Cerrada sin pasar por cerrar() (p. ej. un Esc que el navegador no deja
    // cancelar): se quita igualmente la entrada del historial
    if (!volviendo && historialDisponible && esEntradaPropia(history.state)) volverAtras();
    clave = null;
    var destino = origen;
    origen = null;
    if (destino && destino.isConnected && typeof destino.focus === 'function') {
      destino.focus({ preventScroll: true });
    }
  });

  // Recarga con la ventana abierta: la entrada queda sin ventana; se limpia
  if (historialDisponible && history.state && history.state.tipo === 'detalle') {
    history.replaceState(null, '', location.href);
  }
})();
