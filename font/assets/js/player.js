class Player {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
      this.radius = 20;
      this.color = "blue";
      this.health = 100;
      this.speed = 3;
    }
  
    update(keys) {
      if (keys.ArrowUp) this.y -= this.speed;
      if (keys.ArrowDown) this.y += this.speed;
      if (keys.ArrowLeft) this.x -= this.speed;
      if (keys.ArrowRight) this.x += this.speed;
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
  
    isAlive() {
      return this.health > 0;
    }
  }