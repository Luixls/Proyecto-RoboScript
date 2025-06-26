// compiler/compiler.js

function compileProgram(program) {
  const header = [
    `// Código generado por RoboScript`,
    `const robot = {`,
    `  avanzar: n => console.log("Avanzar " + n),`,
    `  girar: dir => console.log("Girar " + dir),`,
    `  esperar: s => console.log("Esperar " + s + "s"),`,
    `  encender: t => console.log("Encender " + t),`,
    `  apagar: t => console.log("Apagar " + t)`,
    `};`,
    ``
  ];
  // program.body es [ [stmt], [stmt], ... ]
  const body = program.body.flatMap(stmtArr =>
    stmtArr.map(compileNode)
  );
  return [...header, ...body].join("\n");
}

function compileNode(node) {
  switch (node.type) {
    case "Avanzar":
      return `robot.avanzar(${node.value});`;
    case "Girar":
      return `robot.girar("${node.direction}");`;
    case "Esperar":
      return `robot.esperar(${node.value});`;
    case "Encender":
      return `robot.encender("${node.target}");`;
    case "Apagar":
      return `robot.apagar("${node.target}");`;
    case "Si":
      return [
        `if (${compileCondition(node.test)}) {`,
        ...node.consequent.flatMap(stmtArr => stmtArr.map(n => "  " + compileNode(n))),
        `}`
      ].join("\n");
    case "Mientras":
      return [
        `while (${compileCondition(node.test)}) {`,
        ...node.body.flatMap(stmtArr => stmtArr.map(n => "  " + compileNode(n))),
        `}`
      ].join("\n");
    default:
      throw new Error(`Nodo desconocido: ${node.type}`);
  }
}

function compileCondition(test) {
  // test.right es { kind, value }
  let rightCode;
  if (test.right.kind === "Literal") {
    rightCode = test.right.value;
  } else {
    rightCode = test.right.value;
  }
  // mapear "=" a "=="
  const op = test.operator === "=" ? "==" : test.operator;
  return `${test.left} ${op} ${rightCode}`;
}

module.exports = { compileProgram };
