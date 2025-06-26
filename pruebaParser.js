// pruebaParser.js
const fs      = require("fs");
const nearley = require("nearley");
const grammar = require("./parser/parser.js");

const source = fs.readFileSync("./tests/ejemplo1.rbs", "utf8");
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

try {
  parser.feed(source);
} catch (err) {
  console.error("Error de sintaxis:", err.message);
  process.exit(1);
}

if (parser.results.length === 0) {
  console.error("No se generó ningún AST");
  process.exit(1);
}
if (parser.results.length > 1) {
  console.warn("Gramática ambigua: múltiples árboles posibles");
}

console.log(JSON.stringify(parser.results[0], null, 2));
