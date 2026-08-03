/* ============================================================
   CONTROL FOOD — audio.js
   Wrapper de efectos de sonido.
   Preparado para funcionar aunque los archivos de audio todavía
   no existan: si un archivo falta o no puede reproducirse, el
   error se silencia y el juego sigue funcionando con normalidad.
   Depende de: config.js (indirectamente, para nada estricto)
   ============================================================ */

const AudioManager = {

  /* Mapa de efectos disponibles -> ruta del archivo.
     Los archivos reales se agregan más adelante en /audio;
     mientras tanto pueden no existir sin que rompa el juego. */
  EFECTOS: {
    click: "audio/click.mp3",
    acierto: "audio/acierto.mp3",
    error: "audio/error.mp3",
    alarma: "audio/alarma.mp3",
    ascenso: "audio/ascenso.mp3",
    logro: "audio/logro.mp3",
    nivelSuperado: "audio/nivel-superado.mp3",
  },

  _cache: {},
  _habilitado: true,

  /**
   * Precarga (crea) los elementos <audio> en memoria.
   * Se llama una sola vez al iniciar la app.
   */
  inicializar() {
    Object.entries(this.EFECTOS).forEach(([id, ruta]) => {
      const elemento = new Audio();
      elemento.src = ruta;
      elemento.preload = "auto";
      elemento.volume = 0.6;
      // Si el archivo no existe todavía, no debe generar errores
      // visibles en la experiencia de juego.
      elemento.addEventListener("error", () => {
        console.info(`AudioManager: "${ruta}" no disponible todavía (esto no afecta el juego).`);
      });
      this._cache[id] = elemento;
    });
  },

  /**
   * Activa o desactiva el sonido globalmente.
   */
  setHabilitado(valor) {
    this._habilitado = Boolean(valor);
  },

  estaHabilitado() {
    return this._habilitado;
  },

  /**
   * Reproduce un efecto por su id. No lanza excepciones si falla.
   */
  reproducir(idEfecto) {
    if (!this._habilitado) return;
    const elemento = this._cache[idEfecto];
    if (!elemento) {
      console.warn(`AudioManager: efecto "${idEfecto}" no está registrado.`);
      return;
    }
    try {
      elemento.currentTime = 0;
      const promesa = elemento.play();
      if (promesa && typeof promesa.catch === "function") {
        promesa.catch(() => {
          // Reproducción bloqueada por el navegador (autoplay policy)
          // o archivo inexistente todavía: se ignora silenciosamente.
        });
      }
    } catch (error) {
      // No debe interrumpir el flujo del juego.
    }
  },

  /* Atajos semánticos usados por el resto de los módulos */
  click() { this.reproducir("click"); },
  acierto() { this.reproducir("acierto"); },
  error() { this.reproducir("error"); },
  alarma() { this.reproducir("alarma"); },
  ascenso() { this.reproducir("ascenso"); },
  logro() { this.reproducir("logro"); },
  nivelSuperado() { this.reproducir("nivelSuperado"); },
};
