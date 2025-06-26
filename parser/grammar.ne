@{%
const lexer = require("../lexer/lexer");
%}

@lexer lexer

programa       -> _ instrucciones _       {% d => ({ type: "Program", body: d[1] }) %}

instrucciones  -> instruccion _ instrucciones {% d => [d[0], ...d[2]] %} 
               | instruccion               {% d => [d[0]] %}

instruccion    -> avanzarStmt 
               | girarStmt 
               | esperarStmt 
               | encenderStmt 
               | apagarStmt 
               | siStmt 
               | mientrasStmt

avanzarStmt    -> %AVANZAR _ %NUMERO       {% d => ({ type: "Avanzar", value: Number(d[2].value) }) %}

girarStmt      -> %GIRAR _ %IZQUIERDA     {% d => ({ type: "Girar",    direction: d[2].value }) %}
               | %GIRAR _ %DERECHA       {% d => ({ type: "Girar",    direction: d[2].value }) %}

esperarStmt    -> %ESPERAR _ %NUMERO      {% d => ({ type: "Esperar",  value: Number(d[2].value) }) %}

encenderStmt   -> %ENCENDER _ %IDENTIFICADOR {% d => ({ type: "Encender", target: d[2].value }) %}

apagarStmt     -> %APAGAR  _ %IDENTIFICADOR {% d => ({ type: "Apagar",   target: d[2].value }) %}

# definimos un no-terminal para distinguir número vs identificador
numeroOId      -> %NUMERO      {% d => ({ kind: "Literal",    value: Number(d[0].value) }) %}
               | %IDENTIFICADOR {% d => ({ kind: "Identifier", value: d[0].value }) %}

# ahora la condición usa ese no-terminal
condicion      -> %IDENTIFICADOR _ operador _ numeroOId
                {% d => ({
                     type:    "Condicion",
                     left:    d[0].value,
                     operator:d[2],
                     right:   d[4]
                  }) %}

operador       -> %IGUAL      {% () => "="  %}
               | %DIFERENTE {% () => "!=" %}
               | %MAYOR     {% () => ">"  %}
               | %MENOR     {% () => "<"  %}

siStmt         -> %SI _ condicion _ %ENTONCES _ bloque _ %FIN   
                {% d => ({ type: "Si",       test: d[2],    consequent: d[6] }) %}

mientrasStmt   -> %MIENTRAS _ condicion _ %HACER _ bloque _ %FIN 
                {% d => ({ type: "Mientras", test: d[2],    body:       d[6] }) %}

bloque         -> instrucciones {% d => d[0] %}

# espacios, saltos de línea y comentarios
_              -> ( %WS | %NUEVA_LINEA | %COMENTARIO ):*
