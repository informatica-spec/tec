/* ============================================================
   CONTROL FOOD — config.js
   Constantes globales de la aplicación.
   Este archivo se carga primero: ningún otro módulo depende de
   nada externo a él. No accede al DOM ni ejecuta lógica.
   ============================================================ */

const CONFIG = {

  /* ---------- Metadatos ---------- */
  NOMBRE_APP: "CONTROL FOOD",
  VERSION: "0.1.0",

  /* ---------- Claves de LocalStorage ---------- */
  STORAGE_KEYS: {
    PROGRESO: "controlfood_progreso",
    CONFIGURACION: "controlfood_config",
    LOGROS: "controlfood_logros",
  },

  /* ---------- Rangos del operador (progresión por XP) ---------- */
  RANGOS: [
    { id: "junior", nombre: "Operador Junior", xpMinima: 0 },
    { id: "operador", nombre: "Operador", xpMinima: 150 },
    { id: "supervisor", nombre: "Supervisor", xpMinima: 400 },
    { id: "jefe", nombre: "Jefe de Planta", xpMinima: 800 },
    { id: "especialista", nombre: "Especialista en Automatización", xpMinima: 1400 },
  ],

  /* ---------- Vidas ---------- */
  VIDAS_INICIALES: 3,
  VIDAS_MAXIMAS: 5,

  /* ---------- Experiencia otorgada ---------- */
  XP: {
    RESPUESTA_CORRECTA: 15,
    NIVEL_SUPERADO: 60,
    LOGRO_DESBLOQUEADO: 25,
    PENALIZACION_ERROR: 0, // no se resta XP, solo se pierde una vida
  },

  /* ---------- Rangos normales de operación de la planta ----------
     Usados por simulador.js para saber cuándo una variable está
     en zona segura, de alerta o de alarma. Unidades:
     temperatura: °C | presion: bar | nivel: % | caudal: L/min
  ------------------------------------------------------------- */
  RANGOS_VARIABLES: {
    temperatura: { min: 60, max: 90, unidad: "°C", alarmaBaja: 50, alarmaAlta: 100 },
    presion: { min: 2, max: 6, unidad: "bar", alarmaBaja: 1, alarmaAlta: 8 },
    nivel: { min: 30, max: 80, unidad: "%", alarmaBaja: 15, alarmaAlta: 95 },
    caudal: { min: 20, max: 60, unidad: "L/min", alarmaBaja: 5, alarmaAlta: 80 },
  },

  /* ---------- Tiempos del simulador (milisegundos) ---------- */
  TIEMPOS: {
    ACTUALIZACION_VARIABLES: 1500,     // cada cuánto se recalculan las variables
    INTERVALO_PERTURBACION_MIN: 6000,  // tiempo mínimo entre perturbaciones aleatorias
    INTERVALO_PERTURBACION_MAX: 14000, // tiempo máximo entre perturbaciones aleatorias
    DURACION_NOTIFICACION: 3000,
    VELOCIDAD_BARRA_CARGA: 18,         // ms entre cada incremento de la pantalla de carga
  },

  /* ---------- Actuadores disponibles en la planta ---------- */
  ACTUADORES: [
    { id: "ventilador", nombre: "Ventilador de enfriamiento", afecta: "temperatura", efecto: -1 },
    { id: "resistencia", nombre: "Resistencia de calentamiento", afecta: "temperatura", efecto: 1 },
    { id: "valvula_alivio", nombre: "Válvula de alivio", afecta: "presion", efecto: -1 },
    { id: "compresor", nombre: "Compresor", afecta: "presion", efecto: 1 },
    { id: "bomba_llenado", nombre: "Bomba de llenado", afecta: "nivel", efecto: 1 },
    { id: "valvula_drenaje", nombre: "Válvula de drenaje", afecta: "nivel", efecto: -1 },
    { id: "bomba_caudal", nombre: "Bomba de caudal", afecta: "caudal", efecto: 1 },
    { id: "estrangulador", nombre: "Estrangulador de flujo", afecta: "caudal", efecto: -1 },
  ],

  /* ---------- Tipos de perturbaciones posibles ---------- */
  TIPOS_PERTURBACION: [
    "subida_temperatura",
    "bajada_nivel",
    "falla_sensor",
    "falla_bomba",
    "subida_presion",
    "bajada_caudal",
  ],

  /* ---------- Dificultad ---------- */
  DIFICULTAD: {
    1: { nombre: "Fácil", multiplicadorPerturbacion: 0.7 },
    2: { nombre: "Normal", multiplicadorPerturbacion: 1 },
    3: { nombre: "Difícil", multiplicadorPerturbacion: 1.4 },
  },

  /* ---------- Cantidad de niveles del juego ---------- */
  CANTIDAD_NIVELES: 5,
};

/* Evita que config.js sea modificado accidentalmente por otros módulos */
Object.freeze(CONFIG);
Object.freeze(CONFIG.STORAGE_KEYS);
Object.freeze(CONFIG.XP);
Object.freeze(CONFIG.TIEMPOS);
Object.freeze(CONFIG.RANGOS_VARIABLES);
Object.freeze(CONFIG.DIFICULTAD);
