class Enemy {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 15;
      this.speed = 1.5;
      this.color = "red";
      this.health = 2;
      this.strength = 20;
    }
  
    update(targetX, targetY) {
      // Déplacement vers le joueur
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const angle = Math.atan2(dy, dx);
      this.x += Math.cos(angle) * this.speed;
      this.y += Math.sin(angle) * this.speed;
    }
  
    draw(ctx) {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    damage(amount) {
        this.health -= amount;
    }
  
    // Vérifier collision avec une autre entité
    collidesWith(other) {
      const distance = Math.hypot(this.x - other.x, this.y - other.y);
      return distance < this.radius + other.radius;
    }
  }