class Player {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.color = "blue";
    this.max_health = 100;
    this.health = this.max_health;
    this.speed = 3;
    this.melee_range_value = 1;
    this.distant_range_value = 1;
    this.actual_melee_range = 70 * this.melee_range_value;
    this.actual_distant_range = 200 * this.distant_range_value;

    this.debug = false;
    this.strength = 2;
    this.invincible = false;
  }
  
  update(keys) {
    if (keys.ArrowUp) this.y -= this.speed;
    if (keys.ArrowDown) this.y += this.speed;
    if (keys.ArrowLeft) this.x -= this.speed;
    if (keys.ArrowRight) this.x += this.speed;
  }
  
  draw(ctx) {
    if (this.debug) {
      ctx.fillStyle = "pink";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.actual_distant_range - 30, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  damage(amount) {
    if (!this.invincible) {
      this.health -= amount;
      this.invincible = true;
      setTimeout(() => {
        this.invincible = false;
      }, 250)
    }
  }

  isAlive() {
    return this.health > 0;
  }

  heal(amount) {
    this.health = Math.min(this.health + amount, this.max_health)
  }

}