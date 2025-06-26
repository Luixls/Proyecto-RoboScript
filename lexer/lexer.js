// lexer/lexer.js
const moo = require("moo");

const lexer = moo.compile({
  WS: /[ \t]+/,
  COMENTARIO: { match: /#[^\n]*/, lineBreaks: false },
  NUEVA_LINEA: { match: /\r\n|\r|\n/, lineBreaks: true },

  // Palabras clave
  AVANZAR: "AVANZAR",
  GIRAR: "GIRAR",
  IZQUIERDA: "IZQUIERDA",
  DERECHA: "DERECHA",
  ESPERAR: "ESPERAR",
  ENCENDER: "ENCENDER",
  APAGAR: "APAGAR",
  SI: "SI",
  ENTONCES: "ENTONCES",
  MIENTRAS: "MIENTRAS",
  HACER: "HACER",
  FIN: "FIN",

  // Operadores lógicos
  IGUAL: "=",
  DIFERENTE: "!=",
  MAYOR: ">",
  MENOR: "<",

  // Valores
  NUMERO: /[0-9]+/,
  IDENTIFICADOR: /[A-Z_]+/,

  // Captador de Error
  ERROR: moo.error,
});

module.exports = lexer;
