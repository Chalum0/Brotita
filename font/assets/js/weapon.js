class Weapon {
  constructor(maxHealth, regeneration, strength, attack, range, speed, luck, image = null) {
    // Stats
    this.maxHealth = maxHealth;
    this.regeneration = regeneration;
    this.strength = strength;
    this.attack = attack;
    this.range = range;
    this.speed = speed;
    this.luck = luck;
    
    // Visual and positioning properties
    this.x = 0;
    this.y = 0;
    this.orbitRadius = 70; // Distance from player
    this.orbitSpeed = 0.005; // Réduit de 0.02 à 0.005 pour ralentir la rotation
    this.orbitAngle = Math.random() * Math.PI * 2; // Random starting position
    this.baseAngle = this.orbitAngle; // Garder l'angle initial pour calculer l'offset
    this.image = image || './assets/img/weapons/1.png'; // Default image
    this.sprite = new Image();
    this.sprite.src = this.image;
    this.width = 40; // Sprite dimensions
    this.height = 40;
    
    // Combat properties
    this.cooldown = 0;
    this.attackSpeed = 1000 / this.attack; // Convert to milliseconds between shots
  }

  update(playerX, playerY, index, totalWeapons) {
    // Calculate base rotation
    this.orbitAngle = this.baseAngle + (performance.now() * this.orbitSpeed * 0.001);
    
    // Calculate fixed position for each weapon based on total weapons
    let finalAngle = this.orbitAngle;
    if (totalWeapons > 1) {
      const angleOffset = (Math.PI * 2) / totalWeapons;
      finalAngle = this.orbitAngle + (angleOffset * index);
    }
    
    // Calculate position based on orbit
    this.x = playerX + Math.cos(finalAngle) * this.orbitRadius;
    this.y = playerY + Math.sin(finalAngle) * this.orbitRadius;
    
    // Update cooldown
    if (this.cooldown > 0) {
      this.cooldown -= 16.67; // Approximate time for 60fps
    }
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
      // Fallback if image not loaded
      ctx.fillStyle = "purple";
      ctx.beginPath();
      ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  canShoot() {
    return this.cooldown <= 0;
  }

  shoot(targetX, targetY, bullets) {
    if (this.canShoot()) {
      // Create a new bullet from the weapon position
      bullets.push(new Bullet(this.x, this.y, targetX, targetY, this.strength));
      // Reset cooldown
      this.cooldown = this.attackSpeed;
      return true;
    }
    return false;
  }
  
  setImage(imagePath) {
    this.image = imagePath;
    this.sprite.src = imagePath;
  }
}