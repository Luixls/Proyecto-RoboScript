# RoboScript
 
# RoboScript

RoboScript es un lenguaje de dominio específico (DSL) en español para programar el comportamiento de un robot simulado en un entorno 2D usando JavaScript y Canvas. Este proyecto incluye:

* **Lexer** (Moo.js) para tokenizar comandos en español.
* **Parser** (Nearley.js) que genera un AST.
* **Compilador** que traduce AST a JavaScript con llamadas a la API `robot`.
* **Simulador gráfico** con Canvas, que dibuja el robot y un obstáculo, y ejecuta el código generado.
* **Interfaz web** con editor de scripts, botón “Compilar y Ejecutar” y área de log.

---

## Cómo usar

1. Clona o descarga el repositorio.
2. Instala dependencias (Node.js 16+):

   ```bash
   npm install
   ```
3. Genera el bundle de la gramática para el navegador:

   ```bash
   npx nearleyc parser/grammar.ne -o simulator/grammar.js
   npx browserify simulator/grammar.js --standalone grammar -o simulator/grammar.bundle.js
   ```
4. Inicia un servidor estático (por ejemplo, Live Server en VSCode) apuntando a la carpeta `simulator/`.
5. Abre `index.html` en el navegador.
6. Escribe o edita un script RoboScript en el editor y pulsa **Compilar y Ejecutar**.

---

## Sintaxis básica

* **Comandos de movimiento**:

  * `AVANZAR <n>`: avanza `n` pasos (1 paso = 10px).
  * `GIRAR IZQUIERDA` / `GIRAR DERECHA`: gira 90°.
  * `ESPERAR <s>`: pausa `s` segundos.

* **Control de flujo**:

  * `REPETIR <n> HACER ... FIN`: bucle por contador.
  * `MIENTRAS <cond> HACER ... FIN`: bucle por condición.
  * `SI <cond> ENTONCES ... FIN`: condicional simple.

* **Instrucciones adicionales**:

  * `RESET`: vuelve a la posición inicial.
  * `ESTADO`: muestra coordenadas y orientación en la consola.
  * `ENCENDER LUZ` / `APAGAR LUZ`: simula encender/apagar indicador.

* **Condiciones**:

  * `<identificador> <operador> <valor>` donde:

    * `<identificador>` puede ser `OBSTACULO`.
    * `<operador>`: `=`, `!=`, `>`, `<`.
    * `<valor>`: número o identificador.
  * Ejemplo: `SI OBSTACULO = 1 ENTONCES ... FIN`.

---

## Ejemplos

### Detectar obstáculo

```rbs
RESET
ESTADO

MIENTRAS OBSTACULO = 0 HACER
  AVANZAR 1
  ESPERAR 0.5
FIN

SI OBSTACULO = 1 ENTONCES
  ENCENDER LUZ
FIN

ESTADO
```

### Recorrer un cuadrado

```rbs
RESET
ESTADO

REPETIR 4 HACER
  REPETIR 15 HACER
    SI OBSTACULO = 1 ENTONCES
      ENCENDER LUZ
      ESTADO
    FIN
    AVANZAR 1
    ESPERAR 0.2
  FIN
  GIRAR DERECHA
FIN

ESTADO
```

---

## Estructura del proyecto

```
project-root/
├─ lexer/             # Definición de tokens (lexer.js)
├─ parser/            # Gramática (.ne) y parser compilado
├─ compiler/          # Generador de código JS
├─ simulator/         # Interfaz web, simulator.js, main.js
│  ├─ index.html
│  ├─ styles.css
│  ├─ grammar.bundle.js
│  └─ main.js
└─ tests/             # Scripts de ejemplo (.rbs)
```

---
