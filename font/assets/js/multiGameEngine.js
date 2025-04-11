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

// Stockage des identifiants des balles
let bulletIds = {};

// Fonction pour calculer la distance entre deux points
function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Mise à jour de l'état du jeu
function update() {
  // Mise à jour de la position du joueur en fonction des entrées clavier
  player.update(keys);
  
  // Envoyer les mises à jour de position au serveur
  if (socket && roomId) {
    // Préparer les données des armes
    const weaponsData = player.inventory.getWeapons().map(weapon => ({
      maxHealth: weapon.maxHealth,
      regeneration: weapon.regeneration,
      strength: weapon.strength,
      attack: weapon.attack,
      range: weapon.range,
      speed: weapon.speed,
      luck: weapon.luck,
      image: weapon.image ? weapon.image.src : null
    }));
    
    socket.emit('player-update', {
      roomId,
      x: player.x,
      y: player.y,
      health: player.health,
      weapons: weaponsData
    });
  }
  
  // Laisser les armes tirer sur les ennemis
  player.updateWeapons(enemies.getEnemies(), bullets.bullets);
  
  // Mise à jour des ennemis et vérification des dégâts au joueur
  const damages = enemies.updateEnemies(player, ctx);
  player.damage(damages);
  
  // Mise à jour des balles et vérification des collisions avec les ennemis
  bullets.updateBullets();
  
  // Si l'hôte, gérer les collisions avec les ennemis et envoyer les mises à jour
  if (isHost) {
    const hitResults = bullets.checkEnemyCollision(enemies);
    
    hitResults.forEach(result => {
      if (result.enemyKilled) {
        // Calculer la chance de drop de pièce
        const dropChance = 0.5 + (waveIndex * 0.05);
        const dropCoin = Math.random() < dropChance;
        const coinValue = Math.floor(1 + waveIndex * 0.5);
        
        // Informer le serveur de la mort de l'ennemi
        socket.emit('enemy-killed', {
          roomId,
          enemyId: result.enemy.id,
          dropCoin,
          coinValue,
          x: result.enemy.x,
          y: result.enemy.y
        });
      }
      
      // Informer le serveur du tir
      socket.emit('bullet-hit', {
        roomId,
        bulletId: result.bullet.id,
        enemyId: result.enemy.id,
        damage: result.bullet.damage
      });
    });
  }
  
  // Vérification des collectibles
  trees.checkCollisions(player);
  
  // Vérification des pièces collectées
  const collectedCoins = coins.checkCollisions(player);
  if (collectedCoins.length > 0) {
    collectedCoins.forEach(coin => {
      socket.emit('coin-collected', {
        roomId,
        coinId: coin.id
      });
    });
  }
}

// Dessin des éléments de jeu
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  // Dessiner les éléments de jeu dans l'ordre
  trees.drawTrees(ctx);     // Arbres en arrière-plan
  coins.drawCoins(ctx);     // Pièces
  
  // Dessiner les autres joueurs
  Object.values(otherPlayers).forEach(otherPlayer => {
    otherPlayer.draw(ctx);
  });
  
  player.draw(ctx);         // Joueur et armes en orbite
  enemies.drawEnemies(ctx); // Ennemis
  bullets.drawBullets(ctx); // Balles
  
  // Dessiner la barre de vie
  const healthBarWidth = 200;
  const healthBarHeight = 20;
  const healthBarX = -canvas.width / 2 + 20;
  const healthBarY = -canvas.height / 2 + 20;
  
  // Fond de la barre de vie
  ctx.fillStyle = "rgba(80, 80, 80, 0.7)";
  ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
  
  // Vie actuelle
  const currentHealthWidth = (player.health / player.maxHealth) * healthBarWidth;
  ctx.fillStyle = "red";
  ctx.fillRect(healthBarX, healthBarY, currentHealthWidth, healthBarHeight);
  
  // Bordure de la barre de vie
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
  
  // Texte de vie
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${Math.floor(player.health)}`, healthBarX + healthBarWidth / 2, healthBarY + healthBarHeight / 2);
  
  // Affichage des pièces
  const coinDisplayX = -canvas.width / 2 + 20;
  const coinDisplayY = -canvas.height / 2 + 50;
  ctx.fillStyle = "gold";
  ctx.beginPath();
  ctx.arc(coinDisplayX + 10, coinDisplayY + 10, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.fillText(`${totalCoins}`, coinDisplayX + 30, coinDisplayY + 10);
  
  // Affichage du nombre d'armes
  const weaponDisplayX = -canvas.width / 2 + 20;
  const weaponDisplayY = -canvas.height / 2 + 80; 
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.fillText(`Weapons: ${player.inventory.getWeaponCount()}`, weaponDisplayX, weaponDisplayY);
  
  // Affichage du nombre de joueurs
  const playerDisplayX = -canvas.width / 2 + 20;
  const playerDisplayY = -canvas.height / 2 + 110;
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.fillText(`Players: ${Object.keys(otherPlayers).length + 1}`, playerDisplayX, playerDisplayY);
  
  ctx.textAlign = "start"; // Réinitialiser l'alignement du texte
  ctx.restore();
}

// Boucle principale du jeu
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

// Écouteurs d'événements pour les entrées clavier
window.addEventListener("keydown", e => {
  if (e.key in keys) keys[e.key] = true;
});
window.addEventListener("keyup", e => {
  if (e.key in keys) keys[e.key] = false;
});

// Spawn d'ennemis uniquement par l'hôte
if (isHost) {
  const enemySpawnInterval = setInterval(() => {
    // Ne pas faire apparaître d'ennemis si la vague est terminée
    if (typeof waveCompleted === 'undefined' || !waveCompleted) {
      // Faire apparaître un ennemi
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.max(canvas.width, canvas.height) / 1.5;
      const x = canvas.width/2 + Math.cos(angle) * distance;
      const y = canvas.height/2 + Math.sin(angle) * distance;
      
      // Créer un nouvel ennemi
      const enemy = new Enemy(x, y, waveIndex);
      enemy.id = `enemy-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Ajouter l'ennemi localement
      enemies.addEnemy(enemy);
      
      // Informer le serveur
      socket.emit('enemy-spawn', {
        roomId,
        enemy: {
          id: enemy.id,
          x: enemy.x,
          y: enemy.y,
          health: enemy.health
        }
      });
    }
  }, 1000);
}

// Fonction pour faire apparaître des arbres de guérison
function spawnTree() {
  const minx = 0 - window.innerWidth/2;
  const maxx = window.innerWidth/2;
  const miny = 0 - window.innerHeight/2;
  const maxy = window.innerHeight/2;

  const randomX = Math.floor(Math.random() * (maxx - minx + 1)) + minx;
  const randomY = Math.floor(Math.random() * (maxy - miny + 1)) + miny;
  trees.spawnTree(randomX, randomY);
  
  // Planifier le prochain spawn d'arbre
  setTimeout(spawnTree, Math.floor(Math.random() * (30 - 15 + 1)) + 15 * 1000);
}

// Avant de terminer le jeu, sauvegarder l'inventaire
window.addEventListener('beforeunload', function() {
  player.saveInventory();
});

// Démarrer le jeu
spawnTree();
gameLoop();