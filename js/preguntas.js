/* ============================================================
   CONTROL FOOD — preguntas.js
   Banco de contenidos pedagógicos usado dentro de cada nivel.

   Cada colección está indexada por el id de nivel (ver niveles.js).
   Estructura general de una consigna de opción múltiple:
   {
     id, enunciado, opciones: [texto, texto, ...],
     correcta: índice de la opción correcta,
     explicacion: texto mostrado como feedback educativo
   }

   Depende de: config.js (para el nivel 5, ids de actuadores)
   No toca el DOM directamente.
   ============================================================ */

const Preguntas = {

  /* ============================================================
     NIVEL 1 — SENSORES
     ============================================================ */
  sensores: [
    {
      id: "s1",
      enunciado: "Un dispositivo mide la temperatura del tanque de cocción y envía el dato al controlador. ¿Qué tipo de elemento es?",
      opciones: ["Sensor de temperatura", "Actuador", "Variable manipulada", "Perturbación"],
      correcta: 0,
      explicacion: "Un sensor capta el valor real de una variable física (en este caso temperatura) y lo transforma en una señal para el sistema de control.",
    },
    {
      id: "s2",
      enunciado: "En la línea de envasado, un dispositivo detecta si el nivel de líquido llegó al límite superior del tanque. ¿Qué es?",
      opciones: ["Un actuador", "Un sensor de nivel", "Un controlador", "Una válvula"],
      correcta: 1,
      explicacion: "Detectar y medir el nivel de un tanque es tarea de un sensor de nivel, no de un actuador (que ejecuta acciones).",
    },
    {
      id: "s3",
      enunciado: "¿Cuál de estos NO es un sensor típico de una planta alimenticia?",
      opciones: ["Sensor de presión", "Sensor de caudal", "Motor de agitación", "Sensor de temperatura"],
      correcta: 2,
      explicacion: "El motor de agitación es un actuador: ejecuta una acción física sobre el proceso, no mide una variable.",
    },
    {
      id: "s4",
      enunciado: "Un sensor de caudal se coloca en una tubería para medir...",
      opciones: [
        "La cantidad de producto que pasa por unidad de tiempo",
        "La temperatura del producto",
        "El color del producto",
        "El peso total del tanque",
      ],
      correcta: 0,
      explicacion: "El caudal es el volumen (o masa) de fluido que atraviesa una sección de tubería por unidad de tiempo.",
    },
    {
      id: "s5",
      enunciado: "¿Por qué es importante que los sensores estén bien calibrados en una planta alimenticia?",
      opciones: [
        "Para que el operador tenga menos trabajo",
        "Para garantizar mediciones confiables y procesos seguros",
        "Porque así consumen menos energía",
        "No es importante, solo es un detalle estético",
      ],
      correcta: 1,
      explicacion: "Un sensor mal calibrado envía datos incorrectos, lo que puede llevar a decisiones de control erróneas y comprometer la calidad o seguridad del producto.",
    },
    {
      id: "s6",
      enunciado: "Un sensor de presión ubicado en una caldera cumple la función de:",
      opciones: [
        "Regular automáticamente la presión",
        "Medir la presión interna y enviar esa información al controlador",
        "Cerrar la válvula de seguridad",
        "Encender la caldera",
      ],
      correcta: 1,
      explicacion: "El sensor solo mide y reporta; la acción de regular, cerrar o encender la ejecutan los actuadores según lo que decida el controlador.",
    },
  ],

  /* ============================================================
     NIVEL 2 — VARIABLES (controladas vs. manipuladas)
     ============================================================ */
  variables: [
    {
      id: "v1",
      enunciado: "En un proceso de pasteurización, la TEMPERATURA del producto se mantiene en 72°C. ¿Qué tipo de variable es la temperatura?",
      opciones: ["Variable manipulada", "Variable controlada", "Perturbación", "Ninguna de las anteriores"],
      correcta: 1,
      explicacion: "La temperatura es la variable controlada: es el valor que el sistema busca mantener dentro de un rango deseado.",
    },
    {
      id: "v2",
      enunciado: "Para mantener la temperatura del ejemplo anterior, el sistema abre o cierra el paso de vapor. El caudal de vapor es una variable...",
      opciones: ["Controlada", "Manipulada", "Perturbación", "De salida únicamente"],
      correcta: 1,
      explicacion: "El caudal de vapor es la variable manipulada: es la que el controlador ajusta para lograr el valor deseado en la variable controlada.",
    },
    {
      id: "v3",
      enunciado: "En un tanque de mezcla, se busca mantener el NIVEL constante ajustando la velocidad de la bomba de llenado. ¿Cuál es la variable controlada?",
      opciones: ["La velocidad de la bomba", "El nivel del tanque", "El color de la mezcla", "El tiempo de mezclado"],
      correcta: 1,
      explicacion: "El nivel es lo que se quiere mantener estable: por lo tanto es la variable controlada. La velocidad de la bomba es la variable manipulada.",
    },
    {
      id: "v4",
      enunciado: "Una ráfaga de aire frío que entra por una puerta abierta y hace bajar la temperatura del horno es un ejemplo de:",
      opciones: ["Variable manipulada", "Variable controlada", "Perturbación", "Sensor"],
      correcta: 2,
      explicacion: "Es una perturbación: un factor externo no deseado que aparta a la variable controlada de su valor objetivo.",
    },
    {
      id: "v5",
      enunciado: "En el control de caudal de una línea de llenado, ¿qué variable manipula típicamente el sistema para corregir el caudal?",
      opciones: ["La apertura de una válvula", "La temperatura ambiente", "El color del envase", "La hora del día"],
      correcta: 0,
      explicacion: "La apertura de la válvula es la variable manipulada: el sistema la ajusta para lograr el caudal deseado (variable controlada).",
    },
    {
      id: "v6",
      enunciado: "¿Cuál de estas afirmaciones es correcta?",
      opciones: [
        "La variable controlada siempre la elige el operador al azar",
        "La variable manipulada es la que el sistema ajusta para influir sobre la variable controlada",
        "Una perturbación siempre es beneficiosa para el proceso",
        "La variable controlada y la manipulada son siempre la misma",
      ],
      correcta: 1,
      explicacion: "Ese es justamente el rol de la variable manipulada: es la 'palanca' que el sistema mueve para lograr el objetivo en la variable controlada.",
    },
  ],

  /* ============================================================
     NIVEL 3 — PERTURBACIONES (resolución de fallas)
     Cada consigna simula una falla puntual; las opciones son
     acciones posibles y solo una resuelve correctamente el problema.
     ============================================================ */
  perturbaciones: [
    {
      id: "p1",
      enunciado: "La temperatura del tanque de cocción sube por encima del límite seguro. ¿Qué actuador conviene activar?",
      opciones: ["Resistencia de calentamiento", "Ventilador de enfriamiento", "Bomba de llenado", "Compresor"],
      correcta: 1,
      explicacion: "El ventilador de enfriamiento reduce la temperatura, corrigiendo la desviación por encima del rango normal.",
    },
    {
      id: "p2",
      enunciado: "El nivel del tanque cae bruscamente por una fuga menor. ¿Qué actuador ayuda a recuperar el nivel?",
      opciones: ["Válvula de drenaje", "Bomba de llenado", "Estrangulador de flujo", "Compresor"],
      correcta: 1,
      explicacion: "La bomba de llenado aumenta el nivel del tanque, compensando la pérdida por la fuga.",
    },
    {
      id: "p3",
      enunciado: "Un sensor de presión deja de enviar datos (falla de sensor). ¿Cuál es la primera acción correcta del operador?",
      opciones: [
        "Ignorar la falla y seguir operando normalmente",
        "Verificar el sensor y pasar a monitoreo manual mientras se soluciona",
        "Apagar toda la planta sin evaluar la situación",
        "Aumentar al máximo todos los actuadores",
      ],
      correcta: 1,
      explicacion: "Ante una falla de sensor, lo correcto es verificar el instrumento y monitorear manualmente la variable hasta restablecer la medición confiable.",
    },
    {
      id: "p4",
      enunciado: "La presión del sistema sube de forma sostenida. ¿Qué actuador es el adecuado para corregirla?",
      opciones: ["Compresor", "Válvula de alivio", "Bomba de caudal", "Resistencia de calentamiento"],
      correcta: 1,
      explicacion: "La válvula de alivio libera presión del sistema, devolviendo la variable a un rango seguro.",
    },
    {
      id: "p5",
      enunciado: "Una bomba falla y el caudal cae abruptamente a cero. ¿Qué debería hacer el operador antes que nada?",
      opciones: [
        "Aumentar la temperatura para compensar",
        "Detener el proceso aguas abajo y reportar la falla de la bomba",
        "Cerrar todas las válvulas de golpe sin avisar",
        "No hacer nada, se va a solucionar solo",
      ],
      correcta: 1,
      explicacion: "Ante una falla de bomba, hay que evitar que el proceso siguiente trabaje sin flujo (riesgo de daño) y reportar la falla para su reparación.",
    },
  ],

  /* ============================================================
     NIVEL 4 — LAZO ABIERTO vs. LAZO CERRADO
     ============================================================ */
  lazos: [
    {
      id: "l1",
      enunciado: "Un horno se enciende por un tiempo fijo predeterminado, sin medir la temperatura real del producto. Este es un ejemplo de:",
      opciones: ["Lazo cerrado", "Lazo abierto", "Sistema con retroalimentación", "Control PID"],
      correcta: 1,
      explicacion: "En lazo abierto no hay retroalimentación: el sistema actúa según un tiempo o valor fijo, sin verificar el resultado real.",
    },
    {
      id: "l2",
      enunciado: "Un sistema mide constantemente la temperatura del horno y ajusta la potencia de calentamiento según el valor medido. Este es un ejemplo de:",
      opciones: ["Lazo abierto", "Lazo cerrado", "Sistema sin sensores", "Control manual únicamente"],
      correcta: 1,
      explicacion: "Hay retroalimentación (se mide y se corrige en base a lo medido): eso define a un sistema de lazo cerrado.",
    },
    {
      id: "l3",
      enunciado: "¿Cuál es la principal desventaja de un sistema de lazo abierto frente a perturbaciones externas?",
      opciones: [
        "Es más caro de instalar",
        "No puede corregirse automáticamente si algo cambia en el proceso",
        "Necesita más sensores que el lazo cerrado",
        "No tiene ninguna desventaja",
      ],
      correcta: 1,
      explicacion: "Al no medir el resultado real, un sistema de lazo abierto no puede reaccionar ante perturbaciones: sigue actuando igual aunque el proceso se desvíe.",
    },
    {
      id: "l4",
      enunciado: "Una regadora de jardín programada para regar 10 minutos todos los días, sin sensor de humedad, es un ejemplo de:",
      opciones: ["Lazo cerrado", "Lazo abierto", "Control adaptativo", "Sistema con sensores redundantes"],
      correcta: 1,
      explicacion: "No mide la humedad real del suelo ni corrige según el resultado: actúa siempre igual, es lazo abierto.",
    },
    {
      id: "l5",
      enunciado: "Un tanque con sensor de nivel que activa o detiene automáticamente la bomba de llenado según el nivel medido es:",
      opciones: ["Lazo abierto", "Lazo cerrado", "Un sistema sin control", "Un actuador únicamente"],
      correcta: 1,
      explicacion: "Existe medición continua y corrección automática según esa medición: es lazo cerrado, el sensor 'retroalimenta' al sistema.",
    },
  ],

  /* ============================================================
     NIVEL 5 — MINI PLC
     Objetivos que el jugador debe resolver programando reglas
     tipo SI [variable] [condición] [valor] ENTONCES [acción].
     Cada objetivo define la condición de "planta estabilizada"
     que game.js/ui.js verifican tras ejecutar la simulación.
     ============================================================ */
  objetivosPLC: [
    {
      id: "plc1",
      consigna: "Programá una regla para que, si la temperatura supera los 90°C, se encienda el ventilador de enfriamiento.",
      variableEsperada: "temperatura",
      condicionEsperada: "mayor",
      valorEsperadoAprox: 90,
      accionEsperada: "ventilador",
    },
    {
      id: "plc2",
      consigna: "Programá una regla para que, si el nivel baja de 30%, se active la bomba de llenado.",
      variableEsperada: "nivel",
      condicionEsperada: "menor",
      valorEsperadoAprox: 30,
      accionEsperada: "bomba_llenado",
    },
    {
      id: "plc3",
      consigna: "Programá una regla para que, si la presión supera los 6 bar, se abra la válvula de alivio.",
      variableEsperada: "presion",
      condicionEsperada: "mayor",
      valorEsperadoAprox: 6,
      accionEsperada: "valvula_alivio",
    },
  ],

  /* ---------- Utilidades ---------- */

  /**
   * Devuelve el banco de consignas de opción múltiple correspondiente
   * a un tipo de nivel ("sensores" | "variables" | "perturbaciones" | "lazos").
   * Para "plc" hay que usar obtenerObjetivosPLC().
   */
  obtenerPorTipo(tipo) {
    return this[tipo] ? [...this[tipo]] : [];
  },

  obtenerObjetivosPLC() {
    return [...this.objetivosPLC];
  },

  /**
   * Devuelve una copia mezclada aleatoriamente (Fisher-Yates) de un
   * arreglo de consignas, útil para que cada partida varíe el orden.
   */
  mezclar(arregloConsignas) {
    const copia = [...arregloConsignas];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  },
};
