/* ============================================================
   CONTROL FOOD — niveles.js
   Definición de los 5 niveles del juego y utilidades de
   progresión de rango (XP -> rango del operador).

   Depende de: config.js
   No toca el DOM directamente (eso es trabajo de ui.js).
   ============================================================ */

const Niveles = {

  /* ---------- Definición de niveles ----------
     tipo determina qué pantalla/lógica arma ui.js:
     "sensores" | "variables" | "perturbaciones" | "lazos" | "plc"
  --------------------------------------------------------------- */
  LISTA: [
    {
      id: 1,
      tipo: "sensores",
      titulo: "Sensores",
      icono: "📡",
      descripcion: "Identificá los sensores de la línea de producción y para qué sirve cada uno.",
      totalPasos: 6,
      xpOtorgada: CONFIG.XP.NIVEL_SUPERADO,
    },
    {
      id: 2,
      tipo: "variables",
      titulo: "Variables",
      icono: "🎚️",
      descripcion: "Distinguí entre variables controladas y variables manipuladas en distintos escenarios.",
      totalPasos: 6,
      xpOtorgada: CONFIG.XP.NIVEL_SUPERADO,
    },
    {
      id: 3,
      tipo: "perturbaciones",
      titulo: "Perturbaciones",
      icono: "⚠️",
      descripcion: "Resolvé fallas de producción antes de que la planta entre en alarma.",
      totalPasos: 5,
      xpOtorgada: CONFIG.XP.NIVEL_SUPERADO,
    },
    {
      id: 4,
      tipo: "lazos",
      titulo: "Lazo abierto y lazo cerrado",
      icono: "🔁",
      descripcion: "Analizá casos reales y decidí si conviene lazo abierto o lazo cerrado.",
      totalPasos: 5,
      xpOtorgada: CONFIG.XP.NIVEL_SUPERADO,
    },
    {
      id: 5,
      tipo: "plc",
      titulo: "Mini PLC",
      icono: "🧠",
      descripcion: "Programá reglas de control tipo SI / ENTONCES para automatizar la planta.",
      totalPasos: 3, // cantidad mínima de reglas correctas para aprobar
      xpOtorgada: CONFIG.XP.NIVEL_SUPERADO + 40, // el nivel más avanzado da un extra
    },
  ],

  /* ---------- Consultas de niveles ---------- */

  obtenerNivel(idNivel) {
    return this.LISTA.find((n) => n.id === idNivel) || null;
  },

  obtenerTodos() {
    return this.LISTA;
  },

  /**
   * Un nivel está desbloqueado si es el nivel 1, o si el nivel
   * anterior ya fue completado.
   */
  estaDesbloqueado(idNivel, progreso) {
    if (idNivel === 1) return true;
    const completados = progreso?.nivelesCompletados || [];
    return completados.includes(idNivel - 1);
  },

  estaCompletado(idNivel, progreso) {
    const completados = progreso?.nivelesCompletados || [];
    return completados.includes(idNivel);
  },

  esUltimoNivel(idNivel) {
    return idNivel === this.LISTA.length;
  },

  /* ---------- Progresión de rango (basada en XP) ---------- */

  /**
   * Devuelve el objeto de rango correspondiente a una cantidad de XP.
   */
  obtenerRangoPorXp(xp) {
    const rangos = CONFIG.RANGOS;
    let actual = rangos[0];
    for (const rango of rangos) {
      if (xp >= rango.xpMinima) {
        actual = rango;
      }
    }
    return actual;
  },

  /**
   * Devuelve el siguiente rango a alcanzar (o null si ya es el máximo).
   */
  obtenerSiguienteRango(xp) {
    const rangoActual = this.obtenerRangoPorXp(xp);
    const indiceActual = CONFIG.RANGOS.findIndex((r) => r.id === rangoActual.id);
    return CONFIG.RANGOS[indiceActual + 1] || null;
  },

  /**
   * Devuelve un número de 0 a 100 representando el avance dentro
   * del rango actual, útil para la barra de XP.
   */
  calcularProgresoRango(xp) {
    const rangoActual = this.obtenerRangoPorXp(xp);
    const siguienteRango = this.obtenerSiguienteRango(xp);

    if (!siguienteRango) return 100; // ya alcanzó el rango máximo

    const rangoXp = siguienteRango.xpMinima - rangoActual.xpMinima;
    const avanceXp = xp - rangoActual.xpMinima;
    return Math.min(100, Math.round((avanceXp / rangoXp) * 100));
  },

  /**
   * Detecta si al sumar XP el jugador subió de rango.
   * Devuelve el nuevo rango si hubo ascenso, o null si no.
   */
  detectarAscenso(xpAnterior, xpNueva) {
    const rangoAnterior = this.obtenerRangoPorXp(xpAnterior);
    const rangoNuevo = this.obtenerRangoPorXp(xpNueva);
    return rangoAnterior.id !== rangoNuevo.id ? rangoNuevo : null;
  },
};
