class BulletManager {
    constructor() {
        this.bullets = [];
    }

    shoot(closestEnemy, player) {
        if (!closestEnemy) return;
        const dx = closestEnemy.x - player.x;
        const dy = closestEnemy.y - player.y;

        const angle = Math.atan2(dy, dx);
        this.bullets.push(new Bullet(player.x, player.y, dx, dy));
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
                    // Remove this bullet and this enemy...
                    this.bullets.splice(i, 1);
                    enemies.getEnemies().splice(j, 1);
                    // ...and break since that bullet is gone now.
                    break;
                } else if (Math.abs(this.bullets[i])) {

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