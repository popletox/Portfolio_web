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
