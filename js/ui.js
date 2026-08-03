/* ============================================================
   CONTROL FOOD — ui.js
   Manipulación del DOM y renderizado de todas las pantallas.

   Este es el único módulo que toca el DOM directamente.
   Se apoya en: Game, Simulador, Niveles, Preguntas, AudioManager.
   El punto de entrada real de la app es app.js, que llama a
   UI.inicializar() una vez que el DOM está listo.
   ============================================================ */

const UI = {

  /* ---------- Referencias cacheadas a elementos del DOM ---------- */
  el: {},

  /* ---------- Estado transitorio de la pantalla de nivel (quiz) ---------- */
  quiz: {
    consignas: [],
    indiceActual: 0,
  },

  /* ---------- Estado transitorio del mini PLC ---------- */
  plc: {
    reglas: [], // { variable, condicion, valor, accionId }
  },

  /* ============================================================
     INICIALIZACIÓN
     ============================================================ */

  inicializar() {
    this._cachearElementos();
    this._vincularEventosEstaticos();
    this._suscribirEventosDeGame();
    this._suscribirEventosDeSimulador();
    this._iniciarPantallaCarga();
  },

  _cachearElementos() {
    const id = (x) => document.getElementById(x);
    this.el = {
      // Carga
      barraCargaRelleno: id("barra-carga-relleno"),
      cargaPorcentaje: id("carga-porcentaje"),
      cargaMensaje: id("carga-mensaje"),
      // Inicio
      btnComenzar: id("btn-comenzar"),
      btnIrMenu: id("btn-ir-menu"),
      // Menú
      perfilRangoNombre: id("perfil-rango-nombre"),
      perfilXpRelleno: id("perfil-xp-relleno"),
      statVidas: id("stat-vidas"),
      statPuntaje: id("stat-puntaje"),
      btnConfig: id("btn-config"),
      listaNiveles: id("lista-niveles"),
      btnLogros: id("btn-logros"),
      btnSimuladorLibre: id("btn-simulador-libre"),
      // Configuración
      switchSonido: id("switch-sonido"),
      switchTema: id("switch-tema"),
      sliderDificultad: id("slider-dificultad"),
      btnReiniciarProgreso: id("btn-reiniciar-progreso"),
      btnConfigVolver: id("btn-config-volver"),
      // Logros
      btnLogrosVolver: id("btn-logros-volver"),
      grillaLogros: id("grilla-logros"),
      // Nivel (quiz)
      btnNivelSalir: id("btn-nivel-salir"),
      nivelInfoTitulo: id("nivel-info-titulo"),
      nivelInfoProgreso: id("nivel-info-progreso"),
      nivelStatVidas: id("nivel-stat-vidas"),
      nivelStatPuntaje: id("nivel-stat-puntaje"),
      nivelAreaJuego: id("nivel-area-juego"),
      nivelPanelFeedback: id("nivel-panel-feedback"),
      nivelFeedbackTexto: id("nivel-feedback-texto"),
      // Resultado
      resultadoIcono: id("resultado-icono"),
      resultadoTitulo: id("resultado-titulo"),
      resultadoDetalle: id("resultado-detalle"),
      resultadoLogroObtenido: id("resultado-logro-obtenido"),
      resultadoLogroTexto: id("resultado-logro-texto"),
      btnResultadoReintentar: id("btn-resultado-reintentar"),
      btnResultadoContinuar: id("btn-resultado-continuar"),
      // SCADA
      btnScadaSalir: id("btn-scada-salir"),
      ledEstadoGeneral: id("led-estado-general"),
      alarmaTexto: id("alarma-texto"),
      medidorTemperatura: id("medidor-temperatura"),
      valorTemperatura: id("valor-temperatura"),
      medidorPresion: id("medidor-presion"),
      valorPresion: id("valor-presion"),
      rellenoNivel: id("relleno-nivel"),
      valorNivel: id("valor-nivel"),
      medidorCaudal: id("medidor-caudal"),
      valorCaudal: id("valor-caudal"),
      listaEventos: id("lista-eventos"),
      grillaAcciones: id("grilla-acciones"),
      // Mini PLC
      btnPlcSalir: id("btn-plc-salir"),
      plcSelectVariable: id("plc-select-variable"),
      plcSelectCondicion: id("plc-select-condicion"),
      plcInputValor: id("plc-input-valor"),
      plcSelectAccion: id("plc-select-accion"),
      btnPlcAgregarRegla: id("btn-plc-agregar-regla"),
      plcListaReglas: id("plc-lista-reglas"),
      btnPlcEjecutar: id("btn-plc-ejecutar"),
      // Notificaciones
      contenedorNotificaciones: id("contenedor-notificaciones"),
    };
  },

  /* ============================================================
     NAVEGACIÓN ENTRE PANTALLAS
     ============================================================ */

  mostrarPantalla(idPantalla) {
    document.querySelectorAll(".pantalla").forEach((p) => p.classList.remove("activa"));
    const pantalla = document.getElementById(idPantalla);
    if (pantalla) pantalla.classList.add("activa");
  },

  /* ============================================================
     PANTALLA DE CARGA
     ============================================================ */

  _iniciarPantallaCarga() {
    const mensajes = [
      "Inicializando módulos de control...",
      "Calibrando sensores...",
      "Cargando línea de producción...",
      "Verificando actuadores...",
      "Preparando panel SCADA...",
    ];
    let progreso = 0;
    const intervalo = setInterval(() => {
      progreso += Math.random() * 12 + 6;
      if (progreso >= 100) {
        progreso = 100;
        clearInterval(intervalo);
        setTimeout(() => this.mostrarPantalla("pantalla-inicio"), 300);
      }
      this.el.barraCargaRelleno.style.width = `${progreso}%`;
      this.el.cargaPorcentaje.textContent = `${Math.floor(progreso)}%`;
      const indiceMensaje = Math.min(
        mensajes.length - 1,
        Math.floor((progreso / 100) * mensajes.length)
      );
      this.el.cargaMensaje.textContent = mensajes[indiceMensaje];
    }, CONFIG.TIEMPOS.VELOCIDAD_BARRA_CARGA * 10);
  },

  /* ============================================================
     EVENTOS ESTÁTICOS (botones que siempre existen)
     ============================================================ */

  _vincularEventosEstaticos() {
    // Inicio
    this.el.btnComenzar.addEventListener("click", () => {
      AudioManager.click();
      this.irAMenu();
    });
    this.el.btnIrMenu.addEventListener("click", () => {
      AudioManager.click();
      this.irAMenu();
    });

    // Menú
    this.el.btnConfig.addEventListener("click", () => {
      AudioManager.click();
      this._abrirConfiguracion();
      this.mostrarPantalla("pantalla-config");
    });
    this.el.btnLogros.addEventListener("click", () => {
      AudioManager.click();
      this.renderizarLogros();
      this.mostrarPantalla("pantalla-logros");
    });
    this.el.btnSimuladorLibre.addEventListener("click", () => {
      AudioManager.click();
      this.abrirSalaScada();
    });

    // Configuración
    this.el.switchSonido.addEventListener("change", (e) => {
      Game.actualizarConfiguracion({ sonido: e.target.checked });
    });
    this.el.switchTema.addEventListener("change", (e) => {
      const tema = e.target.checked ? "oscuro" : "claro";
      document.body.setAttribute("data-tema", tema);
      Game.actualizarConfiguracion({ temaOscuro: e.target.checked });
    });
    this.el.sliderDificultad.addEventListener("change", (e) => {
      Game.actualizarConfiguracion({ dificultad: Number(e.target.value) });
    });
    this.el.btnReiniciarProgreso.addEventListener("click", () => {
      const confirmar = window.confirm(
        "¿Seguro que querés reiniciar todo tu progreso? Esta acción no se puede deshacer."
      );
      if (!confirmar) return;
      Game.reiniciarTodo();
      this.mostrarNotificacion("Progreso reiniciado.", "exito");
      this.renderizarMenuNiveles();
      this.mostrarPantalla("pantalla-menu");
    });
    this.el.btnConfigVolver.addEventListener("click", () => {
      this.mostrarPantalla("pantalla-menu");
    });

    // Logros
    this.el.btnLogrosVolver.addEventListener("click", () => {
      this.mostrarPantalla("pantalla-menu");
    });

    // Nivel (quiz)
    this.el.btnNivelSalir.addEventListener("click", () => {
      Simulador.detener();
      this.mostrarPantalla("pantalla-menu");
    });

    // Resultado
    this.el.btnResultadoReintentar.addEventListener("click", () => {
      const idNivel = this.quiz.idNivelActual;
      this.abrirNivel(idNivel);
    });
    this.el.btnResultadoContinuar.addEventListener("click", () => {
      this.renderizarMenuNiveles();
      this.mostrarPantalla("pantalla-menu");
    });

    // Sala SCADA
    this.el.btnScadaSalir.addEventListener("click", () => {
      Simulador.detener();
      this.mostrarPantalla("pantalla-menu");
    });

    // Mini PLC
    this.el.btnPlcSalir.addEventListener("click", () => {
      Simulador.detener();
      this.mostrarPantalla("pantalla-menu");
    });
    this.el.btnPlcAgregarRegla.addEventListener("click", () => this._agregarReglaPLC());
    this.el.btnPlcEjecutar.addEventListener("click", () => this._ejecutarSimulacionPLC());
  },

  /* ============================================================
     SUSCRIPCIÓN A EVENTOS DE GAME
     ============================================================ */

  _suscribirEventosDeGame() {
    Game.on("cambioEstado", (resumen) => this._actualizarEncabezados(resumen));

    Game.on("logroDesbloqueado", (logro) => {
      this.mostrarNotificacion(`🏆 Logro desbloqueado: ${logro.nombre}`, "logro");
    });

    Game.on("sinVidas", () => {
      this._mostrarResultado({
        exito: false,
        titulo: "Sin vidas disponibles",
        detalle: "La planta sufrió demasiados errores. Recuperá tus vidas y volvé a intentarlo.",
      });
    });
  },

  _suscribirEventosDeSimulador() {
    Simulador.on("cambioVariable", (variables) => this._actualizarMedidoresScada(variables));
    Simulador.on("perturbacion", ({ tipo }) => this._registrarEventoScada(tipo, "alarma"));
    Simulador.on("alarma", ({ variable }) => this._marcarAlarmaGeneral(true, variable));
    Simulador.on("alarmaResuelta", () => this._marcarAlarmaGeneral(false));
  },

  /* ============================================================
     ENCABEZADOS (rango, xp, vidas, puntaje)
     ============================================================ */

  _actualizarEncabezados(resumen) {
    if (this.el.perfilRangoNombre) this.el.perfilRangoNombre.textContent = resumen.rango.nombre;
    if (this.el.perfilXpRelleno) this.el.perfilXpRelleno.style.width = `${resumen.progresoRango}%`;
    if (this.el.statVidas) this.el.statVidas.textContent = resumen.vidas;
    if (this.el.statPuntaje) this.el.statPuntaje.textContent = resumen.puntaje;
    if (this.el.nivelStatVidas) this.el.nivelStatVidas.textContent = resumen.vidas;
    if (this.el.nivelStatPuntaje) this.el.nivelStatPuntaje.textContent = resumen.puntaje;
  },

  /* ============================================================
     IR AL MENÚ (arma la grilla de niveles y muestra la pantalla)
     ============================================================ */

  irAMenu() {
    this.renderizarMenuNiveles();
    this.mostrarPantalla("pantalla-menu");
  },

  /* ============================================================
     MENÚ PRINCIPAL — GRILLA DE NIVELES
     ============================================================ */

  renderizarMenuNiveles() {
    const progreso = Game.progreso;
    this.el.listaNiveles.innerHTML = "";

    Niveles.obtenerTodos().forEach((nivel) => {
      const desbloqueado = Niveles.estaDesbloqueado(nivel.id, progreso);
      const completado = Niveles.estaCompletado(nivel.id, progreso);

      const tarjeta = document.createElement("div");
      tarjeta.className = `tarjeta-nivel${desbloqueado ? "" : " bloqueada"}`;
      tarjeta.innerHTML = `
        <span class="tarjeta-nivel-icono">${desbloqueado ? nivel.icono : "🔒"}</span>
        <span class="tarjeta-nivel-titulo">Nivel ${nivel.id} — ${nivel.titulo}</span>
        <p class="tarjeta-nivel-desc">${nivel.descripcion}</p>
        <div class="tarjeta-nivel-barra">
          <div class="tarjeta-nivel-barra-relleno" style="width:${completado ? 100 : 0}%"></div>
        </div>
      `;

      if (desbloqueado) {
        tarjeta.addEventListener("click", () => {
          AudioManager.click();
          this.abrirNivel(nivel.id);
        });
      }

      this.el.listaNiveles.appendChild(tarjeta);
    });
  },

  /* ============================================================
     CONFIGURACIÓN
     ============================================================ */

  _abrirConfiguracion() {
    const config = Game.configuracion;
    this.el.switchSonido.checked = config.sonido;
    this.el.switchTema.checked = config.temaOscuro;
    this.el.sliderDificultad.value = config.dificultad;
  },

  /* ============================================================
     LOGROS
     ============================================================ */

  renderizarLogros() {
    const logros = Game.obtenerLogrosConEstado();
    this.el.grillaLogros.innerHTML = "";

    logros.forEach((logro) => {
      const tarjeta = document.createElement("div");
      tarjeta.className = `tarjeta-logro${logro.desbloqueado ? " desbloqueado" : ""}`;
      tarjeta.innerHTML = `
        <div class="tarjeta-logro-icono">${logro.icono}</div>
        <div class="tarjeta-logro-nombre">${logro.nombre}</div>
        <div class="tarjeta-logro-desc">${logro.descripcion}</div>
      `;
      this.el.grillaLogros.appendChild(tarjeta);
    });
  },

  /* ============================================================
     NIVELES — Punto de entrada según tipo
     ============================================================ */

  abrirNivel(idNivel) {
    const nivel = Niveles.obtenerNivel(idNivel);
    if (!nivel) return;

    Game.iniciarSesionNivel(idNivel);
    this.quiz.idNivelActual = idNivel;

    if (nivel.tipo === "plc") {
      this._abrirNivelPLC(nivel);
      return;
    }

    this._abrirNivelQuiz(nivel);
  },

  /* ---------- Niveles tipo quiz (sensores, variables, perturbaciones, lazos) ---------- */

  _abrirNivelQuiz(nivel) {
    const banco = Preguntas.obtenerPorTipo(nivel.tipo);
    this.quiz.consignas = Preguntas.mezclar(banco).slice(0, nivel.totalPasos);
    this.quiz.indiceActual = 0;

    this.el.nivelInfoTitulo.textContent = `Nivel ${nivel.id} — ${nivel.titulo}`;
    this.el.nivelPanelFeedback.className = "nivel-panel-feedback";
    this.el.nivelFeedbackTexto.textContent = "Elegí la opción correcta para avanzar.";

    this.mostrarPantalla("pantalla-nivel");
    this._renderizarConsignaActual();
  },

  _renderizarConsignaActual() {
    const nivel = Niveles.obtenerNivel(this.quiz.idNivelActual);
    const total = this.quiz.consignas.length;
    const indice = this.quiz.indiceActual;
    const progresoPct = Math.round((indice / total) * 100);
    this.el.nivelInfoProgreso.style.width = `${progresoPct}%`;

    if (indice >= total) {
      // No debería llegar acá: el nivel se cierra apenas se cumple
      // totalPasos correctos, ver _manejarRespuestaQuiz().
      return;
    }

    const consigna = this.quiz.consignas[indice];
    const contenedor = this.el.nivelAreaJuego;
    contenedor.innerHTML = `
      <div class="tarjeta">
        <p class="plc-instrucciones" style="margin-bottom:1rem; font-size:1rem; color:var(--texto-principal);">
          ${consigna.enunciado}
        </p>
        <div class="scada-grilla-acciones" id="opciones-consigna"></div>
      </div>
    `;

    const contenedorOpciones = document.getElementById("opciones-consigna");
    consigna.opciones.forEach((textoOpcion, indiceOpcion) => {
      const boton = document.createElement("button");
      boton.className = "boton-actuador";
      boton.textContent = textoOpcion;
      boton.addEventListener("click", () => this._manejarRespuestaQuiz(indiceOpcion, consigna));
      contenedorOpciones.appendChild(boton);
    });
  },

  _manejarRespuestaQuiz(indiceElegido, consigna) {
    const esCorrecta = indiceElegido === consigna.correcta;
    const resultado = Game.responderConsigna(esCorrecta);

    this.el.nivelPanelFeedback.className = `nivel-panel-feedback ${esCorrecta ? "correcto" : "incorrecto"}`;
    this.el.nivelFeedbackTexto.textContent = esCorrecta
      ? `✅ ¡Correcto! ${consigna.explicacion}`
      : `❌ No es correcto. ${consigna.explicacion}`;

    if (resultado.sinVidas) {
      return; // Game ya emitió "sinVidas"; UI reacciona en _suscribirEventosDeGame
    }

    setTimeout(() => {
      if (resultado.nivelCompleto) {
        this._finalizarNivelExitoso();
        return;
      }
      this.quiz.indiceActual += 1;
      this._renderizarConsignaActual();
    }, 1400);
  },

  _finalizarNivelExitoso() {
    const resultado = Game.finalizarNivelSuperado();
    if (!resultado) return;
    this._mostrarResultado({
      exito: true,
      titulo: "¡Nivel superado!",
      detalle: `Ganaste ${resultado.nivel.xpOtorgada} XP.${resultado.ascenso ? ` Ascendiste a ${resultado.ascenso.nombre}.` : ""}`,
      logrosNuevos: resultado.logrosNuevos,
    });
  },

  /* ============================================================
     PANTALLA DE RESULTADO
     ============================================================ */

  _mostrarResultado({ exito, titulo, detalle, logrosNuevos = [] }) {
    Simulador.detener();
    this.el.resultadoIcono.textContent = exito ? "🎉" : "⚠️";
    this.el.resultadoTitulo.textContent = titulo;
    this.el.resultadoDetalle.textContent = detalle;

    if (logrosNuevos.length > 0) {
      this.el.resultadoLogroObtenido.classList.remove("oculto");
      this.el.resultadoLogroTexto.textContent = logrosNuevos.map((l) => l.nombre).join(", ");
    } else {
      this.el.resultadoLogroObtenido.classList.add("oculto");
    }

    this.el.btnResultadoReintentar.classList.toggle("oculto", exito);
    if (!exito) {
      // Al reintentar tras quedarse sin vidas, primero se restauran
      this.el.btnResultadoReintentar.onclick = () => {
        Game.restaurarVidasParaReintento();
        this.abrirNivel(this.quiz.idNivelActual);
      };
    }

    this.mostrarPantalla("pantalla-resultado");
  },

  /* ============================================================
     SALA SCADA (modo libre y base visual de niveles con simulador)
     ============================================================ */

  abrirSalaScada() {
    Simulador.reiniciar();
    Simulador.setModoLazo("abierto");
    this._renderizarBotonesActuadores();
    this.el.listaEventos.innerHTML = "";
    Simulador.iniciar(Game.configuracion.dificultad);
    this.mostrarPantalla("pantalla-scada");
  },

  _renderizarBotonesActuadores() {
    this.el.grillaAcciones.innerHTML = "";
    CONFIG.ACTUADORES.forEach((actuador) => {
      const boton = document.createElement("button");
      boton.className = "boton-actuador";
      boton.textContent = actuador.nombre;
      boton.dataset.actuadorId = actuador.id;
      boton.addEventListener("click", () => {
        const activo = Simulador.alternarActuador(actuador.id);
        boton.classList.toggle("activo", activo);
        AudioManager.click();
      });
      this.el.grillaAcciones.appendChild(boton);
    });
  },

  _actualizarMedidoresScada(variables) {
    this._actualizarMedidorCircular("temperatura", variables.temperatura, this.el.medidorTemperatura, this.el.valorTemperatura);
    this._actualizarMedidorCircular("presion", variables.presion, this.el.medidorPresion, this.el.valorPresion);
    this._actualizarMedidorCircular("caudal", variables.caudal, this.el.medidorCaudal, this.el.valorCaudal);
    this._actualizarIndicadorVertical(variables.nivel);
  },

  _actualizarMedidorCircular(clave, valor, elementoMedidor, elementoValor) {
    if (!elementoMedidor) return;
    const rango = CONFIG.RANGOS_VARIABLES[clave];
    const porcentaje = this._porcentajeEnRango(valor, rango);
    const estado = Simulador.obtenerEstadoVariable(clave);
    const color = this._colorPorEstado(estado);

    const aguja = elementoMedidor.querySelector(".medidor-aguja");
    if (aguja) {
      const angulo = porcentaje * 270 - 135; // barrido de -135° a +135°
      aguja.style.transform = `translateX(-50%) rotate(${angulo}deg)`;
      aguja.style.background = color;
    }
    elementoMedidor.style.background = `conic-gradient(${color} ${porcentaje * 360}deg, var(--color-gris-medio) 0deg)`;
    elementoValor.textContent = valor.toFixed(1);

    const tarjeta = elementoMedidor.closest(".panel-variable");
    if (tarjeta) tarjeta.classList.toggle("en-alarma", estado === "alarma");
  },

  _actualizarIndicadorVertical(valorNivel) {
    if (!this.el.rellenoNivel) return;
    const rango = CONFIG.RANGOS_VARIABLES.nivel;
    const porcentaje = this._porcentajeEnRango(valorNivel, rango);
    this.el.rellenoNivel.style.height = `${Math.round(porcentaje * 100)}%`;
    this.el.valorNivel.textContent = valorNivel.toFixed(1);

    const estado = Simulador.obtenerEstadoVariable("nivel");
    const tarjeta = this.el.rellenoNivel.closest(".panel-variable");
    if (tarjeta) tarjeta.classList.toggle("en-alarma", estado === "alarma");
  },

  _porcentajeEnRango(valor, rango) {
    const min = rango.alarmaBaja;
    const max = rango.alarmaAlta;
    const pct = (valor - min) / (max - min);
    return Math.min(1, Math.max(0, pct));
  },

  _colorPorEstado(estado) {
    if (estado === "alarma") return "var(--color-rojo)";
    if (estado === "alerta") return "var(--color-amarillo)";
    return "var(--color-verde)";
  },

  _registrarEventoScada(tipoPerturbacion, severidad = "alarma") {
    if (!this.el.listaEventos) return;
    const nombresLegibles = {
      subida_temperatura: "Subió la temperatura",
      bajada_nivel: "Bajó el nivel del tanque",
      falla_sensor: "Falla detectada en un sensor",
      falla_bomba: "Falla detectada en una bomba",
      subida_presion: "Subió la presión del sistema",
      bajada_caudal: "Cayó el caudal de la línea",
    };
    const hora = new Date().toLocaleTimeString();
    const li = document.createElement("li");
    li.className = severidad === "alarma" ? "evento-alarma" : "evento-ok";
    li.textContent = `[${hora}] ${nombresLegibles[tipoPerturbacion] || tipoPerturbacion}`;
    this.el.listaEventos.prepend(li);

    AudioManager.alarma();
  },

  _marcarAlarmaGeneral(hayAlarma, variable) {
    if (!this.el.ledEstadoGeneral) return;
    this.el.ledEstadoGeneral.className = `led ${hayAlarma ? "led--alarma" : "led--ok"}`;
    this.el.alarmaTexto.textContent = hayAlarma
      ? `Alarma activa${variable ? ` — ${variable}` : ""}`
      : "Sistema estable";
  },

  /* ============================================================
     MINI PLC (Nivel 5)
     ============================================================ */

  _abrirNivelPLC(nivel) {
    this.plc.reglas = [];
    this._poblarSelectAccionesPLC();
    this._renderizarReglasPLC();

    Simulador.reiniciar();
    Simulador.setModoLazo("cerrado");

    this.el.nivelPanelFeedback && (this.el.nivelPanelFeedback.textContent = "");
    this.mostrarPantalla("pantalla-plc");
  },

  _poblarSelectAccionesPLC() {
    this.el.plcSelectAccion.innerHTML = "";
    CONFIG.ACTUADORES.forEach((actuador) => {
      const opcion = document.createElement("option");
      opcion.value = actuador.id;
      opcion.textContent = actuador.nombre;
      this.el.plcSelectAccion.appendChild(opcion);
    });
  },

  _agregarReglaPLC() {
    const variable = this.el.plcSelectVariable.value;
    const condicion = this.el.plcSelectCondicion.value;
    const valor = Number(this.el.plcInputValor.value);
    const accionId = this.el.plcSelectAccion.value;

    if (Number.isNaN(valor) || this.el.plcInputValor.value.trim() === "") {
      this.mostrarNotificacion("Ingresá un valor numérico para la regla.", "error");
      return;
    }

    this.plc.reglas.push({ variable, condicion, valor, accionId });
    this._renderizarReglasPLC();
    this.el.plcInputValor.value = "";
    AudioManager.click();
  },

  _renderizarReglasPLC() {
    const simbolos = { mayor: ">", menor: "<", igual: "=" };
    const nombreActuador = (id) => CONFIG.ACTUADORES.find((a) => a.id === id)?.nombre || id;

    this.el.plcListaReglas.innerHTML = "";
    this.plc.reglas.forEach((regla, indice) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>SI ${regla.variable} ${simbolos[regla.condicion]} ${regla.valor} ENTONCES ${nombreActuador(regla.accionId)}</span>
        <button class="btn-borrar-regla" data-indice="${indice}" aria-label="Borrar regla">✕</button>
      `;
      this.el.plcListaReglas.appendChild(li);
    });

    this.el.plcListaReglas.querySelectorAll(".btn-borrar-regla").forEach((boton) => {
      boton.addEventListener("click", (e) => {
        const indice = Number(e.target.dataset.indice);
        this.plc.reglas.splice(indice, 1);
        this._renderizarReglasPLC();
      });
    });
  },

  _ejecutarSimulacionPLC() {
    if (this.plc.reglas.length === 0) {
      this.mostrarNotificacion("Agregá al menos una regla antes de ejecutar.", "error");
      return;
    }

    // Aplica las reglas una vez sobre el estado actual del simulador
    // (motor de control tipo PLC en simulador.js).
    Simulador.ejecutarReglasPLC(
      this.plc.reglas.map((r) => ({
        variable: r.variable,
        condicion: r.condicion,
        valor: r.valor,
        accionId: r.accionId,
      }))
    );

    const resultado = Game.evaluarReglasPLC(this.plc.reglas);

    if (resultado.sinVidas) return;

    if (resultado.nivelCompleto) {
      this._finalizarNivelExitosoPLC();
    } else {
      this.mostrarNotificacion(
        `Cumpliste ${resultado.aciertos} de ${resultado.totalObjetivos} objetivos. Revisá las reglas y volvé a intentar.`,
        "error"
      );
    }
  },

  _finalizarNivelExitosoPLC() {
    const resultado = Game.finalizarNivelSuperado();
    if (!resultado) return;
    this._mostrarResultado({
      exito: true,
      titulo: "¡Planta automatizada con éxito!",
      detalle: `Programaste correctamente las reglas del PLC y ganaste ${resultado.nivel.xpOtorgada} XP.${resultado.ascenso ? ` Ascendiste a ${resultado.ascenso.nombre}.` : ""}`,
      logrosNuevos: resultado.logrosNuevos,
    });
  },

  /* ============================================================
     NOTIFICACIONES (toasts)
     ============================================================ */

  mostrarNotificacion(mensaje, tipo = "info") {
    const clases = {
      info: "notificacion",
      exito: "notificacion notificacion--exito",
      error: "notificacion notificacion--error",
      logro: "notificacion notificacion--logro",
    };
    const div = document.createElement("div");
    div.className = clases[tipo] || clases.info;
    div.textContent = mensaje;
    this.el.contenedorNotificaciones.appendChild(div);

    setTimeout(() => div.remove(), CONFIG.TIEMPOS.DURACION_NOTIFICACION);
  },
};
