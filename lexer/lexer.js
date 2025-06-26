// lexer/lexer.js
const moo = require("moo");

const lexer = moo.compile({
  WS:           /[ \t]+/,
  COMENTARIO:   { match: /#[^\n]*/, lineBreaks: false },
  NUEVA_LINEA:  { match: /\r\n|\r|\n/, lineBreaks: true },

  // Palabras clave
  AVANZAR:   "AVANZAR",
  GIRAR:     "GIRAR",
  IZQUIERDA: "IZQUIERDA",
  DERECHA:   "DERECHA",
  ESPERAR:   "ESPERAR",
  ENCENDER:  "ENCENDER",
  APAGAR:    "APAGAR",
  SI:        "SI",
  ENTONCES:  "ENTONCES",
  MIENTRAS:  "MIENTRAS",
  HACER:     "HACER",
  FIN:       "FIN",
  REPETIR:   "REPETIR",
  RESET:     "RESET",
  ESTADO:    "ESTADO",

  // Operadores
  IGUAL:      "=",
  DIFERENTE:  "!=",
  MAYOR:      ">",
  MENOR:      "<",

  // Literales (enteros o decimales) y identificadores
  NUMERO:        /[0-9]+(?:\.[0-9]+)?/,
  IDENTIFICADOR: /[A-Z_]+/,

  // Captura cualquier otro carácter no reconocido
  ERROR: moo.error
});

module.exports = lexer;
