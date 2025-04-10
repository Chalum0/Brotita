class Enemy {
    constructor(x, y, wave) {
      this.x = x;
      this.y = y;
      this.radius = 15;
      this.speed = 1.5;
      this.color = "red";
      this.health = 3 + Math.floor(wave * 1.5);
      this.strength = 20 + Math.floor(wave * 2);
    }
  
    update(targetX, targetY) {
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

    shouldDie() {
      return this.health <= 0;
    }
  
    // Vérifier collision avec une autre entité
    collidesWith(other) {
      const distance = Math.hypot(this.x - other.x, this.y - other.y);
      return distance < this.radius + other.radius;
    }
  }