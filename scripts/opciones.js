// Opciones: el engranaje de la cabecera abre un bocadillo con el selector de
// tema. Los botones se generan desde window.Temas.lista (scripts/temas.js).
// Aquí irá también el interruptor de "Efectos divertidos" (apartado 11 de
// docs/diseno-portfolio.md), todavía sin implementar.
(function () {
  var boton = document.querySelector('.boton-opciones');
  var menu = document.getElementById('menu-opciones');
  var grupo = menu && menu.querySelector('.menu-opciones-grupo');
  if (!boton || !menu || !grupo || !window.Temas) return;

  var raiz = document.documentElement;
  var movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  var metaColor = document.querySelector('meta[name="theme-color"]');
  var MARGEN_TRANSICION = 50; // ms extra por si no llega transitionend
  var temporizadorCierre = 0;
  var temporizadorTema = 0;

  // Iconos provisionales (trazo con currentColor), 24x24
  var SVG = 'http://www.w3.org/2000/svg';
  var ICONOS = {
    sol: [
      ['circle', { cx: 12, cy: 12, r: 4 }],
      ['path', { d: 'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41' }]
    ],
    luna: [
      ['path', { d: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z' }]
    ],
    terminal: [
      ['rect', { x: 2, y: 4, width: 20, height: 16, rx: 2 }],
      ['path', { d: 'M6 9l3 3-3 3M12 15h5' }]
    ],
    // Bocadillo de cómic: globo ovalado con pico abajo a la izquierda
    comic: [
      ['path', { d: 'M7.5 17.2C4.8 16 3 13.8 3 11.2 3 7.2 7 4 12 4s9 3.2 9 7.2-4 7.2-9 7.2c-.9 0-1.8-.1-2.6-.3L5 20.5z' }]
    ]
  };

  function crearIcono(nombre) {
    var svg = document.createElementNS(SVG, 'svg');
    var atributos = {
      viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2,
      'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false'
    };
    Object.keys(atributos).forEach(function (clave) { svg.setAttribute(clave, atributos[clave]); });
    (ICONOS[nombre] || []).forEach(function (forma) {
      var nodo = document.createElementNS(SVG, forma[0]);
      Object.keys(forma[1]).forEach(function (clave) { nodo.setAttribute(clave, forma[1][clave]); });
      svg.appendChild(nodo);
    });
    return svg;
  }

  function duracion(variable) {
    var valor = getComputedStyle(raiz).getPropertyValue(variable).trim();
    var numero = parseFloat(valor) || 0;
    return /ms$/.test(valor) ? numero : numero * 1000;
  }

  function sinAnimaciones() {
    return movimientoReducido.matches || document.body.classList.contains('sin-transiciones');
  }

  // Botones de tema
  window.Temas.lista.forEach(function (tema) {
    var opcion = document.createElement('button');
    opcion.type = 'button';
    opcion.className = 'opcion-tema';
    opcion.setAttribute('data-tema', tema.id);
    opcion.appendChild(crearIcono(tema.icono));
    var texto = document.createElement('span');
    texto.textContent = tema.nombre;
    opcion.appendChild(texto);
    grupo.appendChild(opcion);
  });
  var opciones = Array.prototype.slice.call(grupo.querySelectorAll('.opcion-tema'));

  function marcarActivo() {
    var actual = window.Temas.actual();
    opciones.forEach(function (opcion) {
      opcion.setAttribute('aria-pressed', String(opcion.getAttribute('data-tema') === actual));
    });
  }

  // Color de la barra del navegador en móvil: el --color-fondo del tema
  function actualizarColorNavegador() {
    if (!metaColor) return;
    var fondo = getComputedStyle(raiz).getPropertyValue('--color-fondo').trim();
    if (fondo) metaColor.setAttribute('content', fondo);
  }

  // Abrir y cerrar el bocadillo
  function estaAbierto() {
    return boton.getAttribute('aria-expanded') === 'true';
  }

  function terminarCierre() {
    clearTimeout(temporizadorCierre);
    menu.removeEventListener('transitionend', alTerminarTransicion);
    if (!estaAbierto()) menu.hidden = true;
  }

  function alTerminarTransicion(evento) {
    if (evento.target === menu && evento.propertyName === 'opacity') terminarCierre();
  }

  function abrir() {
    clearTimeout(temporizadorCierre);
    menu.removeEventListener('transitionend', alTerminarTransicion);
    marcarActivo();
    menu.hidden = false;
    void menu.offsetWidth; // aplica el estado inicial antes de animar
    menu.classList.add('menu-opciones--abierto');
    boton.setAttribute('aria-expanded', 'true');
    var activa = grupo.querySelector('.opcion-tema[aria-pressed="true"]') || opciones[0];
    if (activa) activa.focus({ preventScroll: true });
  }

  function cerrar(devolverFoco) {
    if (!estaAbierto()) return;
    boton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('menu-opciones--abierto');
    if (devolverFoco) boton.focus({ preventScroll: true });
    if (sinAnimaciones()) {
      terminarCierre();
      return;
    }
    menu.addEventListener('transitionend', alTerminarTransicion);
    temporizadorCierre = setTimeout(terminarCierre, duracion('--duracion-fundido') + MARGEN_TRANSICION);
  }

  // Cambio de tema con transición de colores solo durante el cambio
  function elegirTema(id) {
    var animar = !sinAnimaciones();
    if (animar) {
      clearTimeout(temporizadorTema);
      raiz.classList.add('cambiando-tema');
    }
    if (!window.Temas.aplicar(id)) {
      raiz.classList.remove('cambiando-tema');
      return;
    }
    marcarActivo();
    actualizarColorNavegador();
    if (animar) {
      temporizadorTema = setTimeout(function () {
        raiz.classList.remove('cambiando-tema');
      }, duracion('--duracion-fundido') + MARGEN_TRANSICION);
    }
  }

  boton.addEventListener('click', function () {
    if (estaAbierto()) cerrar(false);
    else abrir();
  });

  grupo.addEventListener('click', function (evento) {
    var opcion = evento.target.closest('.opcion-tema');
    if (!opcion) return;
    elegirTema(opcion.getAttribute('data-tema'));
    cerrar(true);
  });

  // Esc: cierra y devuelve el foco al engranaje
  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && estaAbierto()) {
      evento.preventDefault();
      cerrar(true);
    }
  });

  // Clic fuera del bocadillo y del engranaje
  document.addEventListener('click', function (evento) {
    if (!estaAbierto()) return;
    if (menu.contains(evento.target) || boton.contains(evento.target)) return;
    cerrar(false);
  });

  // Si el foco sale con Tab a otro elemento, se cierra. Solo con destino
  // conocido: en algunos navegadores un clic en un botón no le da el foco
  menu.addEventListener('focusout', function (evento) {
    var destino = evento.relatedTarget;
    if (destino && !menu.contains(destino) && destino !== boton) cerrar(false);
  });

  // Flechas arriba y abajo para moverse entre los temas
  grupo.addEventListener('keydown', function (evento) {
    if (evento.key !== 'ArrowDown' && evento.key !== 'ArrowUp') return;
    var indice = opciones.indexOf(document.activeElement);
    if (indice === -1) return;
    evento.preventDefault();
    var paso = evento.key === 'ArrowDown' ? 1 : -1;
    opciones[(indice + paso + opciones.length) % opciones.length].focus();
  });

  marcarActivo();
  actualizarColorNavegador();
})();
