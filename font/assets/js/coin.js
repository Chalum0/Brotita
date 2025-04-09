class Coin {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value || 1; // Valeur par défaut de 1
    this.radius = 8;
    this.collected = false;
    this.animation = 0; // Pour l'animation flottante
  }

  draw(ctx) {
    // Animation flottante
    this.animation += 0.05;
    const floatingOffset = Math.sin(this.animation) * 2;
    
    // Dessiner la pièce
    ctx.fillStyle = "#FFD700"; // Couleur dorée
    ctx.beginPath();
    ctx.arc(this.x, this.y + floatingOffset, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Contour de la pièce
    ctx.strokeStyle = "#DAA520"; // Contour doré plus foncé
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Afficher la valeur pour les pièces de valeur supérieure
    if (this.value > 1) {
      ctx.fillStyle = "white";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.value, this.x, this.y + floatingOffset);
    }
  }

  collidesWith(player) {
    const distance = Math.hypot(this.x - player.x, this.y - player.y);
    return distance < this.radius + player.radius;
  }
}