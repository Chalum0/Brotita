const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Get current wave index
waveIndex = parseInt(localStorage.getItem('waveIndex') || 0);
document.querySelector('.i-wave').innerHTML = waveIndex;

// Load player inventory from localStorage
const storedInventory = JSON.parse(localStorage.getItem('inventory') || '[]');

// Initialize game objects
const player = new Player(storedInventory);
const enemies = new EnemyManager(waveIndex);
const bullets = new BulletManager();
const trees = new TreeManager();
const coins = new CoinManager();

// Connect managers
enemies.setCoinManager(coins);

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function update() {
  // Update player position based on keyboard input
  player.update(keys);
  
  // Let weapons try to shoot at enemies
  player.updateWeapons(enemies.getEnemies(), bullets.bullets);
  
  // Update enemies and check for damage to player
  const damages = enemies.updateEnemies(player, ctx);
  player.damage(damages);
  
  // Update bullets and check for enemy collisions
  bullets.updateBullets();
  bullets.checkEnemyCollision(enemies);
  
  // Check for collectibles
  trees.checkCollisions(player);
  coins.checkCollisions(player);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  // Draw game elements in order
  trees.drawTrees(ctx);     // Background trees
  coins.drawCoins(ctx);     // Coins
  player.draw(ctx);         // Player and orbiting weapons
  enemies.drawEnemies(ctx); // Enemies
  bullets.drawBullets(ctx); // Bullets
  
  // Draw health bar
  const healthBarWidth = 200;
  const healthBarHeight = 20;
  const healthBarX = -canvas.width / 2 + 20;
  const healthBarY = -canvas.height / 2 + 20;
  
  // Background of health bar
  ctx.fillStyle = "rgba(80, 80, 80, 0.7)";
  ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
  
  // Current health
  const currentHealthWidth = (player.health / player.maxHealth) * healthBarWidth;
  ctx.fillStyle = "red";
  ctx.fillRect(healthBarX, healthBarY, currentHealthWidth, healthBarHeight);
  
  // Health bar border
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
  
  // Health text
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${Math.floor(player.health)}`, healthBarX + healthBarWidth / 2, healthBarY + healthBarHeight / 2);
  
  // Coin display
  const coinDisplayX = -canvas.width / 2 + 20;
  const coinDisplayY = -canvas.height / 2 + 50;
  ctx.fillStyle = "gold";
  ctx.beginPath();
  ctx.arc(coinDisplayX + 10, coinDisplayY + 10, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.fillText(`${totalCoins}`, coinDisplayX + 30, coinDisplayY + 10);
  
  // Weapon count display
  const weaponDisplayX = -canvas.width / 2 + 20;
  const weaponDisplayY = -canvas.height / 2 + 80; 
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.fillText(`Weapons: ${player.inventory.getWeaponCount()}`, weaponDisplayX, weaponDisplayY);
  
  ctx.textAlign = "start"; // Reset text alignment
  ctx.restore();
}

function gameLoop() {
  update();
  draw();

  if (player.isAlive()) {
    requestAnimationFrame(gameLoop);
  } else {
    // Show defeat modal
    showDefeatModal();
  }
}

// Event listeners for keyboard input
window.addEventListener("keydown", e => {
  if (e.key in keys) keys[e.key] = true;
});
window.addEventListener("keyup", e => {
  if (e.key in keys) keys[e.key] = false;
});

// Enemy spawn interval
const enemySpawnInterval = setInterval(() => {
  // Don't spawn enemies if wave is completed
  if (typeof waveCompleted === 'undefined' || !waveCompleted) {
    enemies.spawnEnemy();
  }
}, 1000);

// Function to spawn healing trees
function spawnTree() {
  const minx = 0 - window.innerWidth/2;
  const maxx = window.innerWidth/2;
  const miny = 0 - window.innerHeight/2;
  const maxy = window.innerHeight/2;

  const randomX = Math.floor(Math.random() * (maxx - minx + 1)) + minx;
  const randomY = Math.floor(Math.random() * (maxy - miny + 1)) + miny;
  trees.spawnTree(randomX, randomY);
  
  // Schedule next tree spawn
  setTimeout(spawnTree, Math.floor(Math.random() * (30 - 15 + 1)) + 15 * 1000);
}

// Before ending the game, save inventory
window.addEventListener('beforeunload', function() {
  player.saveInventory();
});

// Start the game
spawnTree();
gameLoop();