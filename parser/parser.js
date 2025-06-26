// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require("moo");

const lexer = moo.compile({
  WS:           /[ \t]+/,
  NUEVA_LINEA:  { match: /\r?\n/, lineBreaks: true },
  COMENTARIO:   /#.*?$/,
  AVANZAR:      "AVANZAR",
  GIRAR:        "GIRAR",
  IZQUIERDA:    "IZQUIERDA",
  DERECHA:      "DERECHA",
  ESPERAR:      "ESPERAR",
  ENCENDER:     "ENCENDER",
  APAGAR:       "APAGAR",
  SI:           "SI",
  ENTONCES:     "ENTONCES",
  MIENTRAS:     "MIENTRAS",
  HACER:        "HACER",
  FIN:          "FIN",
  IGUAL:        "=",
  MAYOR:        ">",
  MENOR:        "<",
  DIFERENTE:    "!=",
  NUMERO:       /[0-9]+/,
  IDENTIFICADOR:/[a-zA-Z_][a-zA-Z0-9_]*/,
})
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "programa", "symbols": ["_", "instruccion+", "_"], "postprocess": d => d[1]},
    {"name": "instruccion", "symbols": ["_", "mover", "_"]},
    {"name": "instruccion", "symbols": ["_", "girar", "_"]},
    {"name": "instruccion", "symbols": ["_", "esperar", "_"]},
    {"name": "instruccion", "symbols": ["_", "encender", "_"]},
    {"name": "instruccion", "symbols": ["_", "apagar", "_"]},
    {"name": "instruccion", "symbols": ["_", "si", "_"]},
    {"name": "instruccion", "symbols": ["_", "mientras", "_"], "postprocess": d => d[1]},
    {"name": "mover", "symbols": ["AVANZAR", "NUMERO"], "postprocess": d => ({ tipo: "AVANZAR", pasos: Number(d[1].value) })},
    {"name": "girar", "symbols": ["GIRAR", "direccion"], "postprocess": d => ({ tipo: "GIRAR", direccion: d[1] })},
    {"name": "direccion", "symbols": ["IZQUIERDA"], "postprocess": d => d[0]},
    {"name": "direccion", "symbols": ["DERECHA"], "postprocess": d => d[0]},
    {"name": "esperar", "symbols": ["ESPERAR", "NUMERO"], "postprocess": d => ({ tipo: "ESPERAR", tiempo: Number(d[1].value) })},
    {"name": "encender", "symbols": ["ENCENDER", "IDENTIFICADOR"], "postprocess": d => ({ tipo: "ENCENDER", dispositivo: d[1].value })},
    {"name": "apagar", "symbols": ["APAGAR", "IDENTIFICADOR"], "postprocess": d => ({ tipo: "APAGAR", dispositivo: d[1].value })},
    {"name": "si", "symbols": ["SI", "condicion", "ENTONCES", "_", "instruccion+", "_", "FIN"], "postprocess": d => ({ tipo: "SI", condicion: d[1], instrucciones: d[4] })},
    {"name": "mientras", "symbols": ["MIENTRAS", "condicion", "HACER", "_", "instruccion+", "_", "FIN"], "postprocess": d => ({ tipo: "MIENTRAS", condicion: d[1], instrucciones: d[4] })},
    {"name": "condicion", "symbols": ["IDENTIFICADOR", "comparador", "valor"], "postprocess": d => ({ izquierda: d[0].value, operador: d[1], derecha: d[2] })},
    {"name": "comparador", "symbols": ["IGUAL"], "postprocess": d => d[0]},
    {"name": "comparador", "symbols": ["MAYOR"], "postprocess": d => d[0]},
    {"name": "comparador", "symbols": ["MENOR"], "postprocess": d => d[0]},
    {"name": "comparador", "symbols": ["DIFERENTE"], "postprocess": d => d[0]},
    {"name": "valor", "symbols": ["NUMERO"], "postprocess": d => Number(d[0].value)},
    {"name": "valor", "symbols": ["IDENTIFICADOR"], "postprocess": d => d[0].value},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1$subexpression$1", "symbols": ["espacio"]},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "_$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": () => null},
    {"name": "espacio", "symbols": ["WS"], "postprocess": () => null},
    {"name": "espacio", "symbols": ["NUEVA_LINEA"], "postprocess": () => null},
    {"name": "espacio", "symbols": ["COMENTARIO"], "postprocess": () => null}
]
  , ParserStart: "programa"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
