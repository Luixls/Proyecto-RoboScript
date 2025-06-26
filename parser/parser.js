// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const lexer = require("../lexer/lexer");
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "programa", "symbols": ["_", "instrucciones", "_"], "postprocess": d => ({ type: "Program", body: d[1] })},
    {"name": "instrucciones", "symbols": ["instruccion", "_", "instrucciones"], "postprocess": d => [d[0], ...d[2]]},
    {"name": "instrucciones", "symbols": ["instruccion"], "postprocess": d => [d[0]]},
    {"name": "instruccion", "symbols": ["avanzarStmt"]},
    {"name": "instruccion", "symbols": ["girarStmt"]},
    {"name": "instruccion", "symbols": ["esperarStmt"]},
    {"name": "instruccion", "symbols": ["encenderStmt"]},
    {"name": "instruccion", "symbols": ["apagarStmt"]},
    {"name": "instruccion", "symbols": ["siStmt"]},
    {"name": "instruccion", "symbols": ["mientrasStmt"]},
    {"name": "avanzarStmt", "symbols": [(lexer.has("AVANZAR") ? {type: "AVANZAR"} : AVANZAR), "_", (lexer.has("NUMERO") ? {type: "NUMERO"} : NUMERO)], "postprocess": d => ({ type: "Avanzar", value: Number(d[2].value) })},
    {"name": "girarStmt", "symbols": [(lexer.has("GIRAR") ? {type: "GIRAR"} : GIRAR), "_", (lexer.has("IZQUIERDA") ? {type: "IZQUIERDA"} : IZQUIERDA)], "postprocess": d => ({ type: "Girar",    direction: d[2].value })},
    {"name": "girarStmt", "symbols": [(lexer.has("GIRAR") ? {type: "GIRAR"} : GIRAR), "_", (lexer.has("DERECHA") ? {type: "DERECHA"} : DERECHA)], "postprocess": d => ({ type: "Girar",    direction: d[2].value })},
    {"name": "esperarStmt", "symbols": [(lexer.has("ESPERAR") ? {type: "ESPERAR"} : ESPERAR), "_", (lexer.has("NUMERO") ? {type: "NUMERO"} : NUMERO)], "postprocess": d => ({ type: "Esperar",  value: Number(d[2].value) })},
    {"name": "encenderStmt", "symbols": [(lexer.has("ENCENDER") ? {type: "ENCENDER"} : ENCENDER), "_", (lexer.has("IDENTIFICADOR") ? {type: "IDENTIFICADOR"} : IDENTIFICADOR)], "postprocess": d => ({ type: "Encender", target: d[2].value })},
    {"name": "apagarStmt", "symbols": [(lexer.has("APAGAR") ? {type: "APAGAR"} : APAGAR), "_", (lexer.has("IDENTIFICADOR") ? {type: "IDENTIFICADOR"} : IDENTIFICADOR)], "postprocess": d => ({ type: "Apagar",   target: d[2].value })},
    {"name": "numeroOId", "symbols": [(lexer.has("NUMERO") ? {type: "NUMERO"} : NUMERO)], "postprocess": d => ({ kind: "Literal",    value: Number(d[0].value) })},
    {"name": "numeroOId", "symbols": [(lexer.has("IDENTIFICADOR") ? {type: "IDENTIFICADOR"} : IDENTIFICADOR)], "postprocess": d => ({ kind: "Identifier", value: d[0].value })},
    {"name": "condicion", "symbols": [(lexer.has("IDENTIFICADOR") ? {type: "IDENTIFICADOR"} : IDENTIFICADOR), "_", "operador", "_", "numeroOId"], "postprocess":  d => ({
           type:    "Condicion",
           left:    d[0].value,
           operator:d[2],
           right:   d[4]
        }) },
    {"name": "operador", "symbols": [(lexer.has("IGUAL") ? {type: "IGUAL"} : IGUAL)], "postprocess": () => "="},
    {"name": "operador", "symbols": [(lexer.has("DIFERENTE") ? {type: "DIFERENTE"} : DIFERENTE)], "postprocess": () => "!="},
    {"name": "operador", "symbols": [(lexer.has("MAYOR") ? {type: "MAYOR"} : MAYOR)], "postprocess": () => ">"},
    {"name": "operador", "symbols": [(lexer.has("MENOR") ? {type: "MENOR"} : MENOR)], "postprocess": () => "<"},
    {"name": "siStmt", "symbols": [(lexer.has("SI") ? {type: "SI"} : SI), "_", "condicion", "_", (lexer.has("ENTONCES") ? {type: "ENTONCES"} : ENTONCES), "_", "bloque", "_", (lexer.has("FIN") ? {type: "FIN"} : FIN)], "postprocess": d => ({ type: "Si",       test: d[2],    consequent: d[6] })},
    {"name": "mientrasStmt", "symbols": [(lexer.has("MIENTRAS") ? {type: "MIENTRAS"} : MIENTRAS), "_", "condicion", "_", (lexer.has("HACER") ? {type: "HACER"} : HACER), "_", "bloque", "_", (lexer.has("FIN") ? {type: "FIN"} : FIN)], "postprocess": d => ({ type: "Mientras", test: d[2],    body:       d[6] })},
    {"name": "bloque", "symbols": ["instrucciones"], "postprocess": d => d[0]},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1$subexpression$1", "symbols": [(lexer.has("WS") ? {type: "WS"} : WS)]},
    {"name": "_$ebnf$1$subexpression$1", "symbols": [(lexer.has("NUEVA_LINEA") ? {type: "NUEVA_LINEA"} : NUEVA_LINEA)]},
    {"name": "_$ebnf$1$subexpression$1", "symbols": [(lexer.has("COMENTARIO") ? {type: "COMENTARIO"} : COMENTARIO)]},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "_$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"]}
]
  , ParserStart: "programa"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
