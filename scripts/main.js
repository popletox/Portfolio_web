// Panel destacado: estado inicial y botón de apertura/cierre
(function () {
  var cuerpo = document.body;
  var boton = document.getElementById('boton-destacado');
  if (!boton) return;

  // Debe coincidir con la media query del panel inferior en estilos/comun.css
  var DISPOSICION_VERTICAL = '(max-width: 768px), (max-aspect-ratio: 3/4)';
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

  reactivarTransiciones();
})();

// Secciones plegables: cada encabezado abre o cierra su contenido
(function () {
  var botones = document.querySelectorAll('.seccion-alternar');

  Array.prototype.forEach.call(botones, function (boton) {
    var seccion = boton.closest('.seccion');
    var contenido = document.getElementById(boton.getAttribute('aria-controls'));
    if (!seccion || !contenido) return;

    boton.addEventListener('click', function () {
      var abierta = !seccion.classList.contains('seccion--abierta');
      seccion.classList.toggle('seccion--abierta', abierta);
      boton.setAttribute('aria-expanded', String(abierta));
      contenido.inert = !abierta;
    });
  });
})();

// Entradas de línea de tiempo: cada título abre o cierra su detalle
(function () {
  function aplicarEstadoEntrada(entrada, abierta) {
    var boton = entrada.querySelector('.linea-tiempo-alternar');
    if (!boton) return;
    var detalle = document.getElementById(boton.getAttribute('aria-controls'));
    if (!detalle) return;
    entrada.classList.toggle('linea-tiempo-entrada--abierta', abierta);
    boton.setAttribute('aria-expanded', String(abierta));
    detalle.inert = !abierta;
  }

  var botones = document.querySelectorAll('.linea-tiempo-alternar');

  Array.prototype.forEach.call(botones, function (boton) {
    var entrada = boton.closest('.linea-tiempo-entrada');
    if (!entrada) return;

    boton.addEventListener('click', function () {
      aplicarEstadoEntrada(entrada, !entrada.classList.contains('linea-tiempo-entrada--abierta'));
    });
  });

  // La primera entrada de Experiencia empieza desplegada. Se ejecuta de forma
  // síncrona, antes de que el doble requestAnimationFrame quite .sin-transiciones.
  var primera = document.querySelector('#experiencia .linea-tiempo-entrada');
  if (primera) aplicarEstadoEntrada(primera, true);
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
