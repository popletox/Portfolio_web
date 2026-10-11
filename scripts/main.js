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
// Ocultar: fundido y después colapso de altura; al final, hidden.
// Mostrar: se quita hidden, se abre la altura y después fundido de entrada.
// opciones.instantaneo: sin transición (layout definitivo al volver).
var aplicarFiltroProyectos = (function () {
  var movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  var generacion = 0; // invalida las fases pendientes de un filtro anterior

  function duracion(variable) {
    var valor = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    var numero = parseFloat(valor) || 0;
    return /ms$/.test(valor) ? numero : numero * 1000;
  }

  function cancelarAnimaciones(entrada) {
    (entrada._animacionesFiltro || []).forEach(function (animacion) { animacion.cancel(); });
    entrada._animacionesFiltro = [];
  }

  function animar(entrada, fotogramas, ms) {
    var animacion = entrada.animate(fotogramas, { duration: ms, easing: 'ease' });
    entrada._animacionesFiltro.push(animacion);
    return animacion.finished;
  }

  // La línea se corta en el último proyecto visible (según el estado final)
  function marcarUltimaVisible(entradas, visibles) {
    var ultima = null;
    entradas.forEach(function (entrada, i) { if (visibles[i]) ultima = entrada; });
    entradas.forEach(function (entrada) {
      entrada.classList.toggle('linea-tiempo-entrada--ultima-visible', entrada === ultima);
    });
  }

  function ocultar(entrada, gen) {
    var alto = entrada.offsetHeight;
    var relleno = getComputedStyle(entrada).paddingBottom;
    animar(entrada, [{ opacity: 1 }, { opacity: 0 }], duracion('--duracion-fundido'))
      .then(function () {
        if (gen !== generacion) return;
        return animar(entrada, [
          { opacity: 0, overflow: 'hidden', boxSizing: 'border-box', height: alto + 'px', paddingBottom: relleno },
          { opacity: 0, overflow: 'hidden', boxSizing: 'border-box', height: '0px', paddingBottom: '0px' }
        ], duracion('--duracion-expansion'));
      })
      .then(function () {
        if (gen !== generacion) return;
        entrada.hidden = true;
        cancelarAnimaciones(entrada);
      })
      .catch(function () { /* cancelada por un filtro posterior */ });
  }

  function mostrar(entrada, gen) {
    entrada.hidden = false;
    var alto = entrada.offsetHeight;
    var relleno = getComputedStyle(entrada).paddingBottom;
    animar(entrada, [
      { opacity: 0, overflow: 'hidden', boxSizing: 'border-box', height: '0px', paddingBottom: '0px' },
      { opacity: 0, overflow: 'hidden', boxSizing: 'border-box', height: alto + 'px', paddingBottom: relleno }
    ], duracion('--duracion-expansion'))
      .then(function () {
        if (gen !== generacion) return;
        return animar(entrada, [{ opacity: 0 }, { opacity: 1 }], duracion('--duracion-fundido'));
      })
      .then(function () {
        if (gen !== generacion) return;
        cancelarAnimaciones(entrada);
      })
      .catch(function () { /* cancelada por un filtro posterior */ });
  }

  function aplicar(filtro, opciones) {
    var seccion = document.getElementById('proyectos');
    if (!seccion) return;
    filtro = filtro || 'todos';
    generacion++;
    var gen = generacion;

    Array.prototype.forEach.call(seccion.querySelectorAll('.filtro-proyecto'), function (boton) {
      boton.setAttribute('aria-pressed', String(boton.getAttribute('data-filtro') === filtro));
    });

    var entradas = Array.prototype.slice.call(seccion.querySelectorAll('.linea-tiempo--proyectos > .linea-tiempo-entrada'));
    var visibles = entradas.map(function (entrada) {
      return filtro === 'todos' || entrada.getAttribute('data-categoria') === filtro;
    });
    var instantaneo = (opciones && opciones.instantaneo) || movimientoReducido.matches ||
      document.body.classList.contains('sin-transiciones') || typeof Element.prototype.animate !== 'function';

    // Antes de medir alturas, para que el relleno inferior medido sea el definitivo
    marcarUltimaVisible(entradas, visibles);

    // Se cancela cualquier fase pendiente; cada entrada parte de su estado actual
    entradas.forEach(function (entrada, i) {
      cancelarAnimaciones(entrada);
      if (instantaneo) {
        entrada.hidden = !visibles[i];
      } else if (visibles[i] && entrada.hidden) {
        mostrar(entrada, gen);
      } else if (!visibles[i] && !entrada.hidden) {
        ocultar(entrada, gen);
      }
    });
  }

  document.addEventListener('click', function (evento) {
    var boton = evento.target.closest('.filtro-proyecto');
    if (!boton) return;
    aplicar(boton.getAttribute('data-filtro'));
  });

  document.addEventListener('contenido:listo', function () {
    aplicar('todos', { instantaneo: true });
  });

  return aplicar;
})();

// Filtro activo: el valor del botón con aria-pressed="true" ('todos' si no hay filtros)
function filtroProyectosActivo() {
  var activo = document.querySelector('#proyectos .filtro-proyecto[aria-pressed="true"]');
  return activo ? activo.getAttribute('data-filtro') : 'todos';
}

// Enlaces "Ver proyecto" de Méritos: abrir Proyectos y la entrada, centrarla y resaltarla
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

  function irAProyecto(entrada) {
    var espera = false;
    var seccion = entrada.closest('.seccion');
    if (seccion && !seccion.classList.contains('seccion--abierta')) {
      aplicarEstadoSeccion(seccion, true);
      espera = true;
    }
    if (!entrada.classList.contains('linea-tiempo-entrada--abierta')) {
      aplicarEstadoEntrada(entrada, true);
      espera = true;
    }

    var boton = entrada.querySelector('.linea-tiempo-alternar');
    if (boton) boton.focus({ preventScroll: true });

    // Sección y entrada crecen a la vez (sin retardo al abrir): basta una duración
    var retardo = espera && !sinAnimaciones() ? duracionExpansion() + MARGEN_ESPERA : 0;
    setTimeout(function () {
      var destino = calcularDestino(entrada);
      var hayDesplazamiento = Math.abs(destino - window.scrollY) > 1;
      var suave = !movimientoReducido.matches;
      window.scrollTo({ top: destino, behavior: suave ? 'smooth' : 'auto' });
      resaltarTrasDesplazamiento(entrada, hayDesplazamiento && suave);
    }, retardo);
  }

  function entradaProyecto(id) {
    var entrada = id ? document.getElementById(id) : null;
    if (!entrada || !entrada.classList.contains('linea-tiempo-entrada')) return null;
    if (!entrada.closest('#proyectos')) return null;
    return entrada;
  }

  // Abre, centra y resalta un proyecto; opcionalmente añade una entrada al historial
  function navegarAProyecto(id, opciones) {
    var entrada = entradaProyecto(id);
    if (!entrada) return false;
    // Si el filtro activo oculta (u oculta ya) el destino, volver a "Todos" sin
    // transición: el layout queda definitivo antes de calcular el centrado
    var filtro = filtroProyectosActivo();
    if (entrada.hidden || (filtro !== 'todos' && entrada.getAttribute('data-categoria') !== filtro)) {
      aplicarFiltroProyectos('todos', { instantaneo: true });
    }
    if (opciones && opciones.registrarHistorial && history.pushState) {
      history.pushState({ tipo: 'proyecto', id: id }, '', '#' + id);
    }
    if (!entrada.dataset.resaltadoListo) {
      entrada.addEventListener('animationend', alTerminarResaltado);
      entrada.dataset.resaltadoListo = '1';
    }
    irAProyecto(entrada);
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

  // Volver al mérito de origen: centra su entrada (o el enlace si no cabe);
  // si el enlace no está visible, usa la posición guardada
  function volverAOrigen(estado) {
    var enlace = localizarEnlace(estado.proyecto, estado.indice);
    var suave = !movimientoReducido.matches;
    var destino = estado.scroll;
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
    if (!entradaProyecto(proyecto)) return;
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

// Visor de imágenes: un clic en una miniatura de Proyectos la abre en grande
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

  // Delegación: un solo listener para todas las miniaturas
  document.addEventListener('click', function (evento) {
    var miniatura = evento.target.closest('.proyecto-miniatura');
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
