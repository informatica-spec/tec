# CONTROL FOOD 🏭

### Simulador Inteligente de una Planta Alimenticia

Proyecto educativo desarrollado en **HTML5, CSS3 y JavaScript puro** (sin frameworks ni librerías externas), pensado para estudiantes de escuelas técnicas.

---

## 🎯 Objetivo

CONTROL FOOD es un simulador interactivo donde el jugador asume el rol de **operador de una planta alimenticia**. Mientras juega, aprende de forma visual y práctica los conceptos fundamentales de **Tecnología de Control** utilizados en la industria:

- Sistemas de control
- Automatismos
- Lazo abierto y lazo cerrado
- Variables controladas y manipuladas
- Perturbaciones
- Sensores y actuadores
- Controladores y PLC
- Temperatura, presión, nivel y caudal

No es un simple cuestionario: combina consignas conceptuales con un panel SCADA simulado, medidores animados y un editor de reglas tipo PLC.

---

## 🕹️ Cómo se juega

El jugador comienza como **Operador Junior** y debe mantener la línea de producción funcionando correctamente. Cada decisión correcta suma experiencia (XP); los errores le cuestan una vida. Al acumular XP, el operador asciende de rango:

```
Operador Junior → Operador → Supervisor → Jefe de Planta → Especialista en Automatización
```

El juego tiene 5 niveles:

| Nivel | Tema | Mecánica |
|---|---|---|
| 1 | Sensores | Identificar sensores y su función |
| 2 | Variables | Distinguir variables controladas y manipuladas |
| 3 | Perturbaciones | Resolver fallas de producción |
| 4 | Lazo abierto y cerrado | Analizar casos reales |
| 5 | Mini PLC | Programar reglas SI / ENTONCES en JavaScript (sin lenguaje Ladder) |

También hay una **Sala SCADA libre**, sin objetivos, para explorar el simulador de planta sin presión de tiempo ni vidas en juego... salvo que sí las tenga en juego, en cuyo caso son las mismas del progreso general. *(La sala libre resetea las variables pero comparte vidas y XP con el resto del juego.)*

---

## 🗂️ Estructura del proyecto

```
ControlFood/
├── index.html
├── css/
│   ├── estilos.css       → paleta SCADA, componentes base, modo oscuro/claro
│   ├── animaciones.css   → keyframes y transiciones
│   └── responsive.css    → adaptación a tablet y celular
├── js/
│   ├── config.js         → constantes globales (rangos, XP, tiempos, actuadores)
│   ├── storage.js        → persistencia en LocalStorage
│   ├── audio.js          → efectos de sonido (tolera archivos faltantes)
│   ├── simulador.js      → motor de la planta (variables, perturbaciones, PLC)
│   ├── niveles.js        → definición de niveles y progresión de rango
│   ├── preguntas.js      → banco de contenidos pedagógicos
│   ├── game.js           → orquestador: vidas, puntaje, XP, logros
│   ├── ui.js             → renderizado y manipulación del DOM
│   └── app.js            → punto de entrada de la aplicación
├── img/
│   ├── iconos/
│   ├── fondos/
│   └── sprites/
├── audio/
└── README.md
```

### Orden de carga de los scripts

`config.js → storage.js → audio.js → simulador.js → niveles.js → preguntas.js → game.js → ui.js → app.js`

Cada módulo depende únicamente de los anteriores en esta lista. `ui.js` es el único que manipula el DOM directamente; el resto expone datos y funciones puras o con efectos controlados (LocalStorage, temporizadores).

---

## ▶️ Cómo ejecutarlo

No requiere instalación ni dependencias. Simplemente abrir `index.html` en cualquier navegador moderno (Chrome, Firefox, Edge).

> Los íconos usan emojis y las variables se calculan en tiempo real, por lo que el juego funciona por completo aunque las carpetas `img/` y `audio/` estén vacías.

---

## 💾 Guardado

El progreso (rango, XP, vidas, puntaje, niveles completados y logros) se guarda automáticamente en el **LocalStorage** del navegador después de cada acción relevante. No requiere conexión a internet ni backend.

Para borrar el progreso: **Menú → ⚙️ Configuración → Reiniciar progreso**.

---

## 🎓 Uso educativo

Pensado para:

- **Estudiantes de Informática**: pueden leer, modificar y extender el código (agregar niveles, sensores, actuadores o reglas nuevas) como ejercicio de programación en JavaScript puro.
- **Estudiantes de Tecnología de Control**: pueden aprender los conceptos jugando, sin necesidad de leer código.

---

## 🛠️ Tecnologías

- HTML5 semántico
- CSS3 (variables CSS, Grid, Flexbox, animaciones)
- JavaScript ES6+ (sin frameworks, sin dependencias externas)
- LocalStorage API

---

## 📌 Estado del proyecto

Versión `0.1.0` — Uso educativo. Desarrollado por etapas, archivo por archivo, revisando funcionalidad en cada paso.
