class EnemyManager {
  constructor(wave) {
    this.wave = wave;
    this.enemies = [];
  }

  getEnemies() {
    return this.enemies;
  }

  addEnemy(enemy) {
    this.enemies.push(enemy)
  }

  anyEnemies() {
    console.log(this.enemies.length);
    console.log(this.enemies[0]);
    return this.enemies.length > 0;
  }

  spawnEnemy() {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.max(canvas.width, canvas.height) / 1.5;
    const x = canvas.width/2 + Math.cos(angle) * distance;
    const y = canvas.height/2 + Math.sin(angle) * distance;setInterval(() => {bullets.shoot(enemies.getEnemies()[0], player)}, 300);

    this.addEnemy(new Enemy(x, y))
  }

  updateEnemies(player) {
    console.log(player.x, player.y);

    this.enemies.sort((a, b) => {
      const distA = distance(a, player);
      const distB = distance(b, player);
      console.log(distA - distB);
      return distA - distB;
    });
    let damages = 0
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
}