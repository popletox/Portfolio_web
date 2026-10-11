// Panel destacado: estado inicial y botón de apertura/cierre
(function () {
  var cuerpo = document.body;
  var boton = document.getElementById('boton-destacado');
  if (!boton) return;

  var esEstrecha = window.matchMedia('(max-width: 768px)').matches;

  function aplicarEstado(abierto) {
    cuerpo.classList.toggle('panel-abierto', abierto);
    boton.setAttribute('aria-expanded', String(abierto));
    boton.setAttribute('aria-label', abierto ? 'Cerrar panel destacado' : 'Abrir panel destacado');
  }

  aplicarEstado(!esEstrecha);

  boton.addEventListener('click', function () {
    aplicarEstado(!cuerpo.classList.contains('panel-abierto'));
  });

  // Activar transiciones solo después del primer pintado
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      cuerpo.classList.remove('sin-transiciones');
    });
  });
})();
