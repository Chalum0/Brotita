const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = new Player();
const enemies = new EnemyManager();
const bullets = new BulletManager();
const trees = new TreeManager();

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function updatePlayer() {
  player.update(keys);
}

function update() {
  updatePlayer();
  const damages = enemies.updateEnemies(player, ctx);
  player.damage(damages)
  bullets.updateBullets()
  trees.checkCollisions(player);

  bullets.checkEnemyCollision(enemies)
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  player.draw(ctx);
  enemies.drawEnemies(ctx)

  bullets.drawBullets(ctx)

  trees.drawTrees(ctx)

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Health: ${Math.floor(player.health)}`, -canvas.width / 2 + 20, -canvas.height / 2 + 30);

  ctx.restore();
}

function gameLoop() {
  update();
  draw();

  if (player.isAlive()) {
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

setInterval(() => {
  enemies.spawnEnemy()
}, 1000)
setInterval(() => bullets.shoot(enemies.getEnemies(), player), 500);
function spawnTree() {
  const minx = 0 - window.innerWidth/2
  const maxx = window.innerWidth/2

  const miny = 0 - window.innerHeight/2
  const maxy = window.innerHeight/2

  const randomX = Math.floor(Math.random() * (maxx - minx + 1)) + minx;
  const randomY = Math.floor(Math.random() * (maxy - miny + 1)) + miny;
  trees.spawnTree(randomX, randomY)
  setTimeout(spawnTree, Math.floor(Math.random() * (30 - 15 + 1)) + 15 * 1000)
}
spawnTree()
gameLoop();