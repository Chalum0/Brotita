class Tree {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 15
    this.healing = 30

    this.sprite = new Image();
    this.treeType = Math.floor(Math.random() * 2); // 0 à 1, deux types d'arbres
    this.sprite.src = `./assets/img/trees/${this.treeType + 1}.png`;
    this.width = 50;
    this.height = 50;
  }

  draw(ctx) {
    if (this.sprite.complete) {
      ctx.drawImage(
        this.sprite,
        this.x - this.width / 2,
        this.y - this.height / 2,
        this.width,
        this.height
      );
    } else {
      // Cercle vert comme fallback
      ctx.fillStyle = "green";
      ctx.beginPath();
      ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  collidesWith(player) {
    const distance = Math.hypot(this.x - player.x, this.y - player.y);
    return distance < this.radius + player.radius;
  }
}