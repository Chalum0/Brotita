class Inventory {
  constructor() {
    this.weapons = [];
    this.maxWeapons = 6;
  }

  addWeapon(weapon) {
    if (this.weapons.length < this.maxWeapons) {
      this.weapons.push(weapon);
      return true;
    }
    return false;
  }

  removeWeapon(index) {
    if (index >= 0 && index < this.weapons.length) {
      this.weapons.splice(index, 1);
      return true;
    }
    return false;
  }

  getWeapons() {
    return this.weapons;
  }
  
  getWeaponCount() {
    return this.weapons.length;
  }

  getStats() {
    let stats = {
      maxHealth: 0,
      regeneration: 0,
      strength: 0, 
      attack: 0,
      range: 0,
      speed: 0,
      luck: 0
    };
    
    this.weapons.forEach(weapon => {
      stats.maxHealth += weapon.maxHealth;
      stats.regeneration += weapon.regeneration;
      stats.strength += weapon.strength;
      stats.attack += weapon.attack;
      stats.range += weapon.range;
      stats.speed += weapon.speed;
      stats.luck += weapon.luck;
    });
    
    return stats;
  }
  
  saveToLocalStorage(key = 'inventory') {
    // Convert weapons to a simpler format for storage
    const weaponData = this.weapons.map(weapon => [
      weapon.maxHealth,
      weapon.regeneration,
      weapon.strength,
      weapon.attack,
      weapon.range,
      weapon.speed,
      weapon.luck,
      weapon.image
    ]);
    
    localStorage.setItem(key, JSON.stringify(weaponData));
  }
  
  loadFromLocalStorage(key = 'inventory') {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    this.weapons = [];
    
    data.forEach(weaponData => {
      this.addWeapon(new Weapon(...weaponData));
    });
  }
}