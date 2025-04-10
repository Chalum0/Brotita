class Tree {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 15
    this.healing = 30
  }

  draw(ctx) {
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
    ctx.fill();
  }

  collidesWith(player) {
    const distance = Math.hypot(this.x - player.x, this.y - player.y);
    return distance < this.radius + player.radius;
  }
}