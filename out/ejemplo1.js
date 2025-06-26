// Código generado por RoboScript
const robot = {
  avanzar: n => console.log("Avanzar " + n),
  girar: dir => console.log("Girar " + dir),
  esperar: s => console.log("Esperar " + s + "s"),
  encender: t => console.log("Encender " + t),
  apagar: t => console.log("Apagar " + t)
};

robot.avanzar(5);
robot.girar("IZQUIERDA");
if (OBSTACULO == 1) {
  robot.apagar("MOTOR");
}