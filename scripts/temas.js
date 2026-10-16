// Temas: activa el tema inicial antes del primer pintado (se carga en el
// <head> sin defer) y expone window.Temas para el selector de Opciones
// (scripts/opciones.js). Cada tema tiene su CSS en estilos/temas/<id>.css
// (ver docs/temas.md).
(function () {
  // Lista de temas disponibles; el selector de Opciones se genera a partir de
  // ella. icono: 'sol' | 'luna' | 'terminal' | 'comic' (mapa de iconos en opciones.js)
  var TEMAS = [
    { id: 'claro', nombre: 'Claro', icono: 'sol' },
    { id: 'oscuro', nombre: 'Oscuro', icono: 'luna' },
    { id: 'codigo', nombre: 'Código', icono: 'terminal' },
    { id: 'comic', nombre: 'Cómic', icono: 'comic' }
  ];
  var TEMA_POR_DEFECTO = 'claro';
  var TEMA_SISTEMA_OSCURO = 'oscuro';
  var CLAVE_ALMACEN = 'tema';
  // Evento que se lanza en document cuando cambia el tema del sistema y el
  // visitante no ha elegido uno. detail.tema = id. Es cancelable: quien lo
  // cancele (opciones.js) se encarga de aplicarlo; si nadie lo hace, se aplica aquí.
  var EVENTO_SISTEMA = 'temasistema';

  // true si el visitante ha elegido tema en esta visita (por si no se pudo guardar)
  var elegidoEnVisita = false;

  function esValido(id) {
    return TEMAS.some(function (tema) { return tema.id === id; });
  }

  // localStorage puede fallar (modo privado, almacenamiento bloqueado)
  function leerGuardado() {
    try {
      return window.localStorage.getItem(CLAVE_ALMACEN);
    } catch (error) {
      return null;
    }
  }

  function guardar(id) {
    try {
      window.localStorage.setItem(CLAVE_ALMACEN, id);
    } catch (error) {
      // Sin almacenamiento: el tema se aplica solo en esta visita
    }
  }

  function poner(id) {
    document.documentElement.dataset.tema = id;
  }

  // Preferencia del sistema (prefers-color-scheme). null si no hay soporte
  var consultaOscuro = null;
  try {
    if (window.matchMedia) consultaOscuro = window.matchMedia('(prefers-color-scheme: dark)');
  } catch (error) {
    consultaOscuro = null;
  }

  function temaSistema() {
    return consultaOscuro && consultaOscuro.matches ? TEMA_SISTEMA_OSCURO : TEMA_POR_DEFECTO;
  }

  function hayEleccion() {
    return elegidoEnVisita || esValido(leerGuardado());
  }

  // Tema inicial: guardado válido > preferencia del sistema > claro
  var guardado = leerGuardado();
  poner(esValido(guardado) ? guardado : temaSistema());

  // Si el sistema cambia con la página abierta y no hay tema elegido, se sigue
  function alCambiarSistema() {
    if (hayEleccion()) return;
    var id = temaSistema();
    if (id === document.documentElement.dataset.tema) return;
    var evento = null;
    try {
      evento = new CustomEvent(EVENTO_SISTEMA, { detail: { tema: id }, cancelable: true });
    } catch (error) {
      evento = null;
    }
    if (!evento || document.dispatchEvent(evento)) poner(id);
  }

  if (consultaOscuro) {
    try {
      if (consultaOscuro.addEventListener) consultaOscuro.addEventListener('change', alCambiarSistema);
      else if (consultaOscuro.addListener) consultaOscuro.addListener(alCambiarSistema);
    } catch (error) {
      // Sin aviso de cambios: se queda el tema inicial
    }
  }

  window.Temas = {
    lista: TEMAS.slice(),
    evento: EVENTO_SISTEMA,
    actual: function () {
      return document.documentElement.dataset.tema || TEMA_POR_DEFECTO;
    },
    // Cambia el tema. Por defecto lo guarda como elección del visitante; con
    // sinGuardar = true solo lo pinta (para seguir al sistema).
    // Devuelve false si el id no existe.
    aplicar: function (id, sinGuardar) {
      if (!esValido(id)) return false;
      poner(id);
      if (!sinGuardar) {
        elegidoEnVisita = true;
        guardar(id);
      }
      return true;
    }
  };
})();
