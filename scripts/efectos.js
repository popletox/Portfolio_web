// Efectos: estado del interruptor "Efectos" de Opciones (apartado 11 de
// docs/diseno-portfolio.md). Se carga en el <head> sin defer para poner
// data-efectos="on" | "off" en <html> antes del primer pintado. Es
// independiente del tema, por eso va aparte de scripts/temas.js.
// De momento no activa nada: solo guarda y expone el estado.
(function () {
  var CLAVE_ALMACEN = 'efectos';
  var POR_DEFECTO = false; // desactivados
  // Evento que se lanza en document al cambiar el estado. detail.activo = boolean
  var EVENTO_CAMBIO = 'efectoscambio';

  // localStorage puede fallar (modo privado, almacenamiento bloqueado)
  function leerGuardado() {
    try {
      return window.localStorage.getItem(CLAVE_ALMACEN);
    } catch (error) {
      return null;
    }
  }

  function guardar(activo) {
    try {
      window.localStorage.setItem(CLAVE_ALMACEN, activo ? 'on' : 'off');
    } catch (error) {
      // Sin almacenamiento: el estado se mantiene solo en esta visita
    }
  }

  function poner(activo) {
    document.documentElement.dataset.efectos = activo ? 'on' : 'off';
  }

  function activo() {
    return document.documentElement.dataset.efectos === 'on';
  }

  // Estado inicial: guardado válido > por defecto
  var guardado = leerGuardado();
  poner(guardado === 'on' || guardado === 'off' ? guardado === 'on' : POR_DEFECTO);

  window.Efectos = {
    evento: EVENTO_CAMBIO,
    activo: activo,
    // Enciende (true) o apaga (false) y guarda la elección. Solo avisa si cambia
    aplicar: function (encender) {
      var nuevo = Boolean(encender);
      var cambia = nuevo !== activo();
      poner(nuevo);
      guardar(nuevo);
      if (!cambia) return;
      try {
        document.dispatchEvent(new CustomEvent(EVENTO_CAMBIO, { detail: { activo: nuevo } }));
      } catch (error) {
        // Sin CustomEvent: el estado ya está aplicado en <html>
      }
    }
  };
})();
