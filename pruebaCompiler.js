// pruebaCompiler.js
const fs       = require("fs");
const nearley  = require("nearley");
const grammar  = require("./parser/parser.js");
const { compileProgram } = require("./compiler/compiler");

// 1. Generar el AST (igual que antes)
const source = fs.readFileSync("./tests/ejemplo1.rbs", "utf8");
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
parser.feed(source);
if (parser.results.length !== 1) {
  console.error("Error: AST inválido o ambigüedad");
  process.exit(1);
}
const ast = parser.results[0];

// 2. Compilar a JS
const jsCode = compileProgram(ast);

// 3. Guardar o ejecutar
fs.writeFileSync("./out/ejemplo1.js", jsCode);
console.log("Código JavaScript generado en out/ejemplo1.js:"); 
console.log(jsCode);

// 4. (Opcional) Ejecutarlo dinámicamente
// eval(jsCode);
