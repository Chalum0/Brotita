class Bullet {
  constructor(x, y, tx, ty, strength) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.speed = 5;
    const dx = tx - this.x;
    const dy = ty - this.y;
    const angle = Math.atan2(dy, dx);

    this.dx = Math.cos(angle) * this.speed;
    this.dy = Math.sin(angle) * this.speed;

    this.color = "white";
    this.strength = strength;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update(){
    this.x += this.dx;
    this.y += this.dy;
  }

}