// Código generado por RoboScript
async function run() {
  robot.reset();
  robot.estado();
  for (let i = 0; i < 5; i++) {
  robot.avanzar(1);
  await robot.esperar(0.5);
}
  robot.girar("DERECHA");
  robot.estado();
  for (let i = 0; i < 5; i++) {
  robot.avanzar(1);
  await robot.esperar(0.5);
}
  robot.reset();
  robot.girar("DERECHA");
  robot.avanzar(4);
  robot.estado();
  if (robot.obstaculo() == 1) {
  robot.encender("LUZ");
  await robot.esperar(1);
  robot.apagar("LUZ");
}
  robot.estado();
}

// Ejecutar automáticamente
run();