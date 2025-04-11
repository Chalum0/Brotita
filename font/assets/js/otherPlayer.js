class OtherPlayer {
    constructor(id) {
      this.id = id;
      this.x = 0;
      this.y = 0;
      this.radius = 20;
      this.health = 100;
      this.maxHealth = 100;
      
      // Sprite setup
      this.sprite = new Image();
      this.sprite.src = './assets/img/bro/orgine.png'; // Default sprite
      this.spriteWidth = 60;
      this.spriteHeight = 60;
      
      // Weapons
      this.weapons = [];
    }
    
    updateWeapons(weaponsData) {
      this.weapons = [];
      
      // Créer des objets Weapon à partir des données
      if (weaponsData && weaponsData.length > 0) {
        weaponsData.forEach((weaponData, index) => {
          const weapon = new Weapon(
            weaponData.maxHealth || 0,
            weaponData.regeneration || 0,
            weaponData.strength || 0,
            weaponData.attack || 0,
            weaponData.range || 0,
            weaponData.speed || 0,
            weaponData.luck || 0,
            weaponData.image || null
          );
          
          // Mise à jour de la position de l'arme
          weapon.update(this.x, this.y, index, weaponsData.length);
          
          this.weapons.push(weapon);
        });
      }
    }
    
    draw(ctx) {
      // Dessin du personnage
      ctx.save();
      ctx.translate(this.x, this.y);
      
      const drawWidth = this.spriteWidth;
      const drawHeight = this.spriteHeight;
      
      // Dessin avec transparence si le joueur est blessé
      if (this.health < 30) {
        ctx.globalAlpha = 0.7;
      }
      
      // Dessiner le sprite centré
      ctx.drawImage(
        this.sprite, 
        -drawWidth/2, 
        -drawHeight/2, 
        drawWidth, 
        drawHeight
      );
      
      ctx.restore();
      
      // Dessin de la barre de vie
      const healthBarWidth = 40;
      const healthBarHeight = 5;
      const healthPercent = this.health / this.maxHealth;
      
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(this.x - healthBarWidth/2, this.y - 35, healthBarWidth, healthBarHeight);
      
      ctx.fillStyle = this.health > 30 ? "green" : "red";
      ctx.fillRect(
        this.x - healthBarWidth/2, 
        this.y - 35, 
        healthBarWidth * healthPercent, 
        healthBarHeight
      );
      
      // Dessin des armes
      this.weapons.forEach(weapon => {
        weapon.draw(ctx);
      });
    }
  }