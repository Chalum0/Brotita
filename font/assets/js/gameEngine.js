const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
  x: 0,
  y: 0,
  radius: 20,
  color: "blue",
  health: 100,
  speed: 3,
};

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};

const enemies = [];
let bullets = [];

function spawnEnemy() {
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.max(canvas.width, canvas.height) / 1.5;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;
  enemies.push({ x, y, radius: 15, speed: 1.5, color: "red" });
}

function shootBullet() {
    if (enemies.length === 0) return;
  
    let closestEnemy = enemies[0];
    let minDist = distance(player, closestEnemy);
  
    for (let i = 1; i < enemies.length; i++) {
      const dist = distance(player, enemies[i]);
      if (dist < minDist) {
        minDist = dist;
        closestEnemy = enemies[i];
      }
    }
  
    const dx = closestEnemy.x - player.x;
    const dy = closestEnemy.y - player.y;
    const angle = Math.atan2(dy, dx);
  
    bullets.push({
      x: player.x,
      y: player.y,
      radius: 5,
      speed: 5,
      dx: Math.cos(angle),
      dy: Math.sin(angle),
      color: "white"
    });
  }

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function updatePlayer() {
  if (keys.ArrowUp) player.y -= player.speed;
  if (keys.ArrowDown) player.y += player.speed;
  if (keys.ArrowLeft) player.x -= player.speed;
  if (keys.ArrowRight) player.x += player.speed;
}

function update() {
  updatePlayer();

  enemies.forEach(enemy => {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const angle = Math.atan2(dy, dx);
    enemy.x += Math.cos(angle) * enemy.speed;
    enemy.y += Math.sin(angle) * enemy.speed;

    if (distance(enemy, player) < enemy.radius + player.radius) {
      player.health -= 0.5;
    }
  });

  bullets.forEach(bullet => {
    bullet.x += bullet.dx * bullet.speed;
    bullet.y += bullet.dy * bullet.speed;
  });

  let bulletsToRemove = new Set();
  let enemiesToRemove = new Set();

  for (let i = 0; i < bullets.length; i++) {
    for (let j = 0; j < enemies.length; j++) {
      if (!bulletsToRemove.has(i) && !enemiesToRemove.has(j) &&
          distance(bullets[i], enemies[j]) < bullets[i].radius + enemies[j].radius) {
        bulletsToRemove.add(i);
        enemiesToRemove.add(j);
        break;
      }
    }
  }

    [...bulletsToRemove].sort((a, b) => b - a).forEach(i => bullets.splice(i, 1));
    [...enemiesToRemove].sort((a, b) => b - a).forEach(j => enemies.splice(j, 1));
  

  bullets = bullets.filter(b =>
    b.x >= -canvas.width/2 - 50 && b.x <= canvas.width/2 + 50 &&
    b.y >= -canvas.height/2 - 50 && b.y <= canvas.height/2 + 50
  );
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  enemies.forEach(enemy => {
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  bullets.forEach(bullet => {
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Health: ${Math.floor(player.health)}`, -canvas.width / 2 + 20, -canvas.height / 2 + 30);

  ctx.restore();
}

function gameLoop() {
  update();
  draw();
  if (player.health > 0) {
    requestAnimationFrame(gameLoop);
  } else {
    alert("Game Over!");
  }
}

window.addEventListener("keydown", e => {
  if (e.key in keys) keys[e.key] = true;
});
window.addEventListener("keyup", e => {
  if (e.key in keys) keys[e.key] = false;
});

setInterval(spawnEnemy, 1000);
setInterval(shootBullet, 300);
gameLoop();
