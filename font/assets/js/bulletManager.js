class BulletManager {
  constructor() {
    this.bullets = [];
    this.impactEffects = [];
  }

  // Weapons will now add bullets directly to this array
  updateBullets() {
    // Update bullet positions
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      this.bullets[i].update();
      
      // Remove bullets that have gone too far
      const distanceFromOrigin = Math.hypot(this.bullets[i].x, this.bullets[i].y);
      if (distanceFromOrigin > 2000) { // Arbitrary large value
        this.bullets.splice(i, 1);
      }
    }
    
    // Update impact effects
    this.updateImpactEffects();
  }

  // Add a method to update impact effects
  updateImpactEffects() {
    const currentTime = performance.now();
    
    // Update and remove expired effects
    for (let i = this.impactEffects.length - 1; i >= 0; i--) {
      const effect = this.impactEffects[i];
      
      // Calculate how much lifetime has elapsed (0 to 1)
      const elapsedRatio = (currentTime - effect.createdAt) / effect.lifetime;
      
      if (elapsedRatio >= 1) {
        // Remove expired effects
        this.impactEffects.splice(i, 1);
      } else {
        // Update position
        effect.x += effect.vx;
        effect.y += effect.vy;
        
        // Update alpha (fade out)
        effect.alpha = 1 - elapsedRatio;
        
        // Optional: slow down particles over time
        effect.vx *= 0.95;
        effect.vy *= 0.95;
      }
    }
  }

  // Add a method to draw impact effects
  drawImpactEffects(ctx) {
    this.impactEffects.forEach(effect => {
      ctx.save();
      ctx.globalAlpha = effect.alpha;
      ctx.fillStyle = effect.color;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  createImpactEffect(x, y) {
    // Create particles for impact effect
    const particleCount = 8; // Number of particles per impact
    const colors = ['#ffffff', '#ffcc00', '#ff6600']; // White, yellow, orange

    for (let i = 0; i < particleCount; i++) {
      // Random angle for particle direction
      const angle = Math.random() * Math.PI * 2;
      
      // Random speed between 1 and 3
      const speed = 1 + Math.random() * 2;
      
      // Random size between 2 and 5
      const size = 2 + Math.random() * 3;
      
      // Random lifetime between 300ms and 600ms
      const lifetime = 300 + Math.random() * 300;
      
      // Random color from the colors array
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Create the particle
      this.impactEffects.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: size,
        color: color,
        alpha: 1,
        lifetime: lifetime,
        createdAt: performance.now()
      });
    }
  }

  checkEnemyCollision(enemies) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      for (let j = enemies.getEnemies().length - 1; j >= 0; j--) {
        const enemy = enemies.getEnemies()[j];
        
        if (distance(this.bullets[i], enemy) < this.bullets[i].radius + enemy.radius) {
          // Créer un effet d'impact
          this.createImpactEffect(this.bullets[i].x, this.bullets[i].y);
          
          // Damage enemy
          enemy.damage(this.bullets[i].strength);
          
          // Check if enemy died
          if (enemy.shouldDie()) {
            enemies.handleEnemyDeath(enemy, j);
          }
          
          // Remove bullet after hit
          this.bullets.splice(i, 1);
          break;
        }
      }
    }
  }

  drawBullets(ctx) {
    this.bullets.forEach(bullet => {
      bullet.draw(ctx);
    });
    
    // Draw impact effects
    this.drawImpactEffects(ctx);
  }
}