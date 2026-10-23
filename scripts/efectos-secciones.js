// Efectos de las secciones (apartado 11 de docs/diseno-portfolio.md).
// Base común: cada sección puede registrar su efecto con
// window.EfectosSecciones.registrar(idSeccion, { iniciar, detener }).
// Un efecto corre mientras su sección está abierta Y el interruptor
// "Efectos" (scripts/efectos.js) está encendido:
// - iniciar(seccion): lo arranca. Cada efecto decide dónde y cómo se pinta
//   (decorativo: aria-hidden, sin bloquear clics ni mover el contenido).
// - detener(seccion, inmediato): lo para. inmediato = true al apagar Efectos
//   (limpiar al momento); false al cerrar la sección (puede esperar al cierre).
//   Puede llamarse aunque el efecto no esté corriendo: no debe fallar.
// La apertura y el cierre llegan con 'seccion:cambio' (scripts/main.js).
(function () {
  if (!window.Efectos) return;

  // id de sección -> { efecto, corriendo }
  var registro = {};

  function seccionAbierta(seccion) {
    return seccion.classList.contains('seccion--abierta');
  }

  // Arranca o detiene el efecto de una sección según el estado actual
  function sincronizar(id) {
    var entrada = registro[id];
    var seccion = document.getElementById(id);
    if (!entrada || !seccion) return;
    var encendidos = window.Efectos.activo();
    var debe = encendidos && seccionAbierta(seccion);
    if (debe === entrada.corriendo) return;
    entrada.corriendo = debe;
    if (debe) entrada.efecto.iniciar(seccion);
    else entrada.efecto.detener(seccion, !encendidos);
  }

  // Al apagar Efectos se avisa a todos con inmediato = true, también a los
  // que ya no corren (p. ej. un cierre que aún no ha terminado de limpiar)
  function sincronizarTodas() {
    var encendidos = window.Efectos.activo();
    Object.keys(registro).forEach(function (id) {
      var entrada = registro[id];
      var seccion = document.getElementById(id);
      if (!encendidos && seccion) {
        entrada.corriendo = false;
        entrada.efecto.detener(seccion, true);
        return;
      }
      sincronizar(id);
    });
  }

  // Al registrarse, si ya toca, arranca: así el orden de carga no importa
  function registrar(id, efecto) {
    if (!id || !efecto || typeof efecto.iniciar !== 'function' || typeof efecto.detener !== 'function') return;
    registro[id] = { efecto: efecto, corriendo: false };
    sincronizar(id);
  }

  document.addEventListener('seccion:cambio', function (evento) {
    var seccion = evento.target;
    if (seccion && seccion.id) sincronizar(seccion.id);
  });
  document.addEventListener(window.Efectos.evento, sincronizarTodas);

  window.EfectosSecciones = { registrar: registrar };
})();

// Méritos: confeti cayendo de forma continua por detrás de las cajas,
// recortado al área desplegada de la sección (.seccion-interior). Cada pieza
// es una animación CSS (transform): el envoltorio cae y la pieza se balancea
// y gira. Al terminar cada caída, la pieza cambia de posición y color.
(function () {
  if (!window.EfectosSecciones) return;

  var CLASE_ANFITRION = 'efecto-confeti-anfitrion';
  var NUM_COLORES = 5;
  var VELOCIDAD = 70; // px por segundo (aprox., la duración se ajusta al alto)
  var DURACION_MIN = 4; // segundos
  var DURACION_MAX = 14;
  // Densidad: una pieza por cada ANCHO_POR_PIEZA px de ancho, entre MIN y MAX
  var ANCHO_POR_PIEZA = 22;
  var PIEZAS_MIN = 16;
  var PIEZAS_MAX = 48;
  var FACTOR_MIN = 0.7; // variación de velocidad entre piezas (x duración)
  var FACTOR_MAX = 1.4;

  // Estado del efecto en curso (solo hay una sección de Méritos)
  var capa = null;
  var anfitrion = null;
  var observador = null;
  var temporizador = null;
  var duracionActual = 0;

  function azar(min, max) {
    return min + Math.random() * (max - min);
  }

  function limitar(valor, min, max) {
    return Math.min(max, Math.max(min, valor));
  }

  // Duración de las variables de tiempo de comun.css (p. ej. "250ms")
  function leerMs(variable) {
    var valor = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    var numero = parseFloat(valor);
    if (isNaN(numero)) return 0;
    return /ms$/.test(valor) ? numero : numero * 1000;
  }

  // Posición, tamaño, giro y color nuevos para una pieza
  function sortear(caida) {
    var pieza = caida.firstChild;
    caida.style.left = azar(2, 98).toFixed(2) + '%';
    pieza.className = 'efecto-confeti-pieza efecto-confeti-pieza--color' + (1 + Math.floor(Math.random() * NUM_COLORES)) +
      (Math.random() < 0.25 ? ' efecto-confeti-pieza--redonda' : '');
    pieza.style.setProperty('--giro-confeti', Math.round(azar(180, 540) * (Math.random() < 0.5 ? -1 : 1)) + 'deg');
  }

  // indice/total reparte los retrasos en tramos iguales del ciclo (con algo
  // de azar dentro de cada tramo) para que la lluvia sea continua, sin oleadas
  function crearPieza(indice, total) {
    var caida = document.createElement('span');
    caida.className = 'efecto-confeti-caida';
    var pieza = document.createElement('span');
    caida.appendChild(pieza);
    // Velocidad, balanceo y retraso propios; el retraso positivo hace que
    // todas entren desde arriba y se repartan en el tiempo
    var factor = azar(FACTOR_MIN, FACTOR_MAX);
    caida.style.setProperty('--factor-confeti', factor.toFixed(2));
    caida.style.animationDelay = ((indice + Math.random()) / total * factor * duracionActual).toFixed(2) + 's';
    pieza.style.animationDuration = azar(1.2, 2.4).toFixed(2) + 's';
    pieza.style.animationDelay = (-azar(0, 2.4)).toFixed(2) + 's';
    sortear(caida);
    return caida;
  }

  // Duración de una caída según el alto del contenido (no el visible, que
  // cambia durante la transición de apertura). Solo se toca si cambia
  // bastante, porque cambiarla a mitad de animación hace saltar las piezas
  function ajustarDuracion() {
    if (!capa || !anfitrion) return;
    var duracion = limitar(anfitrion.scrollHeight / VELOCIDAD, DURACION_MIN, DURACION_MAX);
    if (duracionActual && Math.abs(duracion - duracionActual) / duracionActual < 0.15) return;
    duracionActual = duracion;
    capa.style.setProperty('--duracion-caida-confeti', duracion.toFixed(2) + 's');
  }

  function alTerminarCaida(evento) {
    if (evento.animationName !== 'efecto-confeti-caer') return;
    sortear(evento.target);
  }

  function quitar() {
    if (temporizador) {
      clearTimeout(temporizador);
      temporizador = null;
    }
    if (observador) {
      observador.disconnect();
      observador = null;
    }
    if (capa) {
      capa.removeEventListener('animationiteration', alTerminarCaida);
      if (capa.parentNode) capa.parentNode.removeChild(capa);
      capa = null;
    }
    if (anfitrion) {
      anfitrion.classList.remove(CLASE_ANFITRION);
      anfitrion = null;
    }
    duracionActual = 0;
  }

  function iniciar(seccion) {
    // Reabierta antes de terminar el cierre: se conserva el confeti
    if (capa && temporizador) {
      clearTimeout(temporizador);
      temporizador = null;
      return;
    }
    quitar();
    anfitrion = seccion.querySelector('.seccion-interior');
    if (!anfitrion) return;

    capa = document.createElement('div');
    capa.className = 'efecto-confeti';
    capa.setAttribute('aria-hidden', 'true');
    anfitrion.classList.add(CLASE_ANFITRION);
    ajustarDuracion();

    var numero = limitar(Math.round(anfitrion.clientWidth / ANCHO_POR_PIEZA), PIEZAS_MIN, PIEZAS_MAX);
    for (var i = 0; i < numero; i++) capa.appendChild(crearPieza(i, numero));
    capa.addEventListener('animationiteration', alTerminarCaida);
    // Al final: la primera hija conserva su margen superior (comun.css)
    anfitrion.appendChild(capa);

    // El alto cambia al cargar el contenido o al abrir detalles de entradas
    if ('ResizeObserver' in window) {
      observador = new ResizeObserver(ajustarDuracion);
      observador.observe(anfitrion);
      Array.prototype.forEach.call(anfitrion.children, function (hijo) {
        if (hijo !== capa) observador.observe(hijo);
      });
    }
  }

  // Al cerrar la sección el contenido (y con él el confeti) se desvanece:
  // se quita al terminar el cierre. Al apagar Efectos, al momento
  function detener(seccion, inmediato) {
    if (inmediato || !capa) {
      quitar();
      return;
    }
    if (temporizador) clearTimeout(temporizador);
    temporizador = setTimeout(quitar, leerMs('--duracion-fundido') + leerMs('--duracion-expansion') + 50);
  }

  window.EfectosSecciones.registrar('meritos', { iniciar: iniciar, detener: detener });
})();
