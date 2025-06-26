// pruebaLexer.js
const lexer = require("./lexer/lexer");
const fs = require("fs");

const codigoFuente = fs.readFileSync("./tests/ejemplo1.rbs", "utf8");
lexer.reset(codigoFuente);

let token;
while ((token = lexer.next())) {
  if (!["WS", "NUEVA_LINEA", "COMENTARIO"].includes(token.type)) {
    if (token.type === "ERROR") {
      console.error("Token no reconocido:", token);
      process.exit(1);
    }
    console.log(token);
  }
}
