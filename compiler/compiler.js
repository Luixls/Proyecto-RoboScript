// compiler/compiler.js

function compileProgram(program) {
  // Generamos únicamente el wrapper async run() con los nodos traducidos
  const bodyLines = program.body.flatMap(stmtArr =>
    stmtArr.map(compileNode)
  );

  return [
    `// Código generado por RoboScript`,
    `async function run() {`,
    ...bodyLines.map(line => `  ${line}`),
    `}`,
    ``,
    `// Ejecutar automáticamente`,
    `run();`
  ].join("\n");
}

function compileNode(node) {
  switch (node.type) {
    case "Avanzar":
      return `robot.avanzar(${node.value});`;
    case "Girar":
      return `robot.girar("${node.direction}");`;
    case "Esperar":
      return `await robot.esperar(${node.value});`;
    case "Encender":
      return `robot.encender("${node.target}");`;
    case "Apagar":
      return `robot.apagar("${node.target}");`;
    case "Reset":
      return `robot.reset();`;
    case "Estado":
      return `robot.estado();`;
    case "Si":
      return [
        `if (${compileCondition(node.test)}) {`,
        ...node.consequent.flatMap(stmtArr => stmtArr.map(n => `  ${compileNode(n)}`)),
        `}`
      ].join("\n");
    case "Mientras":
      return [
        `while (${compileCondition(node.test)}) {`,
        ...node.body.flatMap(stmtArr => stmtArr.map(n => `  ${compileNode(n)}`)),
        `}`
      ].join("\n");
    case "Repetir":
      return [
        `for (let i = 0; i < ${node.count}; i++) {`,
        ...node.body.flatMap(stmtArr => stmtArr.map(n => `  ${compileNode(n)}`)),
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

module.exports = { compileProgram };
