class BulletManager {
  constructor() {
    this.bullets = [];
  }

  shoot(enemies, player) {
    if (enemies.length === 0) return;

    let closestEnemy = enemies[0];
    if (!closestEnemy) return;
    let minDist = distance(player, closestEnemy);
    if (minDist >= player.actual_distant_range) return;

    enemies.sort((a, b) => {
      const distA = distance(a, player);
      const distB = distance(b, player);
      return distA - distB;
    });

    this.bullets.push(new Bullet(player.x, player.y, closestEnemy.x, closestEnemy.y, player.strength));
  }

  updateBullets() {
    this.bullets.forEach(bullet => {
      bullet.update()
    });
  }

  checkEnemyCollision(enemies) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      for (let j = enemies.getEnemies().length - 1; j >= 0; j--) {
        if (distance(this.bullets[i], enemies.getEnemies()[j]) < this.bullets[i].radius + enemies.getEnemies()[j].radius) {
          enemies.getEnemies()[j].damage(this.bullets[i].strength)

          if (enemies.getEnemies()[j].shouldDie()) {
            enemies.getEnemies().splice(j, 1);
          }
          this.bullets.splice(i, 1);
          break;
        }
      }
    }
  }

  drawBullets(ctx) {
    this.bullets.forEach(bullet => {
      bullet.draw(ctx)
    });
  }
}