class EnemyManager {
  constructor(wave) {
    this.wave = wave;
    this.enemies = [];
    this.coinManager = null;
  }

  setCoinManager(coinManager) {
    this.coinManager = coinManager;
  }

  getEnemies() {
    return this.enemies;
  }

  addEnemy(enemy) {
    this.enemies.push(enemy)
  }

  anyEnemies() {
    return this.enemies.length > 0;
  }

  spawnEnemy() {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.max(canvas.width, canvas.height) / 1.5;
    const x = canvas.width/2 + Math.cos(angle) * distance;
    const y = canvas.height/2 + Math.sin(angle) * distance;
    
    this.addEnemy(new Enemy(x, y))
  }

  updateEnemies(player) {
    this.enemies.sort((a, b) => {
      const distA = distance(a, player);
      const distB = distance(b, player);
      return distA - distB;
    });
    let damages = 0;

    // Ne pas déplacer les ennemis si la vague est terminée
    if (typeof waveCompleted !== 'undefined' && waveCompleted) {
      return damages;
    }

    this.enemies.forEach(enemy => {
      enemy.update(player.x, player.y);

      if (enemy.collidesWith(player)) {
        damages += enemy.strength
      }
    })
    return damages;
  }

  drawEnemies(ctx) {
    this.enemies.forEach(enemy => {
      enemy.draw(ctx)
    })
  }

  despawnAll() {
    this.enemies = [];
  }

  despawnOneEnemy() {
    if (this.enemies.length > 0) {
        // Ajoutez un petit effet visuel si vous le souhaitez
        
        // Supprimer le premier ennemi
        this.enemies.shift();
        return true;
    }
    return false;
  }

  handleEnemyDeath(enemy, index) {
    // Chance de drop de pièce basée sur la vague
    const dropChance = 0.5 + (this.wave * 0.05); // Augmente avec les vagues
    
    if (Math.random() < dropChance && this.coinManager) {
      // Faire apparaître une pièce à l'emplacement de l'ennemi
      this.coinManager.spawnCoin(enemy.x, enemy.y, this.wave);
    }
    
    // Supprimer l'ennemi
    this.enemies.splice(index, 1);
  }
}