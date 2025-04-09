class Coin {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value || 1; // Valeur par défaut de 1
    this.radius = 8;
    this.collected = false;
    this.animation = 0; // Pour l'animation flottante
    
    // Charger l'image du GIF
    this.image = new Image();
    this.image.src = "./assets/img/coin.png"; // Chemin vers le GIF de la pièce
    
    // Dimensions de l'affichage
    this.width = 20;
    this.height = 20;
  }

  draw(ctx) {
    // Animation flottante
    this.animation += 0.05;
    const floatingOffset = Math.sin(this.animation) * 2;
    
    // Dessiner le GIF de la pièce
    if (this.image.complete) {
      ctx.drawImage(
        this.image,
        this.x - this.width / 2,
        this.y + floatingOffset - this.height / 2,
        this.width,
        this.height
      );
    }
    
    // Afficher la valeur pour les pièces de valeur supérieure
    if (this.value > 1) {
      ctx.fillStyle = "white";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.value, this.x, this.y + floatingOffset + this.height/2);
    }
  }

  collidesWith(player) {
    const distance = Math.hypot(this.x - player.x, this.y - player.y);
    return distance < this.radius + player.radius;
  }
}