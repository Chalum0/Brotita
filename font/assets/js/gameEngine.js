const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Récupérer l'index de vague actuel
waveIndex = parseInt(localStorage.getItem('waveIndex') || 0);
document.querySelector('.i-wave').innerHTML = waveIndex;

const player = new Player();
const enemies = new EnemyManager(waveIndex);
const bullets = new BulletManager();
const trees = new TreeManager();
const coins = new CoinManager();

enemies.setCoinManager(coins);

function updateCoinDisplay() {
  const coinDisplay = document.getElementById('coin-display');
  if (coinDisplay) {
    coinDisplay.textContent = `Coins: ${coinManager.getBalance()}`;
  }
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function updatePlayer() {
  player.update(keys);
}

function update() {
  updatePlayer();
  const damages = enemies.updateEnemies(player, ctx);
  player.damage(damages);
  bullets.updateBullets();
  trees.checkCollisions(player);
  coins.checkCollisions(player);

  bullets.checkEnemyCollision(enemies);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  // Modifier l'ordre de rendu pour que les pièces soient en dessous des ennemis
  trees.drawTrees(ctx);     // Les arbres en arrière-plan
  coins.drawCoins(ctx);     // Les pièces au-dessus des arbres mais sous les ennemis
  player.draw(ctx);         // Le joueur au-dessus des pièces
  enemies.drawEnemies(ctx); // Les ennemis au-dessus des pièces
  bullets.drawBullets(ctx); // Les balles au premier plan

  const healthBarWidth = 200;
  const healthBarHeight = 20;
  const healthBarX = -canvas.width / 2 + 20;
  const healthBarY = -canvas.height / 2 + 20;
  ctx.fillStyle = "rgba(80, 80, 80, 0.7)";
  ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
  const currentHealthWidth = (player.health / 100) * healthBarWidth;
  ctx.fillStyle = "red";
  ctx.fillRect(healthBarX, healthBarY, currentHealthWidth, healthBarHeight);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${Math.floor(player.health)}`, healthBarX + healthBarWidth / 2, healthBarY + healthBarHeight / 2);
  
  // Afficher le nombre de pièces
  const coinDisplayX = -canvas.width / 2 + 20;
  const coinDisplayY = -canvas.height / 2 + 50;
  ctx.fillStyle = "gold";
  ctx.beginPath();
  ctx.arc(coinDisplayX + 10, coinDisplayY + 10, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.fillText(`${totalCoins}`, coinDisplayX + 30, coinDisplayY + 10);
  
  ctx.textAlign = "start"; // Réinitialiser l'alignement du texte

  ctx.restore();
}

function gameLoop() {
  update();
  draw();
  

  if (player.isAlive()) {
    requestAnimationFrame(gameLoop);
  } else {
    // Afficher le modal de défaite
    showDefeatModal();
  }
}

window.addEventListener("keydown", e => {
  if (e.key in keys) keys[e.key] = true;
});
window.addEventListener("keyup", e => {
  if (e.key in keys) keys[e.key] = false;
});

// Intervalle de spawn des ennemis
const enemySpawnInterval = setInterval(() => {
  // Ne pas spawner d'ennemis si la vague est terminée
  if (typeof waveCompleted === 'undefined' || !waveCompleted) {
      enemies.spawnEnemy();
  }
}, 1000);

// Intervalle de tir des balles
setInterval(() => bullets.shoot(enemies.getEnemies(), player), 500);

// Fonction pour faire apparaître des arbres
function spawnTree() {
  const minx = 0 - window.innerWidth/2;
  const maxx = window.innerWidth/2;

  const miny = 0 - window.innerHeight/2;
  const maxy = window.innerHeight/2;

  const randomX = Math.floor(Math.random() * (maxx - minx + 1)) + minx;
  const randomY = Math.floor(Math.random() * (maxy - miny + 1)) + miny;
  trees.spawnTree(randomX, randomY);
  setTimeout(spawnTree, Math.floor(Math.random() * (30 - 15 + 1)) + 15 * 1000);
}

spawnTree();
gameLoop();