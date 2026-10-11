// Temas: activa el tema guardado antes del primer pintado (se carga en el
// <head> sin defer) y expone window.Temas para el futuro selector de Opciones.
// Cada tema tiene su CSS en estilos/temas/<id>.css (ver docs/temas.md).
(function () {
  // Lista de temas disponibles; el selector se generará a partir de ella.
  // Pendiente añadir { id: 'oscuro', nombre: 'Oscuro' } y { id: 'codigo', nombre: 'Código' }
  var TEMAS = [
    { id: 'claro', nombre: 'Claro' }
  ];
  var TEMA_POR_DEFECTO = 'claro';
  var CLAVE_ALMACEN = 'tema';

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

  // Tema inicial. Aquí iría la preferencia del sistema (prefers-color-scheme)
  // si se decide seguirla cuando no hay tema guardado.
  var guardado = leerGuardado();
  poner(esValido(guardado) ? guardado : TEMA_POR_DEFECTO);

  window.Temas = {
    lista: TEMAS.slice(),
    actual: function () {
      return document.documentElement.dataset.tema || TEMA_POR_DEFECTO;
    },
    // Cambia el tema y lo guarda. Devuelve false si el id no existe.
    aplicar: function (id) {
      if (!esValido(id)) return false;
      poner(id);
      guardar(id);
      return true;
    }
  };
})();
