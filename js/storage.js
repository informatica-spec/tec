/* ============================================================
   CONTROL FOOD — storage.js
   Wrapper de persistencia usando LocalStorage.
   Guarda y recupera: progreso del jugador, configuración y logros.
   Depende de: config.js (CONFIG.STORAGE_KEYS)
   ============================================================ */

const Storage = {

  /* ---------- Valores por defecto ---------- */
  PROGRESO_DEFAULT: {
    rangoId: "junior",
    xp: 0,
    vidas: CONFIG.VIDAS_INICIALES,
    puntaje: 0,
    nivelesCompletados: [],   // ids de niveles superados, ej: [1, 2]
    nivelActual: 1,
  },

  CONFIGURACION_DEFAULT: {
    sonido: true,
    temaOscuro: true,
    dificultad: 2,
  },

  LOGROS_DEFAULT: {
    // idLogro: true/false (desbloqueado)
  },

  /* ---------- Utilidades internas ---------- */

  /**
   * Lee una clave de LocalStorage y la parsea como JSON.
   * Si no existe o está corrupta, devuelve el valor por defecto.
   */
  _leer(clave, valorPorDefecto) {
    try {
      const crudo = localStorage.getItem(clave);
      if (crudo === null) return this._clonar(valorPorDefecto);
      return { ...this._clonar(valorPorDefecto), ...JSON.parse(crudo) };
    } catch (error) {
      console.warn(`Storage: no se pudo leer "${clave}", se usa el valor por defecto.`, error);
      return this._clonar(valorPorDefecto);
    }
  },

  /**
   * Guarda un objeto en LocalStorage como JSON.
   * Devuelve true si se guardó correctamente, false si falló
   * (por ejemplo, LocalStorage lleno o deshabilitado).
   */
  _guardar(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (error) {
      console.warn(`Storage: no se pudo guardar "${clave}".`, error);
      return false;
    }
  },

  _clonar(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /* ---------- API pública: PROGRESO ---------- */

  obtenerProgreso() {
    return this._leer(CONFIG.STORAGE_KEYS.PROGRESO, this.PROGRESO_DEFAULT);
  },

  guardarProgreso(progreso) {
    return this._guardar(CONFIG.STORAGE_KEYS.PROGRESO, progreso);
  },

  reiniciarProgreso() {
    return this._guardar(CONFIG.STORAGE_KEYS.PROGRESO, this.PROGRESO_DEFAULT);
  },

  /* ---------- API pública: CONFIGURACIÓN ---------- */

  obtenerConfiguracion() {
    return this._leer(CONFIG.STORAGE_KEYS.CONFIGURACION, this.CONFIGURACION_DEFAULT);
  },

  guardarConfiguracion(configuracion) {
    return this._guardar(CONFIG.STORAGE_KEYS.CONFIGURACION, configuracion);
  },

  /* ---------- API pública: LOGROS ---------- */

  obtenerLogros() {
    return this._leer(CONFIG.STORAGE_KEYS.LOGROS, this.LOGROS_DEFAULT);
  },

  guardarLogros(logros) {
    return this._guardar(CONFIG.STORAGE_KEYS.LOGROS, logros);
  },

  /* ---------- Utilidad general ---------- */

  /**
   * Indica si existe una sesión guardada previamente
   * (usado por el botón "Continuar sesión guardada").
   */
  haySesionGuardada() {
    try {
      return localStorage.getItem(CONFIG.STORAGE_KEYS.PROGRESO) !== null;
    } catch (error) {
      return false;
    }
  },

  /**
   * Borra absolutamente todos los datos del juego.
   * Se usa desde el botón "Reiniciar progreso" en configuración.
   */
  borrarTodo() {
    try {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.PROGRESO);
      localStorage.removeItem(CONFIG.STORAGE_KEYS.CONFIGURACION);
      localStorage.removeItem(CONFIG.STORAGE_KEYS.LOGROS);
      return true;
    } catch (error) {
      console.warn("Storage: no se pudo borrar todo.", error);
      return false;
    }
  },
};
