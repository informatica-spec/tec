/* ============================================================
   CONTROL FOOD — game.js
   Orquestador general del juego.

   Responsabilidades:
   - Mantener el estado de la partida (vidas, puntaje, XP, rango).
   - Coordinar el inicio/fin de cada nivel.
   - Evaluar respuestas y objetivos del mini PLC.
   - Desbloquear logros.
   - Persistir el progreso a través de storage.js.

   Depende de: config.js, storage.js, niveles.js, preguntas.js,
               simulador.js, audio.js
   No toca el DOM directamente (eso es trabajo de ui.js).
   ============================================================ */

const Game = {

  /* ---------- Catálogo de logros ----------
     condicion recibe (progreso, contexto) y debe devolver boolean.
     contexto se arma en cada llamada a verificarLogros() con datos
     relevantes del momento (ej: nivel recién superado, sin errores). */
  LOGROS: [
    {
      id: "primer_nivel",
      nombre: "Primeros pasos",
      descripcion: "Superá tu primer nivel.",
      icono: "🥉",
      condicion: (progreso) => progreso.nivelesCompletados.length >= 1,
    },
    {
      id: "mitad_camino",
      nombre: "Mitad de camino",
      descripcion: "Superá 3 niveles.",
      icono: "🥈",
      condicion: (progreso) => progreso.nivelesCompletados.length >= 3,
    },
    {
      id: "planta_dominada",
      nombre: "Planta dominada",
      descripcion: "Superá los 5 niveles del simulador.",
      icono: "🥇",
      condicion: (progreso) => progreso.nivelesCompletados.length >= 5,
    },
    {
      id: "sin_errores",
      nombre: "Mano firme",
      descripcion: "Superá un nivel sin cometer ningún error.",
      icono: "🎯",
      condicion: (_progreso, contexto) => contexto?.nivelSinErrores === true,
    },
    {
      id: "rango_supervisor",
      nombre: "Ascenso a Supervisor",
      descripcion: "Alcanzá el rango de Supervisor.",
      icono: "📈",
      condicion: (progreso) =>
        ["supervisor", "jefe", "especialista"].includes(Niveles.obtenerRangoPorXp(progreso.xp).id),
    },
    {
      id: "rango_especialista",
      nombre: "Especialista en Automatización",
      descripcion: "Alcanzá el rango máximo del simulador.",
      icono: "👑",
      condicion: (progreso) => Niveles.obtenerRangoPorXp(progreso.xp).id === "especialista",
    },
    {
      id: "maestro_plc",
      nombre: "Maestro del PLC",
      descripcion: "Completá el Nivel 5 programando las reglas correctas.",
      icono: "🧠",
      condicion: (progreso) => progreso.nivelesCompletados.includes(5),
    },
  ],

  /* ---------- Estado de la partida ---------- */
  progreso: null,        // se carga desde Storage en inicializar()
  configuracion: null,
  logrosDesbloqueados: null,

  /* Estado transitorio de un nivel en curso (no se persiste tal cual) */
  sesionNivel: {
    idNivel: null,
    pasosCorrectos: 0,
    erroresCometidos: 0,
  },

  /* Sistema simple de eventos, igual que en simulador.js */
  _listeners: {
    cambioEstado: [],
    logroDesbloqueado: [],
    ascensoRango: [],
    nivelSuperado: [],
    nivelFallido: [],
    sinVidas: [],
  },

  on(evento, callback) {
    if (!this._listeners[evento]) this._listeners[evento] = [];
    this._listeners[evento].push(callback);
  },

  _emitir(evento, datos) {
    (this._listeners[evento] || []).forEach((cb) => cb(datos));
  },

  /* ---------- Inicialización ---------- */

  inicializar() {
    this.progreso = Storage.obtenerProgreso();
    this.configuracion = Storage.obtenerConfiguracion();
    this.logrosDesbloqueados = Storage.obtenerLogros();

    AudioManager.setHabilitado(this.configuracion.sonido);
    Simulador.dificultadActual = this.configuracion.dificultad;

    this._emitir("cambioEstado", this.obtenerResumen());
  },

  /**
   * Resumen liviano del estado, pensado para que ui.js actualice
   * los indicadores de cabecera (rango, xp, vidas, puntaje).
   */
  obtenerResumen() {
    const rango = Niveles.obtenerRangoPorXp(this.progreso.xp);
    return {
      rango,
      progresoRango: Niveles.calcularProgresoRango(this.progreso.xp),
      xp: this.progreso.xp,
      vidas: this.progreso.vidas,
      puntaje: this.progreso.puntaje,
      nivelesCompletados: [...this.progreso.nivelesCompletados],
    };
  },

  guardar() {
    Storage.guardarProgreso(this.progreso);
  },

  /* ---------- Ciclo de un nivel ---------- */

  /**
   * Prepara el estado transitorio para comenzar (o reintentar) un nivel.
   * No reinicia vidas: si el jugador se queda sin vidas, sinVidas()
   * se encarga de restaurarlas para el reintento.
   */
  iniciarSesionNivel(idNivel) {
    this.sesionNivel = {
      idNivel,
      pasosCorrectos: 0,
      erroresCometidos: 0,
    };
  },

  /**
   * Registra la respuesta a una consigna de opción múltiple.
   * Devuelve un objeto con el resultado para que ui.js dé feedback.
   */
  responderConsigna(esCorrecta) {
    if (esCorrecta) {
      this.sesionNivel.pasosCorrectos += 1;
      this.progreso.puntaje += 10;
      AudioManager.acierto();
    } else {
      this.sesionNivel.erroresCometidos += 1;
      this._perderVida();
      AudioManager.error();
    }

    this.guardar();
    this._emitir("cambioEstado", this.obtenerResumen());

    const nivel = Niveles.obtenerNivel(this.sesionNivel.idNivel);
    const nivelCompleto = nivel && this.sesionNivel.pasosCorrectos >= nivel.totalPasos;

    return {
      correcta: esCorrecta,
      vidasRestantes: this.progreso.vidas,
      nivelCompleto: Boolean(nivelCompleto),
      sinVidas: this.progreso.vidas <= 0,
    };
  },

  /**
   * Evalúa las reglas armadas por el jugador en el mini PLC (Nivel 5)
   * contra los objetivos definidos en preguntas.js.
   */
  evaluarReglasPLC(reglasJugador) {
    const objetivos = Preguntas.obtenerObjetivosPLC();
    let aciertos = 0;

    objetivos.forEach((objetivo) => {
      const cumplida = reglasJugador.some((regla) =>
        regla.variable === objetivo.variableEsperada &&
        regla.condicion === objetivo.condicionEsperada &&
        regla.accionId === objetivo.accionEsperada
      );
      if (cumplida) aciertos += 1;
    });

    this.sesionNivel.pasosCorrectos = aciertos;
    const nivelCompleto = aciertos >= objetivos.length;

    if (nivelCompleto) {
      this.progreso.puntaje += 30;
    } else {
      this._perderVida();
    }

    this.guardar();
    this._emitir("cambioEstado", this.obtenerResumen());

    return {
      aciertos,
      totalObjetivos: objetivos.length,
      nivelCompleto,
      vidasRestantes: this.progreso.vidas,
      sinVidas: this.progreso.vidas <= 0,
    };
  },

  _perderVida() {
    this.progreso.vidas = Math.max(0, this.progreso.vidas - 1);
    if (this.progreso.vidas <= 0) {
      this._emitir("sinVidas", { idNivel: this.sesionNivel.idNivel });
    }
  },

  /**
   * Se llama cuando el jugador elige "reintentar" tras quedarse sin
   * vidas: restaura las vidas iniciales sin borrar el resto del progreso.
   */
  restaurarVidasParaReintento() {
    this.progreso.vidas = CONFIG.VIDAS_INICIALES;
    this.guardar();
    this._emitir("cambioEstado", this.obtenerResumen());
  },

  /**
   * Marca el nivel actual como superado: otorga XP, detecta ascenso
   * de rango, verifica logros y persiste todo.
   */
  finalizarNivelSuperado() {
    const nivel = Niveles.obtenerNivel(this.sesionNivel.idNivel);
    if (!nivel) return null;

    const xpAnterior = this.progreso.xp;

    if (!this.progreso.nivelesCompletados.includes(nivel.id)) {
      this.progreso.nivelesCompletados.push(nivel.id);
    }
    this.progreso.xp += nivel.xpOtorgada;
    this.progreso.puntaje += 20;

    // Desbloquea el siguiente nivel como "nivel actual" si corresponde
    if (!Niveles.esUltimoNivel(nivel.id)) {
      this.progreso.nivelActual = Math.max(this.progreso.nivelActual, nivel.id + 1);
    }

    const ascenso = Niveles.detectarAscenso(xpAnterior, this.progreso.xp);
    const nivelSinErrores = this.sesionNivel.erroresCometidos === 0;

    this.guardar();
    AudioManager.nivelSuperado();

    const logrosNuevos = this._verificarLogros({ nivelSinErrores });

    if (ascenso) {
      AudioManager.ascenso();
      this._emitir("ascensoRango", ascenso);
    }

    this._emitir("cambioEstado", this.obtenerResumen());
    this._emitir("nivelSuperado", { nivel, ascenso, logrosNuevos });

    return { nivel, ascenso, logrosNuevos };
  },

  /* ---------- Logros ---------- */

  _verificarLogros(contexto) {
    const nuevos = [];
    this.LOGROS.forEach((logro) => {
      if (this.logrosDesbloqueados[logro.id]) return; // ya desbloqueado
      if (logro.condicion(this.progreso, contexto)) {
        this.logrosDesbloqueados[logro.id] = true;
        this.progreso.puntaje += 15;
        nuevos.push(logro);
      }
    });

    if (nuevos.length > 0) {
      Storage.guardarLogros(this.logrosDesbloqueados);
      this.guardar();
      AudioManager.logro();
      nuevos.forEach((logro) => this._emitir("logroDesbloqueado", logro));
    }

    return nuevos;
  },

  obtenerLogrosConEstado() {
    return this.LOGROS.map((logro) => ({
      ...logro,
      desbloqueado: Boolean(this.logrosDesbloqueados[logro.id]),
    }));
  },

  /* ---------- Configuración ---------- */

  actualizarConfiguracion(cambios) {
    this.configuracion = { ...this.configuracion, ...cambios };
    Storage.guardarConfiguracion(this.configuracion);

    if ("sonido" in cambios) {
      AudioManager.setHabilitado(this.configuracion.sonido);
    }
    if ("dificultad" in cambios) {
      Simulador.dificultadActual = this.configuracion.dificultad;
    }
  },

  /* ---------- Reinicio total ---------- */

  reiniciarTodo() {
    Storage.reiniciarProgreso();
    Storage.guardarLogros({});
    this.progreso = Storage.obtenerProgreso();
    this.logrosDesbloqueados = {};
    this._emitir("cambioEstado", this.obtenerResumen());
  },
};
