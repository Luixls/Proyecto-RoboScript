// simulator/simulator.js
const canvas = document.getElementById("canvas");
const ctx    = canvas.getContext("2d");

// Estado del robot
const state = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  dir: 0  // ángulo en grados: 0 mirando a la derecha
};

// Definir posición del obstáculo
const obstacle = {
  x: canvas.width / 2 + 50,
  y: canvas.height / 2,
  r: 20
};

function drawRobot() {
  ctx.save();
  ctx.translate(state.x, state.y);
  ctx.rotate((state.dir * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(15, 0);
  ctx.lineTo(-10, 10);
  ctx.lineTo(-10, -10);
  ctx.closePath();
  ctx.fillStyle = "#007bff";
  ctx.fill();
  ctx.restore();
}

function drawObstacle() {
  ctx.beginPath();
  ctx.arc(obstacle.x, obstacle.y, obstacle.r, 0, 2 * Math.PI);
  ctx.fillStyle = "#ff4136";
  ctx.fill();
}

// Limpia y dibuja escena completa
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawObstacle();
  drawRobot();
}

// API que usará el código generado
const robot = {
  avanzar: n => {
    const dist = n * 10;
    state.x += Math.cos((state.dir * Math.PI) / 180) * dist;
    state.y += Math.sin((state.dir * Math.PI) / 180) * dist;
    render();
  },
  girar: direction => {
    const giro = direction === "IZQUIERDA" ? -90 : 90;
    state.dir = (state.dir + giro + 360) % 360;
    render();
  },
  esperar: s => new Promise(res => setTimeout(res, s * 1000)),
  encender: t => console.log(`Encender: ${t}`),
  apagar: t => console.log(`Apagar: ${t}`),
  reset: () => {
    state.x = canvas.width/2;
    state.y = canvas.height/2;
    state.dir = 0;
    console.log("Reset de posición");
    render();
  },
  estado: () => {
    console.log("Estado:", { x: state.x, y: state.y, dir: state.dir });
  },
  obstaculo: () => {
    // calcula distancia al centro del obstáculo
    const dx = state.x - obstacle.x;
    const dy = state.y - obstacle.y;
    const d = Math.sqrt(dx*dx + dy*dy);
    return d < obstacle.r + 5 ? 1 : 0;
  }
};

// Inicializar escena
render();

// Si el código generado tiene llamadas asíncronas a esperar,
// debería envolverse en un async, por ejemplo:
async function run() {
  // aquí se inyectará el código generado
}
window.run = run;
