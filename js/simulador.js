/* ============================================================
   CONTROL FOOD — simulador.js
   Motor de simulación de la línea de producción.

   Responsabilidades:
   - Mantener el estado de las variables de proceso (temperatura,
     presión, nivel, caudal).
   - Generar perturbaciones aleatorias.
   - Aplicar el efecto de los actuadores sobre las variables.
   - Evaluar zonas de alarma.
   - Notificar cambios mediante un sistema simple de eventos
     (pub/sub) para que ui.js pueda reaccionar sin acoplarse.

   Depende de: config.js
   No toca el DOM directamente.
   ============================================================ */

const Simulador = {

  /* ---------- Estado interno ---------- */
  variables: {
    temperatura: 70,
    presion: 4,
    nivel: 55,
    caudal: 40,
  },

  actuadoresActivos: new Set(),

  /* Modo de control actual: "abierto" o "cerrado".
     En lazo cerrado, el propio simulador corrige desvíos
     automáticamente; en lazo abierto, solo el operador corrige. */
  modoLazo: "abierto",

  perturbacionActual: null, // { tipo, variableAfectada, iniciadaEn }

  dificultadActual: 2,

  _idIntervaloTick: null,
  _idTimeoutPerturbacion: null,
  _enEjecucion: false,

  /* Sistema simple de eventos (pub/sub) */
  _listeners: {
    cambioVariable: [],
    perturbacion: [],
    alarma: [],
    alarmaResuelta: [],
  },

  on(evento, callback) {
    if (!this._listeners[evento]) this._listeners[evento] = [];
    this._listeners[evento].push(callback);
  },

  _emitir(evento, datos) {
    (this._listeners[evento] || []).forEach((cb) => cb(datos));
  },

  /* ---------- Ciclo de vida ---------- */

  /**
   * Reinicia las variables a valores estables dentro de rango normal
   * y limpia perturbaciones/actuadores activos.
   */
  reiniciar() {
    const rangos = CONFIG.RANGOS_VARIABLES;
    this.variables = {
      temperatura: this._puntoMedio(rangos.temperatura),
      presion: this._puntoMedio(rangos.presion),
      nivel: this._puntoMedio(rangos.nivel),
      caudal: this._puntoMedio(rangos.caudal),
    };
    this.actuadoresActivos.clear();
    this.perturbacionActual = null;
    this._emitir("cambioVariable", { ...this.variables });
  },

  _puntoMedio(rango) {
    return Math.round((rango.min + rango.max) / 2);
  },

  /**
   * Inicia el ciclo de simulación (tick periódico + perturbaciones
   * aleatorias). dificultad: 1 | 2 | 3.
   */
  iniciar(dificultad = 2) {
    if (this._enEjecucion) this.detener();
    this.dificultadActual = dificultad;
    this._enEjecucion = true;

    this._idIntervaloTick = setInterval(() => {
      this._tick();
    }, CONFIG.TIEMPOS.ACTUALIZACION_VARIABLES);

    this._programarProximaPerturbacion();
  },

  /**
   * Detiene por completo el ciclo de simulación (al salir del nivel
   * o de la sala SCADA).
   */
  detener() {
    this._enEjecucion = false;
    clearInterval(this._idIntervaloTick);
    clearTimeout(this._idTimeoutPerturbacion);
    this._idIntervaloTick = null;
    this._idTimeoutPerturbacion = null;
  },

  /* ---------- Tick de simulación ---------- */

  _tick() {
    // 1. Deriva natural leve (todo proceso real fluctúa un poco)
    this._aplicarDerivaNatural();

    // 2. Efecto de actuadores activos
    this._aplicarActuadoresActivos();

    // 3. Efecto de la perturbación activa (si hay una)
    if (this.perturbacionActual) {
      this._aplicarEfectoPerturbacion();
    }

    // 4. En lazo cerrado, el sistema autocorrige levemente
    if (this.modoLazo === "cerrado") {
      this._autocorregir();
    }

    this._emitir("cambioVariable", { ...this.variables });
    this._evaluarAlarmas();
  },

  _aplicarDerivaNatural() {
    Object.keys(this.variables).forEach((clave) => {
      const ruido = (Math.random() - 0.5) * 1.2; // pequeña fluctuación
      this.variables[clave] = this._redondear(this.variables[clave] + ruido);
    });
  },

  _aplicarActuadoresActivos() {
    this.actuadoresActivos.forEach((idActuador) => {
      const actuador = CONFIG.ACTUADORES.find((a) => a.id === idActuador);
      if (!actuador) return;
      const magnitud = 2.2; // intensidad de corrección por tick
      this.variables[actuador.afecta] = this._redondear(
        this.variables[actuador.afecta] + actuador.efecto * magnitud
      );
    });
  },

  _aplicarEfectoPerturbacion() {
    const { tipo } = this.perturbacionActual;
    const multiplicador = CONFIG.DIFICULTAD[this.dificultadActual]?.multiplicadorPerturbacion ?? 1;
    const intensidad = 2 * multiplicador;

    switch (tipo) {
      case "subida_temperatura":
        this.variables.temperatura = this._redondear(this.variables.temperatura + intensidad);
        break;
      case "bajada_nivel":
        this.variables.nivel = this._redondear(this.variables.nivel - intensidad);
        break;
      case "subida_presion":
        this.variables.presion = this._redondear(this.variables.presion + intensidad * 0.3);
        break;
      case "bajada_caudal":
        this.variables.caudal = this._redondear(this.variables.caudal - intensidad * 2);
        break;
      case "falla_sensor":
      case "falla_bomba":
        // Estas perturbaciones no mueven una variable en forma continua:
        // su efecto se resuelve como evento puntual (ver niveles.js / ui.js).
        break;
      default:
        break;
    }
  },

  _autocorregir() {
    const rangos = CONFIG.RANGOS_VARIABLES;
    Object.keys(this.variables).forEach((clave) => {
      const rango = rangos[clave];
      const centro = this._puntoMedio(rango);
      const valor = this.variables[clave];
      if (valor > centro) {
        this.variables[clave] = this._redondear(valor - 0.6);
      } else if (valor < centro) {
        this.variables[clave] = this._redondear(valor + 0.6);
      }
    });
  },

  _redondear(valor) {
    return Math.round(valor * 10) / 10;
  },

  /* ---------- Perturbaciones ---------- */

  _programarProximaPerturbacion() {
    if (!this._enEjecucion) return;
    const { INTERVALO_PERTURBACION_MIN, INTERVALO_PERTURBACION_MAX } = CONFIG.TIEMPOS;
    const espera =
      INTERVALO_PERTURBACION_MIN +
      Math.random() * (INTERVALO_PERTURBACION_MAX - INTERVALO_PERTURBACION_MIN);

    this._idTimeoutPerturbacion = setTimeout(() => {
      this.generarPerturbacionAleatoria();
      this._programarProximaPerturbacion();
    }, espera);
  },

  /**
   * Elige y activa una perturbación aleatoria de la lista disponible
   * en CONFIG.TIPOS_PERTURBACION. Emite el evento "perturbacion".
   */
  generarPerturbacionAleatoria() {
    const tipos = CONFIG.TIPOS_PERTURBACION;
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    this.activarPerturbacion(tipo);
  },

  /**
   * Activa una perturbación específica por su tipo (útil para que
   * niveles.js proponga un escenario puntual y no algo azaroso).
   */
  activarPerturbacion(tipo) {
    this.perturbacionActual = {
      tipo,
      iniciadaEn: Date.now(),
    };
    this._emitir("perturbacion", { tipo });
  },

  /**
   * Marca la perturbación actual como resuelta (el operador actuó
   * correctamente). No modifica variables por sí sola.
   */
  resolverPerturbacion() {
    this.perturbacionActual = null;
  },

  /* ---------- Actuadores ---------- */

  activarActuador(idActuador) {
    this.actuadoresActivos.add(idActuador);
  },

  desactivarActuador(idActuador) {
    this.actuadoresActivos.delete(idActuador);
  },

  alternarActuador(idActuador) {
    if (this.actuadoresActivos.has(idActuador)) {
      this.desactivarActuador(idActuador);
      return false;
    }
    this.activarActuador(idActuador);
    return true;
  },

  actuadorEstaActivo(idActuador) {
    return this.actuadoresActivos.has(idActuador);
  },

  /* ---------- Modo de lazo ---------- */

  setModoLazo(modo) {
    this.modoLazo = modo === "cerrado" ? "cerrado" : "abierto";
  },

  /* ---------- Evaluación de alarmas ---------- */

  /**
   * Determina el estado de cada variable: "normal" | "alerta" | "alarma".
   */
  obtenerEstadoVariable(clave) {
    const valor = this.variables[clave];
    const rango = CONFIG.RANGOS_VARIABLES[clave];
    if (!rango) return "normal";

    if (valor <= rango.alarmaBaja || valor >= rango.alarmaAlta) return "alarma";
    if (valor < rango.min || valor > rango.max) return "alerta";
    return "normal";
  },

  _evaluarAlarmas() {
    let hayAlarma = false;
    Object.keys(this.variables).forEach((clave) => {
      const estado = this.obtenerEstadoVariable(clave);
      if (estado === "alarma") {
        hayAlarma = true;
        this._emitir("alarma", { variable: clave, valor: this.variables[clave] });
      }
    });
    if (!hayAlarma) {
      this._emitir("alarmaResuelta", {});
    }
  },

  /* ---------- Reglas del mini PLC (Nivel 5) ----------
     Ejecuta una lista de reglas tipo:
     { variable: "temperatura", condicion: "mayor", valor: 90, accionId: "ventilador" }
     Se evalúan en cada tick externo (llamado desde niveles.js). ---- */

  ejecutarReglasPLC(reglas) {
    reglas.forEach((regla) => {
      const valorActual = this.variables[regla.variable];
      let condicionCumplida = false;

      switch (regla.condicion) {
        case "mayor":
          condicionCumplida = valorActual > regla.valor;
          break;
        case "menor":
          condicionCumplida = valorActual < regla.valor;
          break;
        case "igual":
          condicionCumplida = Math.round(valorActual) === Math.round(regla.valor);
          break;
        default:
          condicionCumplida = false;
      }

      if (condicionCumplida) {
        this.activarActuador(regla.accionId);
      } else {
        this.desactivarActuador(regla.accionId);
      }
    });
  },

  /* ---------- Consulta de estado general ---------- */

  obtenerEstado() {
    return {
      variables: { ...this.variables },
      actuadoresActivos: [...this.actuadoresActivos],
      modoLazo: this.modoLazo,
      perturbacionActual: this.perturbacionActual,
    };
  },
};
