// simulator/main.js

// Referencias a la UI
const editor = document.getElementById("editor");
const runBtn = document.getElementById("run");
const logDiv = document.getElementById("log");

// Construye un parser nuevo usando la gramática global
function makeParser() {
  return new nearley.Parser(
    nearley.Grammar.fromCompiled(window.grammar)
  );
}

// Funciones de compilación (misma lógica que antes)
function compileProgram(program) {
  const bodyLines = program.body.flatMap(stmtArr =>
    stmtArr.map(compileNode)
  );
  return [
    `// Código generado por RoboScript`,
    `async function run() {`,
    ...bodyLines.map(line => `  ${line}`),
    `}`,
    ``,
    `// Ejecutar inmediatamente`,
    `run();`
  ].join("\n");
}

function compileNode(node) {
  switch (node.type) {
    case "Avanzar":  return `robot.avanzar(${node.value});`;
    case "Girar":    return `robot.girar("${node.direction}");`;
    case "Esperar":  return `await robot.esperar(${node.value});`;
    case "Encender": return `robot.encender("${node.target}");`;
    case "Apagar":   return `robot.apagar("${node.target}");`;
    case "Reset":    return `robot.reset();`;
    case "Estado":   return `robot.estado();`;
    case "Si":
      return [
        `if (${compileCondition(node.test)}) {`,
        ...node.consequent.flatMap(stmtArr =>
           stmtArr.map(n => `  ${compileNode(n)}`)
        ),
        `}`
      ].join("\n");
    case "Mientras":
      return [
        `while (${compileCondition(node.test)}) {`,
        ...node.body.flatMap(stmtArr =>
           stmtArr.map(n => `  ${compileNode(n)}`)
        ),
        `}`
      ].join("\n");
    case "Repetir":
      return [
        `for (let i = 0; i < ${node.count}; i++) {`,
        ...node.body.flatMap(stmtArr =>
           stmtArr.map(n => `  ${compileNode(n)}`)
        ),
        `}`
      ].join("\n");
    default:
      throw new Error(`Nodo desconocido: ${node.type}`);
  }
}

function compileCondition(test) {
  const leftExpr = test.left === "OBSTACULO"
    ? "robot.obstaculo()"
    : test.left;
  const rightExpr = test.right.kind === "Literal"
    ? test.right.value
    : `"${test.right.value}"`;
  const op = test.operator === "=" ? "==" : test.operator;
  return `${leftExpr} ${op} ${rightExpr}`;
}

// Función para loguear mensajes
function log(msg) {
  logDiv.innerText += msg + "\n";
  logDiv.scrollTop = logDiv.scrollHeight;
}

// Al hacer clic en “Compilar y Ejecutar”
runBtn.addEventListener("click", () => {
  logDiv.innerText = "";

  const source = editor.value;
  let parser = makeParser();

  try {
    parser.feed(source);
  } catch (e) {
    return log("Error de sintaxis: " + e.message);
  }
  if (parser.results.length !== 1) {
    return log("Gramática ambigua o AST inválido.");
  }
  const ast = parser.results[0];

  const js = compileProgram(ast);
  log("JavaScript generado:\n" + js);

  // Inyectamos y ejecutamos
  const existing = document.getElementById("rs-run");
  if (existing) existing.remove();
  const tag = document.createElement("script");
  tag.id   = "rs-run";
  tag.text = js;
  document.body.appendChild(tag);
});
