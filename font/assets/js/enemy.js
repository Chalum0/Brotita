class Enemy {
    constructor(x, y, wave) {
      this.x = x;
      this.y = y;
      this.radius = 15;
      this.speed = 2 + Math.floor(wave * 1.15);
      this.color = "red";
      this.health = 3 + Math.floor(wave * 1.3);
      this.strength = 20 + Math.floor(wave * 1.25);

      this.sprite = new Image();
      this.spriteType = Math.floor(Math.random() * 4); // 0 à 3, quatre types d'ennemis
      this.sprite.src = `./assets/img/enemies/${this.spriteType + 1}.png`;
      this.width = 40;
      this.height = 40;
    }
  
    update(targetX, targetY) {
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const angle = Math.atan2(dy, dx);
      this.x += Math.cos(angle) * this.speed;
      this.y += Math.sin(angle) * this.speed;
    }
    draw(ctx) {
      // Dessin avec sprite
      if (this.sprite.complete) {
        ctx.drawImage(
          this.sprite,
          this.x - this.width / 2,
          this.y - this.height / 2,
          this.width,
          this.height
        );
        
        // Indicateur de santé optionnel
        const healthWidth = 30;
        const healthHeight = 4;
        ctx.fillStyle = "rgba(80, 80, 80, 0.7)";
        ctx.fillRect(this.x - healthWidth/2, this.y - this.height/2 - 10, healthWidth, healthHeight);
        
        const currentHealthWidth = (this.health / (3 + Math.floor(this.wave * 0.5))) * healthWidth;
        ctx.fillStyle = "red";
        ctx.fillRect(this.x - healthWidth/2, this.y - this.height/2 - 10, currentHealthWidth, healthHeight);
      } else {
        // Utiliser le cercle comme fallback si l'image n'est pas chargée
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
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