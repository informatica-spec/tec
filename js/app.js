/* ============================================================
   CONTROL FOOD — app.js
   Punto de entrada de la aplicación.

   Orden de inicialización (coincide con el orden de <script> en
   index.html, que ya garantiza que CONFIG, Storage, AudioManager,
   Simulador, Niveles, Preguntas, Game y UI existan antes de este
   archivo):

   1. Aplicar el tema guardado (oscuro/claro) antes de mostrar nada.
   2. Inicializar el sistema de audio (precarga de efectos).
   3. Inicializar el estado del juego (progreso, configuración, logros).
   4. Inicializar la interfaz (cachea el DOM y arranca la pantalla
      de carga, que a su vez lleva a la pantalla de inicio).
   5. Ajustar detalles finales que dependen de datos ya cargados
      (por ejemplo, mostrar/ocultar "continuar sesión guardada").
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  try {
    // 1. Tema visual (se aplica antes de que el usuario vea la app)
    const configuracionGuardada = Storage.obtenerConfiguracion();
    document.body.setAttribute(
      "data-tema",
      configuracionGuardada.temaOscuro ? "oscuro" : "claro"
    );

    // 2. Audio
    AudioManager.inicializar();
    AudioManager.setHabilitado(configuracionGuardada.sonido);

    // 3. Estado del juego
    Game.inicializar();

    // 4. Interfaz
    UI.inicializar();

    // 5. Ajustes que dependen de si ya existe una partida guardada
    const haySesion = Storage.haySesionGuardada();
    if (UI.el.btnIrMenu) {
      UI.el.btnIrMenu.classList.toggle("oculto", !haySesion);
    }

    console.info(`${CONFIG.NOMBRE_APP} v${CONFIG.VERSION} — listo.`);
  } catch (error) {
    // Si algo falla en la inicialización, se informa en consola en
    // vez de dejar la app trabada en la pantalla de carga sin motivo.
    console.error("Error al inicializar CONTROL FOOD:", error);
  }
});
