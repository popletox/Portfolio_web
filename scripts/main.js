// Debe coincidir con la media query del panel inferior en estilos/comun.css
var DISPOSICION_VERTICAL = '(max-width: 768px), (max-aspect-ratio: 3/4)';

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

  function calcularDestino(entrada) {
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
