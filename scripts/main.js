// Consulta de medios protegida: si window.matchMedia no existe o falla,
// devuelve un sustituto { matches: porDefecto } sin escuchadores (el código que
// los usa ya comprueba addEventListener/addListener antes de llamarlos).
// La usa también scripts/opciones.js, que se carga después
function consultarMedios(consulta, porDefecto) {
  try {
    if (typeof window.matchMedia === 'function') {
      var lista = window.matchMedia(consulta);
      if (lista) return lista;
    }
  } catch (error) {
    // Sin soporte: se usa el valor por defecto
  }
  return { matches: porDefecto };
}

// Debe coincidir con la media query del panel inferior en estilos/comun.css
var DISPOSICION_VERTICAL = '(max-width: 768px), (max-aspect-ratio: 3/4)';

// Cabecera compacta en móvil. Histéresis: se compacta al pasar de
// UMBRAL_COMPACTAR y vuelve al normal solo por debajo de UMBRAL_NORMAL, para
// que el cambio de altura de la cabecera no provoque un bucle de saltos
var CABECERA_ESTRECHA = '(max-width: 768px)'; // igual que la media query de la cabecera
var UMBRAL_COMPACTAR = 48;
var UMBRAL_NORMAL = 8;

(function () {
  var cabecera = document.querySelector('.cabecera');
  if (!cabecera) return;
  var consultaEstrecha = consultarMedios(CABECERA_ESTRECHA, false); // sin soporte: cabecera normal
  var movimientoReducido = consultarMedios('(prefers-reduced-motion: reduce)', true);
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

  function actualizar() {
    pendiente = false;
    if (enTransicion()) return; // se reevalúa al terminar la transición
    var actual = cabecera.classList.contains('cabecera--compacta');
    var nuevo = estadoPara(window.scrollY, actual);
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
})();

// Panel destacado: estado inicial y botón de apertura/cierre
(function () {
  var cuerpo = document.body;
  var boton = document.getElementById('boton-destacado');
  if (!boton) return;

  var consultaVertical = consultarMedios(DISPOSICION_VERTICAL, true); // sin soporte: panel plegado

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
// (sin efecto si no hay carrusel). La usa la ventana de detalle de un
// proyecto para devolver el foco a un enlace del Destacado
var mostrarDiapositivaDestacado = function () {};

// Carrusel del panel Destacado: rotación automática y puntos indicadores.
// Se pausa con el ratón encima o el foco de teclado dentro, con el panel
// cerrado, con la pestaña oculta y con el visor de imágenes abierto. Al
// reanudar se espera un intervalo completo. Con movimiento reducido no rota
(function () {
  var INTERVALO = 10000; // ms entre diapositivas
  var panel = document.getElementById('panel-destacado');
  if (!panel) return;
  var movimientoReducido = consultarMedios('(prefers-reduced-motion: reduce)', true);
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
var aplicarFiltroProyectos = (function () {
  var movimientoReducido = consultarMedios('(prefers-reduced-motion: reduce)', true);
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

  function aplicar(filtro) {
    var seccion = document.getElementById('proyectos');
    if (!seccion || !window.Proyectos) return;
    filtro = filtro || 'todos';
    generacion++;
    var gen = generacion;

    Array.prototype.forEach.call(seccion.querySelectorAll('.filtro-proyecto'), function (boton) {
      boton.setAttribute('aria-pressed', String(boton.getAttribute('data-filtro') === filtro));
    });

    var contenedor = seccion.querySelector('.proyectos-bandas');
    var instantaneo = movimientoReducido.matches ||
      document.body.classList.contains('sin-transiciones') || typeof Element.prototype.animate !== 'function';

    // Se cancela cualquier fase pendiente de un filtro anterior
    cancelarAnimaciones();
    if (contenedor) contenedor.style.overflow = '';
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
        // overflow va en línea y no en los fotogramas: si se anima y la
        // animación se cancela a medias (otro filtro), Chrome deja el
        // contenedor sin recibir clics aunque se vea bien
        contenedor.style.overflow = 'hidden';
        return animar(contenedor, [
          { opacity: 0, height: altoAntes + 'px' },
          { opacity: 0, height: altoDespues + 'px' }
        ], duracion('--duracion-expansion'));
      })
      .then(function () {
        if (gen !== generacion) return;
        contenedor.style.overflow = '';
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

// Visor de imágenes: un clic en la imagen del panel Destacado o en una
// miniatura .proyecto-miniatura (ventana de detalle de un proyecto) la abre
// en grande, por encima de la ventana si está abierta
(function () {
  var visor = document.getElementById('visor-imagen');
  if (!visor || typeof visor.showModal !== 'function') return;
  var contenido = visor.querySelector('.visor-imagen-contenido');
  var botonCerrar = visor.querySelector('.visor-imagen-cerrar');
  var movimientoReducido = consultarMedios('(prefers-reduced-motion: reduce)', true);
  var CERRANDO = 'visor-imagen--cerrando';
  var MARGEN_CIERRE = 100; // ms extra si no llega animationend
  var miniaturaOrigen = null;
  var esperaCierre = 0;

  function duracionFundido() {
    var valor = getComputedStyle(document.documentElement).getPropertyValue('--duracion-fundido').trim();
    var numero = parseFloat(valor) || 0;
    return /ms$/.test(valor) ? numero : numero * 1000;
  }

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

  // Olvida un cierre animado pendiente (listener y temporizador de respaldo).
  // Si se quedaran puestos tras un cierre por otra vía, cerrarían el visor
  // en cuanto se volviera a abrir
  function cancelarCierre() {
    clearTimeout(esperaCierre);
    visor.removeEventListener('animationend', terminarCierre);
    visor.classList.remove(CERRANDO);
  }

  function abrir(miniatura) {
    cancelarCierre();
    miniaturaOrigen = miniatura;
    contenido.replaceChildren(crearImagen(miniatura));
    document.body.classList.add('visor-abierto');
    if (!visor.open) visor.showModal();
    botonCerrar.focus();
  }

  // Fin del fundido de salida: solo cuenta el animationend del propio dialog
  // (o de su ::backdrop) durante el cierre; sin evento, lo llama el temporizador
  function terminarCierre(evento) {
    if (evento && (evento.target !== visor || !visor.classList.contains(CERRANDO))) return;
    cancelarCierre();
    if (visor.open) visor.close();
  }

  function cerrar() {
    if (!visor.open || visor.classList.contains(CERRANDO)) return;
    if (movimientoReducido.matches) {
      visor.close();
      return;
    }
    visor.classList.add(CERRANDO);
    visor.addEventListener('animationend', terminarCierre);
    // Respaldo: el visor se cierra aunque no llegue animationend
    esperaCierre = setTimeout(terminarCierre, duracionFundido() + MARGEN_CIERRE);
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

  // También cuando el navegador lo cierra sin pasar por cerrar() (p. ej. un
  // segundo Esc seguido, que ya no se puede cancelar)
  visor.addEventListener('close', function () {
    if (visor.open) return; // reabierto antes de llegar el evento
    cancelarCierre();
    document.body.classList.remove('visor-abierto');
    contenido.replaceChildren();
    if (miniaturaOrigen) miniaturaOrigen.focus();
    miniaturaOrigen = null;
  });
})();

// Ventana de detalle de un proyecto (<dialog id="detalle-proyecto">): se abre
// al pulsar una tarjeta de Proyectos, un enlace "#<id>" de un proyecto
// (Referencias, Destacado, la propia ventana) o con
// window.Proyectos.abrirDetalle(id). Se cierra con ✕, Esc, clic fuera o el
// botón Atrás; el foco vuelve al elemento que la abrió y la página no se mueve.
// La URL refleja el proyecto abierto ("#<id>"):
// - Abrir: pushState con "#<id>" y estado { tipo: 'detalle', id, clave }
//   (entrada propia). Cambiar de proyecto con la ventana abierta: replaceState.
// - Cerrar con ✕/Esc/fuera una entrada propia: history.back(); es ese popstate
//   el que cierra la ventana, así no quedan entradas sobrantes.
// - Entrada no propia (enlace directo, recarga, "#<id>" escrito en la barra):
//   se abre la ventana sin tocar el historial y cerrar quita el hash con
//   replaceState (history.back() sacaría al usuario de la web).
// - popstate/hashchange: URL con "#<id>" de un proyecto, abrir; sin él, cerrar.
//   El resto de hashes se comportan como siempre
// Botón compartir: en pantallas táctiles con navigator.share abre el menú de
// compartir del sistema; si no (ordenador), copia el enlace directo y lo avisa
// con un bocadillo que se quita al cerrar la ventana o cambiar de proyecto
(function () {
  var dialogo = document.getElementById('detalle-proyecto');
  if (!dialogo || typeof dialogo.showModal !== 'function' || !window.Proyectos) return;
  var caja = dialogo.querySelector('.detalle-proyecto-caja');
  var botonCerrar = dialogo.querySelector('.detalle-proyecto-cerrar');
  var botonCompartir = dialogo.querySelector('.detalle-proyecto-compartir');
  var aviso = dialogo.querySelector('.aviso-compartir');
  var tactil = consultarMedios('(pointer: coarse)', false); // sin soporte: copiar enlace
  var movimientoReducido = consultarMedios('(prefers-reduced-motion: reduce)', true);
  var historialDisponible = !!(history.pushState && history.replaceState);
  var CERRANDO = 'detalle-proyecto--cerrando';
  var ESPERA_HISTORIAL = 500; // ms máximos hasta el popstate de history.back()
  var MARGEN_CIERRE = 100; // ms extra si no llega animationend
  var AVISO_VISIBLE = 'aviso-compartir--visible';
  var AVISO_ABAJO = 'aviso-compartir--abajo';

  var origen = null; // recibe el foco al cerrar
  var idAbierto = null; // proyecto que muestra la ventana
  var clave = null; // identifica la entrada de historial propia de la ventana abierta
  var volviendo = false; // se ha pedido history.back() para cerrar
  var pendiente = null; // { id, opciones }: apertura pedida mientras volviendo
  var esperaVuelta = 0;
  var esperaCierre = 0;
  var pulsacionFuera = false;
  var esperaAviso = 0; // fin del tiempo visible del aviso de compartir
  var esperaLimpiarAviso = 0; // fin del fundido del aviso

  // Atrás/Adelante no deben mover la página
  if (historialDisponible && 'scrollRestoration' in history) history.scrollRestoration = 'manual';

  function duracion(variable) {
    var valor = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    var numero = parseFloat(valor) || 0;
    return /ms$/.test(valor) ? numero : numero * 1000;
  }

  function duracionFundido() {
    return duracion('--duracion-fundido');
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

  // Id del proyecto de un hash ("#mi-juego"); null si no es un proyecto existente
  function idDeHash(hash) {
    var texto = typeof hash === 'string' ? hash.replace(/^#/, '') : '';
    if (!texto) return null;
    try {
      texto = decodeURIComponent(texto);
    } catch (error) {
      return null;
    }
    return window.Proyectos.tarjeta(texto) ? texto : null;
  }

  function hashDe(id) {
    return '#' + encodeURIComponent(id);
  }

  // Quita de la URL el hash del proyecto sin añadir entradas
  function quitarHash() {
    if (!historialDisponible || !idDeHash(location.hash)) return;
    history.replaceState(null, '', location.pathname + location.search);
  }

  // Olvida un cierre animado pendiente (listener y temporizador de respaldo).
  // Si se quedaran puestos tras un cierre por otra vía, cerrarían la ventana
  // en cuanto se volviera a abrir
  function cancelarCierre() {
    clearTimeout(esperaCierre);
    dialogo.removeEventListener('animationend', terminarCierre);
    dialogo.classList.remove(CERRANDO);
  }

  // Fin del fundido de salida: solo cuenta el animationend del propio dialog
  // (o de su ::backdrop) durante el cierre; sin evento, lo llama el temporizador
  function terminarCierre(evento) {
    if (evento && (evento.target !== dialogo || !cerrando())) return;
    cancelarCierre();
    if (dialogo.open) dialogo.close();
  }

  // Aviso de compartir: quitarlo al instante (sin fundido ni temporizadores)
  function quitarAviso() {
    if (!aviso) return;
    clearTimeout(esperaAviso);
    clearTimeout(esperaLimpiarAviso);
    aviso.style.transition = 'none';
    aviso.classList.remove(AVISO_VISIBLE, AVISO_ABAJO);
    aviso.textContent = '';
    void aviso.offsetWidth; // aplica el cambio antes de restaurar la transición
    aviso.style.transition = '';
  }

  // Muestra el aviso encima del botón (debajo si no cabe en la pantalla) y
  // lo desvanece pasado --duracion-aviso-compartir. Otra pulsación reinicia
  // el temporizador
  function mostrarAviso(texto) {
    if (!aviso) return;
    clearTimeout(esperaAviso);
    clearTimeout(esperaLimpiarAviso);
    aviso.textContent = texto;
    aviso.classList.remove(AVISO_ABAJO);
    if (aviso.getBoundingClientRect().top < 0) aviso.classList.add(AVISO_ABAJO);
    aviso.classList.add(AVISO_VISIBLE);
    esperaAviso = setTimeout(function () {
      aviso.classList.remove(AVISO_VISIBLE);
      esperaLimpiarAviso = setTimeout(function () {
        aviso.textContent = '';
        aviso.classList.remove(AVISO_ABAJO);
      }, duracionFundido() + MARGEN_CIERRE);
    }, duracion('--duracion-aviso-compartir'));
  }

  // Copia con un textarea temporal (dentro del dialog: fuera está inerte) y
  // devuelve el foco a donde estaba
  function copiarRespaldo(texto) {
    var activo = document.activeElement;
    var area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.setAttribute('aria-hidden', 'true');
    area.style.position = 'fixed';
    area.style.top = '0';
    area.style.left = '0';
    area.style.opacity = '0';
    dialogo.appendChild(area);
    area.select();
    var copiado = false;
    try {
      copiado = document.execCommand('copy');
    } catch (error) {
      copiado = false;
    }
    dialogo.removeChild(area);
    if (activo && typeof activo.focus === 'function') activo.focus({ preventScroll: true });
    return copiado;
  }

  // Promesa con true si se ha copiado el texto
  function copiar(texto) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      return navigator.clipboard.writeText(texto).then(
        function () { return true; },
        function () { return copiarRespaldo(texto); }
      );
    }
    return Promise.resolve(copiarRespaldo(texto));
  }

  function copiarYAvisar(url, id) {
    copiar(url).then(function (copiado) {
      // La ventana se ha cerrado o ha cambiado de proyecto entretanto
      if (!abierta() || idAbierto !== id) return;
      mostrarAviso(copiado ? 'Enlace copiado' : 'No se pudo copiar el enlace');
    });
  }

  // Comparte el proyecto abierto en este momento
  function compartir() {
    if (!abierta() || !idAbierto) return;
    var id = idAbierto;
    var url = window.Proyectos.urlDetalle(id);
    if (!url) return;
    var titulo = caja.querySelector('#detalle-proyecto-titulo');
    var datos = { title: titulo ? titulo.textContent.trim() : document.title, url: url };
    var menuSistema = typeof navigator.share === 'function' && tactil.matches &&
      (typeof navigator.canShare !== 'function' || navigator.canShare(datos));
    if (!menuSistema) {
      copiarYAvisar(url, id);
      return;
    }
    navigator.share(datos).catch(function (error) {
      if (error && error.name === 'AbortError') return; // cancelado por el usuario
      copiarYAvisar(url, id);
    });
  }

  // Cierra la ventana (con fundido) sin tocar el historial
  function ocultar() {
    quitarAviso();
    idAbierto = null;
    if (!dialogo.open || cerrando()) return;
    if (movimientoReducido.matches) {
      dialogo.close();
      return;
    }
    dialogo.classList.add(CERRANDO);
    dialogo.addEventListener('animationend', terminarCierre);
    clearTimeout(esperaCierre);
    esperaCierre = setTimeout(terminarCierre, duracionFundido() + MARGEN_CIERRE);
  }

  // Fin de la espera de history.back() (llegue el popstate o no): cierra la
  // ventana y, si entretanto se pidió abrir un proyecto, lo abre ahora
  function terminarVuelta() {
    volviendo = false;
    clearTimeout(esperaVuelta);
    clave = null;
    ocultar();
    var siguiente = pendiente;
    pendiente = null;
    if (siguiente) abrir(siguiente.id, siguiente.opciones);
  }

  // Quita la entrada propia del historial; el popstate cierra la ventana.
  // Si no llegara, se cierra igualmente pasado un momento
  function volverAtras() {
    volviendo = true;
    history.back();
    clearTimeout(esperaVuelta);
    esperaVuelta = setTimeout(function () {
      if (volviendo) terminarVuelta();
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
    quitarHash();
    ocultar();
  }

  // opciones.origen: elemento que recupera el foco al cerrar (por defecto,
  // el que lo tiene al abrir). opciones.sincronizar (interno): la URL ya es
  // la del proyecto (Atrás/Adelante, enlace directo, barra de direcciones) y
  // no se toca el historial. Con la ventana ya abierta, cambia su contenido
  // y sustituye la entrada en lugar de añadir otra
  function abrir(id, opciones) {
    opciones = opciones || {};
    if (volviendo) {
      // Pendiente de que history.back() quite la entrada anterior: se abre
      // al terminar esa espera (terminarVuelta), en lugar de perder el clic
      if (!window.Proyectos.tarjeta(id)) return false;
      // (con la ventana aún abierta, el foco volverá al origen que ya tenía)
      pendiente = { id: id, opciones: { origen: opciones.origen || (dialogo.open ? origen : document.activeElement) } };
      return true;
    }
    var cuerpo = window.Proyectos.detalle(id);
    if (!cuerpo) return false;
    if (cerrando()) terminarCierre();
    var yaAbierta = dialogo.open;
    quitarAviso();

    caja.replaceChildren(cuerpo);
    if (!yaAbierta) {
      origen = opciones.origen || document.activeElement;
      document.body.classList.add('detalle-abierto');
      dialogo.showModal();
      botonCerrar.focus();
    }
    caja.scrollTop = 0;
    idAbierto = id;

    if (!historialDisponible) {
      clave = null;
    } else if (opciones.sincronizar) {
      // Entrada creada por un pushState propio (p. ej. al volver con
      // Adelante) o ajena (enlace directo, barra de direcciones)
      var estado = history.state;
      clave = estado && estado.tipo === 'detalle' && estado.clave ? estado.clave : null;
    } else if (yaAbierta) {
      history.replaceState(clave ? { tipo: 'detalle', id: id, clave: clave } : history.state, '', hashDe(id));
    } else {
      clave = String(Date.now()) + '-' + Math.random().toString(36).slice(2);
      history.pushState({ tipo: 'detalle', id: id, clave: clave }, '', hashDe(id));
    }
    return true;
  }

  // Ajusta la ventana a la URL actual (popstate, hashchange y contenido listo).
  // Un mismo cambio puede llegar por popstate y por hashchange: idempotente
  function sincronizar() {
    if (volviendo) {
      // Llega el popstate del history.back() de cerrar()
      terminarVuelta();
      return;
    }
    var id = idDeHash(location.hash);
    if (id) {
      if (!abierta() || id !== idAbierto) abrir(id, { sincronizar: true });
    } else if (abierta()) {
      clave = null;
      ocultar();
    }
  }

  // Para el resto de la web: abre la ventana de un proyecto por id (true si
  // existe). opciones.origen: elemento al que vuelve el foco al cerrar
  window.Proyectos.abrirDetalle = function (id, opciones) {
    return abrir(id, { origen: opciones && opciones.origen });
  };

  // URL absoluta del proyecto (enlace directo a su ventana); null si no existe
  window.Proyectos.urlDetalle = function (id) {
    return window.Proyectos.tarjeta(id) ? location.origin + location.pathname + hashDe(id) : null;
  };

  // Tarjetas de Proyectos (botones): clic, Enter o Espacio
  document.addEventListener('click', function (evento) {
    var tarjeta = evento.target.closest('button.proyecto-tarjeta[data-proyecto]');
    if (!tarjeta) return;
    abrir(tarjeta.getAttribute('data-proyecto'), { origen: tarjeta });
  });

  // Enlaces "#<id>" de un proyecto en cualquier parte de la página (también
  // dentro de la ventana, donde cambian el proyecto mostrado). Con teclas
  // modificadoras o botón central actúa el navegador (pestaña nueva...).
  // Dentro de la ventana, los "#..." que no son proyectos no hacen nada
  document.addEventListener('click', function (evento) {
    if (evento.defaultPrevented || evento.button !== 0 ||
      evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.altKey) return;
    var enlace = evento.target.closest('a[href^="#"]');
    if (!enlace) return;
    var dentro = caja.contains(enlace);
    var id = idDeHash(enlace.getAttribute('href'));
    if (!id) {
      if (dentro) evento.preventDefault();
      return;
    }
    evento.preventDefault();
    abrir(id, dentro ? {} : { origen: enlace });
  });

  botonCerrar.addEventListener('click', cerrar);
  if (botonCompartir) botonCompartir.addEventListener('click', compartir);

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

  dialogo.addEventListener('close', function () {
    if (dialogo.open) return; // reabierta antes de llegar el evento
    // Cerrada por el navegador a mitad del fundido (p. ej. un segundo Esc
    // seguido, que ya no se puede cancelar): sin esto, el temporizador o el
    // listener pendientes cerrarían la siguiente ventana que se abriera
    cancelarCierre();
    document.body.classList.remove('detalle-abierto');
    caja.replaceChildren();
    quitarAviso();
    idAbierto = null;
    // Cerrada sin pasar por cerrar() (p. ej. un Esc que el navegador no deja
    // cancelar): se quita igualmente la entrada del historial o el hash
    if (!volviendo && historialDisponible) {
      if (esEntradaPropia(history.state)) volverAtras();
      else quitarHash();
    }
    clave = null;
    var destino = origen;
    origen = null;
    if (destino && destino.isConnected && typeof destino.focus === 'function') {
      // Enlace del Destacado: si el carrusel ha rotado, vuelve a su diapositiva
      mostrarDiapositivaDestacado(destino);
      destino.focus({ preventScroll: true });
    }
  });

  window.addEventListener('popstate', sincronizar);
  window.addEventListener('hashchange', sincronizar);
  // Enlace directo o recarga con "#<id>": abrir cuando el contenido existe
  document.addEventListener('contenido:listo', sincronizar);

  // Recarga con la ventana abierta: la entrada ya no es propia de esta visita
  // (se conserva el hash para volver a abrirla)
  if (historialDisponible && history.state && history.state.tipo === 'detalle') {
    history.replaceState(null, '', location.href);
  }
})();
