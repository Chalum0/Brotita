class Player {
  constructor(i, x = 0, y = 0) {
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

    this.inventory = new Inventory();
    i.forEach((weapon) => {

      const weapon1 = new Weapon(...weapon)

      this.inventory.addWeapon(weapon1)
    })

    // Charger le sprite du personnage
    this.sprite = new Image();
    this.sprite.src = localStorage.getItem('playerSprite') || './assets/img/bro/orgine.png';

    // Dimensions pour l'affichage du sprite
    this.spriteWidth = 60;
    this.spriteHeight = 60;
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

    // Dessiner le sprite si l'image est chargée
    if (this.sprite.complete) {
      ctx.drawImage(
        this.sprite,
        this.x - this.spriteWidth / 2,
        this.y - this.spriteHeight / 2,
        this.spriteWidth,
        this.spriteHeight
      );
    } else {
      // Afficher un cercle en attendant que l'image se charge
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
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


  addWeapon(weapon){
    const max_weapons = 6;
    if (this.weapons.length < max_weapons) {
      this.weapons.push(weapon)
    }
  }

  // addItem(item) {
  //   const max_weapons = 6;
  //   if (this.itemsInventory.length < max_weapons) {
  //     this.items.push(item);
  //   }
  // }

  removeItem(item) {
    this.items.splice(this.items.indexOf(item), 1);
  }

}