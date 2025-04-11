class Player {
  constructor(weaponData = []) {
    this.x = 0;
    this.y = 0;
    this.radius = 20;
    this.color = "blue";
    
    // Load player stats from localStorage or use defaults
    const playerStats = JSON.parse(localStorage.getItem('playerStats') || '[100,5,1,1,1,1,1]');
    this.maxHealth = playerStats[0];
    this.health = this.maxHealth;
    this.regeneration = playerStats[1];
    this.baseStrength = playerStats[2];
    this.baseAttack = playerStats[3];
    this.baseRange = playerStats[4];
    this.speed = playerStats[5] * 3; // Base movement speed multiplier
    this.baseLuck = playerStats[6];
    
    this.invincible = false;
    this.healTimer = 0;
    
    // Sprite setup
    this.sprite = new Image();
    this.sprite.src = localStorage.getItem('playerSprite') || './assets/img/bro/orgine.png';
    this.spriteWidth = 60;
    this.spriteHeight = 60;
    
    // Inventory and weapons
    this.inventory = new Inventory();
    
    // If weaponData is provided, initialize with those weapons
    if (weaponData && weaponData.length > 0) {
      weaponData.forEach(item => {
        const weapon = new Weapon(...item);
        this.inventory.addWeapon(weapon);
      });
    } else {
      // Add a default weapon if none provided
      this.inventory.addWeapon(new Weapon(0, 0, 2, 2, 1.3, 1, 10, './assets/img/weapons/1.png'));
    }
  }
  
  update(keys) {
    // Movement
    if (keys.ArrowUp) this.y -= this.speed;
    if (keys.ArrowDown) this.y += this.speed;
    if (keys.ArrowLeft) this.x -= this.speed;
    if (keys.ArrowRight) this.x += this.speed;
    
    // Update all weapons positions
    const weapons = this.inventory.getWeapons();
    const weaponCount = weapons.length;
    
    weapons.forEach((weapon, index) => {
      weapon.update(this.x, this.y, index, weaponCount);
    });
    
    // Handle health regeneration
    this.healTimer += 16.67; // ~60fps
    if (this.healTimer >= 1000) { // Every second
      this.heal(this.regeneration / 10); // Divide by 10 for a smoother regen
      this.healTimer = 0;
    }
  }
  
  draw(ctx) {
    // Dessiner la portée d'attaque comme un cercle semi-transparent
    const attackRange = this.getAttackRange();
    ctx.beginPath();
    ctx.arc(this.x, this.y, attackRange, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw player sprite
    if (this.sprite.complete) {
      ctx.drawImage(
        this.sprite,
        this.x - this.spriteWidth / 2,
        this.y - this.spriteHeight / 2,
        this.spriteWidth,
        this.spriteHeight
      );
    } else {
      // Fallback circle if sprite not loaded
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw all weapons
    this.inventory.getWeapons().forEach(weapon => {
      weapon.draw(ctx);
    });
  }
  
  damage(amount) {
    if (!this.invincible && amount > 0) {
      this.health -= amount;
      this.invincible = true;
      setTimeout(() => {
        this.invincible = false;
      }, 250);
    }
  }

  heal(amount) {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }

  isAlive() {
    return this.health > 0;
  }
  
  getAttackRange() {
    // Récupérer les statistiques combinées de toutes les armes
    const stats = this.inventory.getStats();
    
    // Calculer la portée en considérant à la fois la portée de base du joueur et celle des armes
    // Multiplier par 200 pour obtenir une valeur raisonnable en pixels
    const baseRange = this.baseRange * 100;
    const weaponRange = stats.range * 50;
    
    return baseRange + weaponRange;
  }
  
  updateWeapons(enemies, bullets) {
    if (enemies.length === 0) return;
    
    // Obtenir la portée d'attaque
    const attackRange = this.getAttackRange();
    
    // Trouver les ennemis à portée
    const enemiesInRange = enemies.filter(enemy => {
      return distance(this, enemy) <= attackRange;
    });
    
    // Si aucun ennemi à portée, ne pas tirer
    if (enemiesInRange.length === 0) return;
    
    // Ordonner les armes pour tirer à tour de rôle
    const weapons = this.inventory.getWeapons();
    let targetIndex = 0;
    
    // Distribuer les cibles aux armes prêtes à tirer
    weapons.forEach((weapon, index) => {
      if (!weapon.canShoot()) return;
      
      // Viser un ennemi différent pour chaque arme si possible (répartition des tirs)
      const targetEnemy = enemiesInRange[targetIndex % enemiesInRange.length];
      
      if (weapon.shoot(targetEnemy.x, targetEnemy.y, bullets)) {
        targetIndex++; // Passer à l'ennemi suivant seulement si le tir a réussi
      }
    });
  }
  
  addWeapon(weaponData) {
    const weapon = new Weapon(...weaponData);
    return this.inventory.addWeapon(weapon);
  }
  
  saveInventory() {
    this.inventory.saveToLocalStorage();
  }
}